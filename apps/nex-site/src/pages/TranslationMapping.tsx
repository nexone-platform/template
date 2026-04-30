import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TranslationMapping.css';
import { BO_KEYS_MANIFEST } from '../generated/bo-keys-manifest';

// Cache fonts for PDF export
const _fontCache: Record<string, string> = {};
const loadFont = async (name: string, path: string): Promise<string> => {
    if (_fontCache[name]) return _fontCache[name];
    const resp = await fetch(path);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    _fontCache[name] = btoa(binary);
    return _fontCache[name];
};

// Detect script type for font selection
const hasKorean = (text: string) => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
const hasCJK = (text: string) => /[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/.test(text);

// ISO 639-1 languages supported by MyMemory Translation API
const ISO_LANGUAGES: Array<{ code: string; name: string; native: string }> = [
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
    { code: 'sq', name: 'Albanian', native: 'Shqip' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'hy', name: 'Armenian', native: 'Հայերեն' },
    { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan' },
    { code: 'eu', name: 'Basque', native: 'Euskara' },
    { code: 'be', name: 'Belarusian', native: 'Беларуская' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'bs', name: 'Bosnian', native: 'Bosanski' },
    { code: 'bg', name: 'Bulgarian', native: 'Български' },
    { code: 'ca', name: 'Catalan', native: 'Català' },
    { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
    { code: 'cs', name: 'Czech', native: 'Čeština' },
    { code: 'da', name: 'Danish', native: 'Dansk' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'et', name: 'Estonian', native: 'Eesti' },
    { code: 'fi', name: 'Finnish', native: 'Suomi' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'gl', name: 'Galician', native: 'Galego' },
    { code: 'ka', name: 'Georgian', native: 'ქართული' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ht', name: 'Haitian Creole', native: 'Kreyòl Ayisyen' },
    { code: 'he', name: 'Hebrew', native: 'עברית' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar' },
    { code: 'is', name: 'Icelandic', native: 'Íslenska' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'ga', name: 'Irish', native: 'Gaeilge' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'kk', name: 'Kazakh', native: 'Қазақ' },
    { code: 'km', name: 'Khmer', native: 'ភាសាខ្មែរ' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'lo', name: 'Lao', native: 'ລາວ' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu' },
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
    { code: 'mk', name: 'Macedonian', native: 'Македонски' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mt', name: 'Maltese', native: 'Malti' },
    { code: 'mn', name: 'Mongolian', native: 'Монгол' },
    { code: 'my', name: 'Myanmar (Burmese)', native: 'မြန်မာ' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'no', name: 'Norwegian', native: 'Norsk' },
    { code: 'fa', name: 'Persian', native: 'فارسی' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ro', name: 'Romanian', native: 'Română' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'sr', name: 'Serbian', native: 'Српски' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    { code: 'sv', name: 'Swedish', native: 'Svenska' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'th', name: 'Thai', native: 'ภาษาไทย' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'uz', name: 'Uzbek', native: 'Oʻzbek' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'cy', name: 'Welsh', native: 'Cymraeg' },
];

interface Language {
    id: number;
    languageCode: string;
    languageName: string;
    description: string;
    isActive: boolean;
}

interface TranslationGrouped {
    pageKey: string;
    labelKey: string;
    values: Record<string, { id: number; value: string }>;
}

const API = `${API_BASE_URL}/translations`;

export default function TranslationMapping() {
    const { showToast, showConfirm } = useToast();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [translations, setTranslations] = useState<TranslationGrouped[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [selectedSection, setSelectedSection] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editedCells, setEditedCells] = useState<Record<string, string>>({}); // "rowId" → value
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const { t, getUsedKeys } = useLanguage();

    // Add key modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPageKey, setNewPageKey] = useState('');
    const [newValues, setNewValues] = useState<Record<string, string>>({});

    // Add language modal
    const [showLangModal, setShowLangModal] = useState(false);
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangName, setNewLangName] = useState('');
    const [newLangDesc, setNewLangDesc] = useState('');
    const [langSearch, setLangSearch] = useState('');
    const [isAddingLang, setIsAddingLang] = useState(false);

    // Delete language modal
    const [showDeleteLangModal, setShowDeleteLangModal] = useState(false);
    const [deletingLang, setDeletingLang] = useState<Language | null>(null);
    const [isDeletingLang, setIsDeletingLang] = useState(false);

    // Scan untranslated
    const [showUntranslated, setShowUntranslated] = useState(false);
    const [scanLangFilter, setScanLangFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Row selection for export
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [exportOnlySelected, setExportOnlySelected] = useState(false);

    // Gen translations state
    const [isGenBackoffice, setIsGenBackoffice] = useState(false);

    // Filter out already-added languages
    const availableIsoLanguages = useMemo(() => {
        const existingCodes = new Set(languages.map(l => l.languageCode));
        return ISO_LANGUAGES.filter(l => !existingCodes.has(l.code));
    }, [languages]);

    // Filter by search in dropdown
    const filteredIsoLanguages = useMemo(() => {
        if (!langSearch) return availableIsoLanguages;
        const q = langSearch.toLowerCase();
        return availableIsoLanguages.filter(l =>
            l.code.includes(q) || l.name.toLowerCase().includes(q) || l.native.includes(q)
        );
    }, [availableIsoLanguages, langSearch]);

    const fetchLanguages = useCallback(async () => {
        const res = await fetch(`${API}/languages`);
        const data = await res.json();
        setLanguages(data);
    }, []);

    const fetchTranslations = useCallback(async () => {
        const res = await fetch(API);
        const data = await res.json();
        setTranslations(data);
    }, []);

    const fetchSections = useCallback(async () => {
        const res = await fetch(`${API}/sections`);
        const data = await res.json();
        setSections(data);
    }, []);

    useEffect(() => {
        fetchLanguages();
        fetchTranslations();
        fetchSections();
    }, [fetchLanguages, fetchTranslations, fetchSections]);

    // Track edits by translation row ID
    const handleEdit = (rowId: number, value: string) => {
        setEditedCells((prev) => ({ ...prev, [String(rowId)]: value }));
    };

    // Also update local state for immediate display
    const handleCellChange = (labelKey: string, langCode: string, rowId: number, value: string) => {
        handleEdit(rowId, value);
        setTranslations((prev) =>
            prev.map((t) =>
                t.labelKey === labelKey
                    ? {
                        ...t,
                        values: {
                            ...t.values,
                            [langCode]: { ...t.values[langCode], value },
                        },
                    }
                    : t
            )
        );
    };

    // Bulk save
    const handleSave = async () => {
        const items = Object.entries(editedCells).map(([id, labelValue]) => ({
            id: Number(id),
            labelValue,
        }));

        if (items.length === 0) {
            setSaveMessage('ไม่มีการเปลี่ยนแปลง');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API}/bulk`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
            const data = await res.json();
            setSaveMessage(`✅ บันทึกสำเร็จ (${data.updated} รายการ)`);
            setEditedCells({});
        } catch {
            setSaveMessage('❌ เกิดข้อผิดพลาดในการบันทึก');
        }
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    // Map to normalize raw pageKey → display group
    // e.g. 'bo.nav' → 'bo', 'bo.settings.email' → 'bo', 'cms.hero' → 'hero'
    const normalizeSectionKey = (key: string): string => {
        if (key.startsWith('bo.') || key === 'bo' || key === 'backoffice') return 'bo';
        if (key.startsWith('cms.')) {
            const base = key.replace('cms.', '').replace(/_\d+$/, '');
            return base;
        }
        return key;
    };

    // Auto-generate labelKey from section + next available number
    const generatedLabelKey = useMemo(() => {
        const section = newPageKey.trim();
        if (!section || section === '__custom') return '';
        // Count existing keys in this section (both raw and normalized)
        const existingKeys = translations
            .filter(t => normalizeSectionKey(t.pageKey) === normalizeSectionKey(section))
            .map(t => t.labelKey);
        // Find next available number
        let n = existingKeys.length + 1;
        let candidate = `${section}.item_${n}`;
        while (existingKeys.includes(candidate)) {
            n++;
            candidate = `${section}.item_${n}`;
        }
        return candidate;
    }, [newPageKey, translations]);

    // Add new key
    const handleAddKey = async () => {
        const labelKey = generatedLabelKey;
        if (!labelKey) return;
        const pageKey = newPageKey.trim();
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ labelKey, pageKey, values: newValues }),
        });
        const data = await res.json();
        if (data.success) {
            setNewPageKey('');
            setNewValues({});
            setShowAddModal(false);
            fetchTranslations();
            fetchSections();
            setSaveMessage('✅ Added key: ' + labelKey);
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            showToast(data.message || 'Error adding key', 'error');
        }
    };

    // Select a language from dropdown → auto-fill fields
    const handleSelectLanguage = (lang: { code: string; name: string; native: string }) => {
        setNewLangCode(lang.code);
        setNewLangName(lang.name);
        setNewLangDesc(lang.native);
        setLangSearch('');
    };

    // Add new language
    const handleAddLanguage = async () => {
        if (!newLangCode.trim() || !newLangName.trim()) return;
        setIsAddingLang(true);
        setSaveMessage('⏳ Auto-translating... this may take ~20 seconds');
        try {
            const res = await fetch(`${API}/languages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ languageCode: newLangCode, languageName: newLangName, description: newLangDesc }),
            });
            const data = await res.json();
            if (data.success) {
                const keysCreated = data.data?.translationsCreated ?? 0;
                setNewLangCode('');
                setNewLangName('');
                setNewLangDesc('');
                setLangSearch('');
                setShowLangModal(false);
                fetchLanguages();
                fetchTranslations();
                fetchSections();
                setSaveMessage(`✅ Added language: ${newLangName} (${keysCreated} translation keys auto-translated)`);
                setTimeout(() => setSaveMessage(''), 5000);
            } else {
                showToast(data.message || 'Error adding language', 'error');
            }
        } catch {
            showToast('Network error while adding language', 'error');
        }
        setIsAddingLang(false);
    };

    // Toggle language active/inactive
    const handleToggleLanguage = async (lang: Language) => {
        await fetch(`${API}/languages/${lang.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !lang.isActive }),
        });
        fetchLanguages();
    };

    // Delete language + all its translations
    const handleDeleteLanguage = async (lang: Language) => {
        // Prevent deleting last language
        if (languages.length <= 1) {
            showToast('Cannot delete the last remaining language.', 'warning');
            return;
        }
        setDeletingLang(lang);
        setShowDeleteLangModal(true);
    };

    const confirmDeleteLanguage = async () => {
        if (!deletingLang) return;
        setIsDeletingLang(true);
        try {
            const res = await fetch(`${API}/languages/${deletingLang.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchLanguages();
                fetchTranslations();
                setSaveMessage(`🗑️ Deleted language: ${deletingLang.languageName} (${deletingLang.languageCode.toUpperCase()})`);
                setTimeout(() => setSaveMessage(''), 4000);
            } else {
                showToast('Failed to delete language', 'error');
            }
        } catch {
            showToast('Network error while deleting language', 'error');
        }
        setIsDeletingLang(false);
        setShowDeleteLangModal(false);
        setDeletingLang(null);
    };

    // Delete key
    const handleDeleteKey = async (labelKey: string) => {
        const ok = await showConfirm({
            title: 'ลบ Translation Key',
            message: `ต้องการลบ key "${labelKey}" ทุกภาษาหรือไม่?`,
            confirmText: 'ยืนยันลบ',
            variant: 'danger',
        });
        if (!ok) return;
        await fetch(`${API}/key/${encodeURIComponent(labelKey)}`, { method: 'DELETE' });
        fetchTranslations();
    };

    // Gen Frontend: (currently disabled - button removed)
    // const handleGenFrontend = async () => { ... };

    // Gen Backoffice: generate translation keys for backoffice UI
    const handleGenBackoffice = async () => {
        setIsGenBackoffice(true);
        try {
            // Collect keys from: 1) build-time manifest (100% coverage) + 2) runtime detection
            const runtimeKeys = getUsedKeys();
            const usedKeys = { ...BO_KEYS_MANIFEST, ...runtimeKeys };
            const boKeyCount = Object.keys(usedKeys).filter(k => k.startsWith('bo.')).length;

            const res = await fetch(`${API}/generate-bo-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usedKeys }),
            });
            const data = await res.json();
            if (data.success) {
                fetchTranslations();
                fetchSections();
                setSaveMessage(`✅ Gen Backoffice สำเร็จ! สร้าง ${data.created} keys ใหม่, ข้าม ${data.skipped} keys (พบ ${boKeyCount} keys จาก UI)`);
                setTimeout(() => setSaveMessage(''), 8000);
            } else {
                setSaveMessage(`❌ ${data.message || 'Error'}`);
                setTimeout(() => setSaveMessage(''), 4000);
            }
        } catch {
            setSaveMessage('❌ เกิดข้อผิดพลาดในการ Gen Backoffice');
            setTimeout(() => setSaveMessage(''), 4000);
        }
        setIsGenBackoffice(false);
    };

    // Helper: check if a cell is untranslated
    // Detects: exact EN match, empty, case-insensitive EN match, ASCII-only for non-Latin scripts
    const NON_LATIN_LANGS = new Set(['ja', 'ko', 'th', 'zh', 'ar', 'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'my', 'km', 'lo', 'ka', 'am', 'ne', 'si', 'mn', 'uk', 'ru', 'bg', 'mk', 'el']);
    const SKIP_SCAN_LANGS = new Set(['en', 'th']);
    // Keys that contain data not meant to be translated (phone, email, address, etc.)
    const SKIP_SCAN_KEYS = new Set([
        'footer.phone', 'footer.email', 'footer.line',
        'contact.phone', 'contact.email', 'contact.line',
        'contact.address', 'contact.officeAddress',
        'contact.label.line', 'contact.stat.helpdesk',
    ]);
    const isUntranslated = (t: TranslationGrouped, langCode: string): boolean => {
        if (SKIP_SCAN_LANGS.has(langCode)) return false;
        if (SKIP_SCAN_KEYS.has(t.labelKey)) return false;
        const enVal = t.values['en']?.value?.trim() || '';
        const curVal = t.values[langCode]?.value?.trim() || '';

        // 1. Empty or missing value
        if (!curVal) return true;

        // 2. Exact match with EN
        if (enVal && curVal === enVal) return true;

        // 3. Case-insensitive match with EN
        if (enVal && curVal.toLowerCase() === enVal.toLowerCase()) return true;

        // 4. For non-Latin script languages: value is ASCII-only (looks English)
        if (NON_LATIN_LANGS.has(langCode) && enVal && /^[\x20-\x7E]+$/.test(curVal)) return true;

        return false;
    };

    // Count untranslated keys per language
    const untranslatedCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const nonEnLangs = languages.filter(l => l.isActive && !SKIP_SCAN_LANGS.has(l.languageCode));
        for (const lang of nonEnLangs) {
            counts[lang.languageCode] = translations.filter(t => isUntranslated(t, lang.languageCode)).length;
        }
        return counts;
    }, [translations, languages]);

    const totalUntranslated = Object.values(untranslatedCounts).reduce((a, b) => a + b, 0);



    const sectionLabels: Record<string, string> = {
        bo: 'Backoffice',
        nav: 'Header Bar',
        hero: 'Hero Section',
        features: 'Features / Services',
        techstack: 'Technology Stack',
        stats: 'Stats & About',
        testimonials: 'Testimonials',
        portfolio: 'Portfolio',
        cta: 'Call To Action',
        careers: 'Careers',
        contact: 'Contact Form',
        contactform: 'Contact Form',
        footer: 'Footer',
        common: 'Common / Shared',
        whyus: 'Why Us',
        privacy: 'Privacy Policy',
        jobapp: 'Job Application',
        jobForm: 'Job Application',
        general: 'General',
    };

    // Build normalized & deduplicated section list for the dropdown
    const normalizedSections = useMemo(() => {
        const seen = new Set<string>();
        const result: Array<{ raw: string; normalized: string; label: string }> = [];
        for (const s of sections) {
            const norm = normalizeSectionKey(s);
            if (seen.has(norm)) continue;
            seen.add(norm);
            result.push({ raw: s, normalized: norm, label: sectionLabels[norm] || norm });
        }
        // Sort alphabetically by label
        result.sort((a, b) => a.label.localeCompare(b.label));
        return result;
    }, [sections]);

    // Filter by section + search + untranslated
    const filtered = translations.filter((t) => {
        // Section filter (use normalized key matching)
        if (selectedSection !== 'all') {
            const norm = normalizeSectionKey(t.pageKey);
            if (norm !== selectedSection) return false;
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                t.labelKey.toLowerCase().includes(q) ||      // KEY REFERENCE
                Object.values(t.values).some(v => v.value.toLowerCase().includes(q)); // translation text
            if (!matchesSearch) return false;
        }
        // Untranslated filter
        if (showUntranslated) {
            const nonEnLangs = languages.filter(l => l.isActive && !SKIP_SCAN_LANGS.has(l.languageCode));
            const langsToCheck = scanLangFilter === 'all'
                ? nonEnLangs
                : nonEnLangs.filter(l => l.languageCode === scanLangFilter);
            return langsToCheck.some(l => isUntranslated(t, l.languageCode));
        }
        return true;
    });

    const activeLanguages = languages.filter((l) => l.isActive);
    const hasChanges = Object.keys(editedCells).length > 0;

    // Pagination computed
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalFiltered);
    const paginatedRows = filtered.slice(startIdx, endIdx);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [selectedSection, searchQuery, showUntranslated, scanLangFilter, pageSize]);

    // Selection helpers
    const allPageSelected = paginatedRows.length > 0 && paginatedRows.every(r => selectedKeys.has(r.labelKey));
    const someSelected = selectedKeys.size > 0;
    const toggleSelectAll = () => {
        setSelectedKeys(prev => {
            const next = new Set(prev);
            if (allPageSelected) {
                paginatedRows.forEach(r => next.delete(r.labelKey));
            } else {
                paginatedRows.forEach(r => next.add(r.labelKey));
            }
            return next;
        });
    };
    const toggleSelectRow = (key: string) => {
        setSelectedKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    // Get rows for export
    const getExportRows = () => {
        if (someSelected) {
            return filtered.filter(r => selectedKeys.has(r.labelKey));
        }
        return filtered;
    };

    // Build table data for export
    const buildExportData = () => {
        const rows = getExportRows();
        const langs = activeLanguages;
        return rows.map(r => {
            const row: Record<string, string> = {
                'Section': r.pageKey,
            };
            langs.forEach(l => {
                row[`${l.languageName} (${l.languageCode.toUpperCase()})`] = r.values[l.languageCode]?.value || '';
            });
            return row;
        });
    };

    // Export XLSX
    const handleExportXLSX = () => {
        const data = buildExportData();
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const colCount = headers.length;

        // Date format DD/MM/YYYY HH:mm
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const dateStr = `${dd}/${mm}/${yyyy} ${hh}:${mi}`;

        // Build rows: title, date, blank, header, data
        const aoa: (string | number)[][] = [
            ['Translation Management — Export'],
            [`วันที่ Export: ${dateStr}`],
            [],
            headers,
            ...data.map(row => headers.map(h => row[h] || '')),
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Merge title & date rows across all columns
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } });
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } });

        // Column widths
        ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));

        // Style: Title row
        const titleCell = ws['A1'];
        if (titleCell) titleCell.s = {
            font: { bold: true, sz: 16, color: { rgb: '1E293B' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };

        // Style: Date row
        const dateCell = ws['A2'];
        if (dateCell) dateCell.s = {
            font: { italic: true, sz: 10, color: { rgb: '64748B' } },
            alignment: { horizontal: 'center' },
        };

        // Style: Header row (row index 3) — indigo background, white bold text
        for (let c = 0; c < colCount; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 3, c });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
                    fill: { fgColor: { rgb: '6366F1' } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        bottom: { style: 'thin', color: { rgb: '4F46E5' } },
                    },
                };
            }
        }

        // Style: Data rows — light borders
        for (let r = 4; r < aoa.length; r++) {
            for (let c = 0; c < colCount; c++) {
                const cellRef = XLSX.utils.encode_cell({ r, c });
                if (ws[cellRef]) {
                    ws[cellRef].s = {
                        font: { sz: 10 },
                        border: {
                            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                            right: { style: 'thin', color: { rgb: 'E2E8F0' } },
                        },
                    };
                }
            }
        }

        // Autofilter on header row
        const lastRow = aoa.length;
        const lastColLetter = XLSX.utils.encode_col(colCount - 1);
        ws['!autofilter'] = { ref: `A4:${lastColLetter}${lastRow}` };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Translations');
        XLSX.writeFile(wb, `translations_${yyyy}-${mm}-${dd}.xlsx`);
    };

    // Export CSV
    const handleExportCSV = () => {
        const data = buildExportData();
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const dateStr = `${dd}/${mm}/${yyyy} ${hh}:${mi}`;

        const csvRows = [
            `"Translation Management — Export"`,
            `"วันที่ Export: ${dateStr}"`,
            '',
            headers.map(h => `"${h}"`).join(','),
            ...data.map(row => headers.map(h => {
                const val = (row[h] || '').replace(/"/g, '""');
                return `"${val}"`;
            }).join(','))
        ];
        const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `translations_${yyyy}-${mm}-${dd}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // Export PDF (jsPDF + autoTable with multi-font — instant download)
    const handleExportPDF = async () => {
        const data = buildExportData();
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const dateStr = `${dd}/${mm}/${yyyy} ${hh}:${mi}`;

        // Load & register fonts
        const [thaiFont, jpFont, krFont] = await Promise.all([
            loadFont('NotoSansThai', '/fonts/NotoSansThai-Regular.ttf'),
            loadFont('NotoSansJP', '/fonts/NotoSansJP-Regular.ttf'),
            loadFont('NotoSansKR', '/fonts/NotoSansKR-Regular.ttf'),
        ]);
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.addFileToVFS('NotoSansThai.ttf', thaiFont);
        doc.addFont('NotoSansThai.ttf', 'NotoSansThai', 'normal');
        doc.addFont('NotoSansThai.ttf', 'NotoSansThai', 'bold');
        doc.addFileToVFS('NotoSansJP.ttf', jpFont);
        doc.addFont('NotoSansJP.ttf', 'NotoSansJP', 'normal');
        doc.addFont('NotoSansJP.ttf', 'NotoSansJP', 'bold');
        doc.addFileToVFS('NotoSansKR.ttf', krFont);
        doc.addFont('NotoSansKR.ttf', 'NotoSansKR', 'normal');
        doc.addFont('NotoSansKR.ttf', 'NotoSansKR', 'bold');
        doc.setFont('NotoSansThai');

        // Title
        doc.setFontSize(16);
        doc.text('Translation Management \u2014 Export', doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });

        // Date
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 Export: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Table with per-cell font detection
        // Calculate column widths: Section=30, Key=45, languages share the rest
        const pageW = 297 - 8 * 2; // A4 landscape - margins
        const fixedW = 40; // Section
        const langCols = headers.length - 1;
        const langW = langCols > 0 ? (pageW - fixedW) / langCols : 50;
        const columnStyles: Record<number, any> = {};
        headers.forEach((_h, i) => {
            if (i === 0) columnStyles[i] = { cellWidth: 40 }; // Section
            else columnStyles[i] = { cellWidth: langW }; // Language columns
        });

        autoTable(doc, {
            head: [headers],
            body: data.map(row => headers.map(h => row[h] || '')),
            startY: 22,
            styles: { font: 'NotoSansThai', fontSize: 8, fontStyle: 'bold', cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles,
            margin: { top: 22 },
            tableWidth: 'auto',
            didParseCell: (hookData: any) => {
                const cellText = String(hookData.cell?.text?.join?.('') || '');
                if (hasKorean(cellText)) {
                    hookData.cell.styles.font = 'NotoSansKR';
                    hookData.cell.styles.textColor = [0, 0, 0]; // pure black
                } else if (hasCJK(cellText)) {
                    hookData.cell.styles.font = 'NotoSansJP';
                    hookData.cell.styles.textColor = [0, 0, 0]; // pure black
                }
            },
        });

        doc.save(`translations_${yyyy}-${mm}-${dd}.pdf`);
    };


    return (
        <div className="translation-page">
            {/* Header removed to save space */}

            {/* Filter Bar */}
            <div className="translation-filter-bar">
                <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="section-filter"
                >
                    <option value="all">{t('bo.lang.allSections', 'All Sections')}</option>
                    {normalizedSections.map((s) => (
                        <option key={s.normalized} value={s.normalized}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <div className="search-box">
                    <span className="search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by section, key, or text content..."
                        className="search-input"
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Scan Untranslated Bar + Language Badges + Action Buttons */}
            <div className={`scan-bar ${showUntranslated ? 'scan-active' : ''}`}>
                <div className="scan-left">
                    {/* Language Badges inline */}
                    <div className="language-badges">
                        {languages.map((lang) => (
                            <div key={lang.id} className={`language-badge ${lang.isActive ? 'active' : 'inactive'}`} title={lang.languageName}>
                                <span className="lang-code">{lang.languageCode.toUpperCase()}</span>
                                <button
                                    className="lang-toggle"
                                    onClick={() => handleToggleLanguage(lang)}
                                    title={lang.isActive ? 'Disable' : 'Enable'}
                                >
                                    {lang.isActive ? '●' : '○'}
                                </button>
                                <button
                                    className="lang-delete"
                                    onClick={() => handleDeleteLanguage(lang)}
                                    title={`Delete ${lang.languageName}`}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button className="add-lang-btn" onClick={() => setShowLangModal(true)}>
                            + {t('bo.lang.addLanguage', 'Language')}
                        </button>
                    </div>

                    <span className="scan-divider">|</span>

                    <button
                        className={`scan-btn ${showUntranslated ? 'active' : ''}`}
                        onClick={() => setShowUntranslated(!showUntranslated)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        {showUntranslated ? t('bo.lang.showAll', 'Show All') : t('bo.lang.scanUntranslated', 'Filter Untranslated')}
                        {totalUntranslated > 0 && (
                            <span className="scan-badge">{totalUntranslated}</span>
                        )}
                    </button>
                    {showUntranslated && (
                        <select
                            className="scan-lang-select"
                            value={scanLangFilter}
                            onChange={(e) => setScanLangFilter(e.target.value)}
                        >
                            <option value="all">All Languages ({totalUntranslated})</option>
                            {languages.filter(l => l.isActive && !SKIP_SCAN_LANGS.has(l.languageCode)).map(l => (
                                <option key={l.languageCode} value={l.languageCode}>
                                    {l.languageName} ({untranslatedCounts[l.languageCode] || 0})
                                </option>
                            ))}
                        </select>
                    )}

                    {showUntranslated && (
                        <span className="scan-info-inline">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            {filtered.length} key(s)
                        </span>
                    )}

                    {saveMessage && <span className="save-message">{saveMessage}</span>}
                    <button
                        className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                    >
                        {isSaving ? t('bo.lang.saving', 'Saving...') : t('bo.lang.saveChanges', 'Save Changes')}
                    </button>
                    <button className="add-key-btn" onClick={() => {
                        setNewPageKey('');
                        setNewValues(Object.fromEntries(activeLanguages.map((l) => [l.languageCode, ''])));
                        setShowAddModal(true);
                    }}>+ {t('bo.lang.addKey', 'Add Key')}</button>
                    <button
                        className="add-key-btn gen-backoffice-btn"
                        onClick={handleGenBackoffice}
                        disabled={isGenBackoffice}
                        title="Generate translation keys for backoffice UI (bo.* keys)"
                    >
                        {isGenBackoffice ? (
                            <><svg className="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> กำลัง Gen...</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z"/></svg> Gen Backoffice</>
                        )}
                    </button>
                </div>
            </div>

            {/* Toolbar: Entries + Export */}
            <div className="table-toolbar">
                <div className="paging-entries-bar">
                    <span className="paging-entries-label">แสดง</span>
                    <select
                        className="paging-select"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        {[10, 25, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span className="paging-entries-label">รายการ</span>
                </div>
                <div className="export-bar">
                    <button className="export-btn export-xlsx" onClick={handleExportXLSX} title="Export Excel">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        XLSX
                    </button>
                    <button className="export-btn export-csv" onClick={handleExportCSV} title="Export CSV">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        CSV
                    </button>
                    <button className="export-btn export-pdf" onClick={handleExportPDF} title="Export PDF">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        PDF
                    </button>
                    <label className="export-selected-label">
                        <input
                            type="checkbox"
                            checked={exportOnlySelected}
                            onChange={(e) => setExportOnlySelected(e.target.checked)}
                        />
                        เฉพาะที่เลือก {someSelected && `(${selectedKeys.size})`}
                    </label>
                </div>
            </div>

            {/* Table */}
            <div className="translation-table-wrapper">
                <table className="translation-table">
                    <thead>
                        <tr>
                            <th className="col-check">
                                <input
                                    type="checkbox"
                                    checked={allPageSelected}
                                    onChange={toggleSelectAll}
                                    title="เลือกทั้งหมด"
                                />
                            </th>
                            <th className="col-section">{t('bo.lang.section', 'SECTION')}</th>
                            {activeLanguages.map((lang) => (
                                <th key={lang.languageCode} className="col-lang">
                                    {lang.languageName} ({lang.languageCode.toUpperCase()})
                                </th>
                            ))}
                            <th className="col-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.map((t) => (
                            <tr key={t.labelKey} className={
                                Object.values(t.values).some((v) => editedCells[String(v.id)] !== undefined)
                                    ? 'row-edited'
                                    : ''
                            }>
                                <td className="col-check">
                                    <input
                                        type="checkbox"
                                        checked={selectedKeys.has(t.labelKey)}
                                        onChange={() => toggleSelectRow(t.labelKey)}
                                    />
                                </td>
                                <td className="col-section">
                                    <span className={`section-badge section-${normalizeSectionKey(t.pageKey)}`} title={t.pageKey}>
                                        {sectionLabels[normalizeSectionKey(t.pageKey)] || t.pageKey}
                                    </span>
                                </td>
                                {activeLanguages.map((lang) => {
                                    const cell = t.values[lang.languageCode];
                                    return (
                                        <td key={lang.languageCode} className={`col-lang ${showUntranslated && isUntranslated(t, lang.languageCode) ? 'cell-untranslated' : ''}`}>
                                            <input
                                                type="text"
                                                value={cell?.value || ''}
                                                onChange={(e) =>
                                                    cell
                                                        ? handleCellChange(t.labelKey, lang.languageCode, cell.id, e.target.value)
                                                        : undefined
                                                }
                                                className={`cell-input ${showUntranslated && isUntranslated(t, lang.languageCode) ? 'input-untranslated' : ''}`}
                                                placeholder={`${lang.languageCode} translation...`}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="col-action">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteKey(t.labelKey)}
                                        title="ลบ"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
                        <p>ไม่พบข้อมูลที่ค้นหา</p>
                    </div>
                )}
            </div>

            <div className="translation-footer">
                <div className="paging-left">
                    <span className="paging-info">
                        {totalFiltered > 0 ? `${startIdx + 1}–${endIdx}` : '0'} จาก {totalFiltered} รายการ
                    </span>
                    {hasChanges && (
                        <span className="pending-badge">{Object.keys(editedCells).length} pending changes</span>
                    )}
                </div>
                <div className="paging-right">
                    <button
                        className="paging-btn"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage(1)}
                        title="หน้าแรก"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
                    </button>
                    <button
                        className="paging-btn"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        title="ก่อนหน้า"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span className="paging-page-info">หน้า {safePage} / {totalPages}</span>
                    <button
                        className="paging-btn"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        title="ถัดไป"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                    <button
                        className="paging-btn"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        title="หน้าสุดท้าย"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
                    </button>
                </div>
            </div>

            {/* ── Add Key Modal ── */}
            {showAddModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Translation Key</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-field">
                                <label>Section (Page Key) <span className="required">*</span></label>
                                <select
                                    value={newPageKey}
                                    onChange={(e) => setNewPageKey(e.target.value)}
                                    className="modal-input"
                                    autoFocus
                                >
                                    <option value="">-- Select section --</option>
                                    {normalizedSections.map(s => (
                                        <option key={s.normalized} value={s.normalized}>{s.label} ({s.normalized})</option>
                                    ))}
                                </select>
                            </div>
                            {generatedLabelKey && (
                                <div className="modal-field">
                                    <label>Generated Key Reference</label>
                                    <div className="modal-generated-key">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                                        <code>{generatedLabelKey}</code>
                                    </div>
                                    <span className="modal-hint">Auto-generated based on section + next available number</span>
                                </div>
                            )}
                            <div style={{ borderTop: '1px solid var(--color-border, #333)', paddingTop: 16, marginTop: 8 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Translations</label>
                            <div className="modal-lang-grid">
                                {activeLanguages.map((lang) => (
                                    <div key={lang.languageCode} className="modal-field">
                                        <label>{lang.languageName} ({lang.languageCode.toUpperCase()})</label>
                                        <textarea
                                            value={newValues[lang.languageCode] || ''}
                                            onChange={(e) => setNewValues((prev) => ({ ...prev, [lang.languageCode]: e.target.value }))}
                                            placeholder={`${lang.languageName} translation...`}
                                            className="modal-textarea"
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button
                                className="modal-submit-btn"
                                onClick={handleAddKey}
                                disabled={!generatedLabelKey}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Language Modal ── */}
            {showLangModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLangModal(false); }}>
                    <div className="modal-content modal-sm">
                        <div className="modal-header">
                            <h3>Add New Language</h3>
                            <button className="modal-close" onClick={() => setShowLangModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-field">
                                <label>Select Language <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={langSearch}
                                    onChange={(e) => setLangSearch(e.target.value)}
                                    placeholder="🔍 Search languages... (e.g. Japanese, Korean, zh)"
                                    className="modal-input"
                                    autoFocus
                                />
                                <div className="lang-picker-list">
                                    {filteredIsoLanguages.length === 0 && (
                                        <div className="lang-picker-empty">No available languages found</div>
                                    )}
                                    {filteredIsoLanguages.map(l => (
                                        <button
                                            key={l.code}
                                            type="button"
                                            className={`lang-picker-item ${newLangCode === l.code ? 'selected' : ''}`}
                                            onClick={() => handleSelectLanguage(l)}
                                        >
                                            <span className="lang-picker-code">{l.code.toUpperCase()}</span>
                                            <span className="lang-picker-name">{l.name}</span>
                                            <span className="lang-picker-native">{l.native}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {newLangCode && (
                                <div className="lang-selected-preview">
                                    <div className="lang-preview-badge">
                                        <span className="lang-preview-code">{newLangCode.toUpperCase()}</span>
                                        <span className="lang-preview-name">{newLangName}</span>
                                        <span className="lang-preview-native">{newLangDesc}</span>
                                    </div>
                                    <span className="modal-hint">All existing translation keys will be auto-translated to this language</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={() => { setShowLangModal(false); setNewLangCode(''); setNewLangName(''); setNewLangDesc(''); setLangSearch(''); }}>Cancel</button>
                            <button
                                className="modal-submit-btn"
                                onClick={handleAddLanguage}
                                disabled={!newLangCode.trim() || !newLangName.trim() || isAddingLang}
                            >
                                {isAddingLang ? '⏳ Auto-translating...' : '✓ Add & Auto-Translate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Language Confirmation Modal ── */}
            {showDeleteLangModal && deletingLang && (() => {
                const langTransCount = translations.filter(t => t.values[deletingLang.languageCode]).length;
                return (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isDeletingLang) { setShowDeleteLangModal(false); setDeletingLang(null); } }}>
                    <div className="modal-content modal-sm delete-lang-modal">
                        <div className="modal-header delete-modal-header">
                            <div className="delete-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                <h3>Confirm Deletion</h3>
                            </div>
                            <button className="modal-close" onClick={() => { if (!isDeletingLang) { setShowDeleteLangModal(false); setDeletingLang(null); } }}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-lang-desc">
                                You are about to permanently remove the following language and all associated translation data from the system.
                            </p>

                            <div className="delete-lang-details">
                                <table className="delete-lang-table">
                                    <tbody>
                                        <tr>
                                            <td className="delete-detail-label">Language Code</td>
                                            <td className="delete-detail-value">
                                                <span className="delete-lang-code">{deletingLang.languageCode.toUpperCase()}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="delete-detail-label">Language Name</td>
                                            <td className="delete-detail-value">{deletingLang.languageName}</td>
                                        </tr>
                                        {deletingLang.description && (
                                        <tr>
                                            <td className="delete-detail-label">Native Name</td>
                                            <td className="delete-detail-value">{deletingLang.description}</td>
                                        </tr>
                                        )}
                                        <tr>
                                            <td className="delete-detail-label">Translations</td>
                                            <td className="delete-detail-value delete-detail-danger">{langTransCount} keys will be removed</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="delete-lang-warning">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <div>
                                    <strong>Warning:</strong> This action cannot be undone. All translation entries associated with this language will be permanently deleted from the database.
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={() => { setShowDeleteLangModal(false); setDeletingLang(null); }} disabled={isDeletingLang}>Cancel</button>
                            <button
                                className="modal-delete-btn"
                                onClick={confirmDeleteLanguage}
                                disabled={isDeletingLang}
                            >
                                {isDeletingLang ? (
                                    <><svg className="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Deleting...</>
                                ) : (
                                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete Language</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
    );
}

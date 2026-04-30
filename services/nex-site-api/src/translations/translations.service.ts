import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';
import { LanguageTranslation } from '../entities/language-translation.entity';

// ── Default seed data ──
const defaultLanguages = [
    { languageCode: 'th', languageName: 'Thai', description: 'ภาษาไทย' },
    { languageCode: 'en', languageName: 'English', description: 'English' },
];

const defaultTranslations: Array<{ pageKey: string; labelKey: string; values: Record<string, string> }> = [
    // ── Navbar ──
    { pageKey: 'nav', labelKey: 'nav.home', values: { en: 'Home', th: 'หน้าแรก' } },
    { pageKey: 'nav', labelKey: 'nav.services', values: { en: 'Services', th: 'บริการ' } },
    { pageKey: 'nav', labelKey: 'nav.about', values: { en: 'About Us', th: 'เกี่ยวกับเรา' } },
    { pageKey: 'nav', labelKey: 'nav.contact', values: { en: 'Contact', th: 'ติดต่อเรา' } },
    { pageKey: 'nav', labelKey: 'nav.careers', values: { en: 'Careers', th: 'งานที่เปิดรับ' } },
    { pageKey: 'nav', labelKey: 'nav.cta', values: { en: 'Free Consulting', th: 'ปรึกษาฟรี' } },
    // ── Hero ──
    { pageKey: 'hero', labelKey: 'hero.title', values: { en: 'Transform Your Business With Technology', th: 'ยกระดับธุรกิจของคุณด้วยเทคโนโลยี' } },
    { pageKey: 'hero', labelKey: 'hero.subtitle', values: { en: 'Tech Biz Convergence offers comprehensive IT solutions to drive your organization into the modern digital era.', th: 'บริษัท Tech Biz Convergence นำเสนอโซลูชั่นด้านไอทีที่ครบวงจร ขับเคลื่อนองค์กรของคุณสู่ยุคดิจิทัลด้วยนวัตกรรมล้ำสมัย' } },
    { pageKey: 'hero', labelKey: 'hero.button', values: { en: 'Get Started', th: 'เริ่มต้นกับเรา' } },
    // ── Features ──
    { pageKey: 'features', labelKey: 'features.title', values: { en: 'Our Services', th: 'บริการของเรา' } },
    { pageKey: 'features', labelKey: 'features.subtitle', values: { en: 'Comprehensive IT solutions for your business', th: 'โซลูชั่นไอทีครบวงจรเพื่อธุรกิจของคุณ' } },
    // ── Stats ──
    { pageKey: 'stats', labelKey: 'stats.title', values: { en: 'About Us', th: 'เกี่ยวกับเรา' } },
    { pageKey: 'stats', labelKey: 'stats.subtitle', values: { en: 'Leading IT company trusted by businesses', th: 'บริษัทไอทีชั้นนำที่ธุรกิจไว้วางใจ' } },
    { pageKey: 'stats', labelKey: 'stats.years', values: { en: 'Years of Experience', th: 'ปีแห่งประสบการณ์' } },
    { pageKey: 'stats', labelKey: 'stats.projects', values: { en: 'Projects Completed', th: 'โปรเจกต์สำเร็จ' } },
    { pageKey: 'stats', labelKey: 'stats.clients', values: { en: 'Trusted Clients', th: 'ลูกค้าที่วางใจ' } },
    { pageKey: 'stats', labelKey: 'stats.team', values: { en: 'Expert Team', th: 'ทีมผู้เชี่ยวชาญ' } },
    // ── CTA ──
    { pageKey: 'cta', labelKey: 'cta.title', values: { en: 'Ready to get started?\nContact us today', th: 'พร้อมเริ่มต้นแล้วหรือยัง?\nติดต่อเราวันนี้' } },
    { pageKey: 'cta', labelKey: 'cta.subtitle', values: { en: 'Expert team ready to consult, no obligations', th: 'ทีมผู้เชี่ยวชาญพร้อมให้คำปรึกษา ไม่มีข้อผูกมัด' } },
    { pageKey: 'cta', labelKey: 'cta.primary', values: { en: 'Free Expert Consultation', th: 'ปรึกษาผู้เชี่ยวชาญฟรี' } },
    { pageKey: 'cta', labelKey: 'cta.secondary', values: { en: 'View Our Work', th: 'ดูผลงานของเรา' } },
    // ── Footer ──
    { pageKey: 'footer', labelKey: 'footer.company', values: { en: 'Tech Biz Convergence Co., Ltd.', th: 'บริษัท เทค บิช คอนเวอร์เจนซ์ จำกัด' } },
    { pageKey: 'footer', labelKey: 'footer.rights', values: { en: 'All rights reserved.', th: 'สงวนลิขสิทธิ์' } },
    { pageKey: 'footer', labelKey: 'footer.quickLinks', values: { en: 'Quick Links', th: 'ลิงก์ด่วน' } },
    { pageKey: 'footer', labelKey: 'footer.contactUs', values: { en: 'Contact Us', th: 'ติดต่อเรา' } },
    // ── Contact ──
    { pageKey: 'contact', labelKey: 'contact.title', values: { en: 'Contact Us', th: 'ติดต่อเรา' } },
    { pageKey: 'contact', labelKey: 'contact.submit', values: { en: 'Send Message', th: 'ส่งข้อความ' } },
    // ── Common ──
    { pageKey: 'common', labelKey: 'common.readMore', values: { en: 'Read More', th: 'อ่านเพิ่มเติม' } },
    { pageKey: 'common', labelKey: 'common.loading', values: { en: 'Loading...', th: 'กำลังโหลด...' } },
    // ── Job Application Form ──
    { pageKey: 'jobForm', labelKey: 'jobForm.title', values: { en: 'Apply for Job', th: 'สมัครงาน', ja: '求人応募' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.position', values: { en: 'Position:', th: 'ตำแหน่ง:', ja: 'ポジション：' } },
    // Personal Info
    { pageKey: 'jobForm', labelKey: 'jobForm.personalInfo', values: { en: 'Personal Information', th: 'ข้อมูลส่วนตัว', ja: '個人情報' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.titlePrefix', values: { en: 'Title', th: 'คำนำหน้าชื่อ', ja: '敬称' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.titleSelect', values: { en: 'Select title', th: 'เลือกคำนำหน้า', ja: '敬称を選択' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.gender', values: { en: 'Gender', th: 'เพศ', ja: '性別' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.genderSelect', values: { en: 'Select gender', th: 'เลือกเพศ', ja: '性別を選択' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.firstName', values: { en: 'First Name', th: 'ชื่อ', ja: '名' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.lastName', values: { en: 'Last Name', th: 'นามสกุล', ja: '姓' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.phone', values: { en: 'Phone', th: 'เบอร์โทร', ja: '電話番号' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.email', values: { en: 'Email', th: 'อีเมล', ja: 'メールアドレス' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.applyPosition', values: { en: 'Position Applied For', th: 'ตำแหน่งที่สมัคร', ja: '応募ポジション' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.positionSelect', values: { en: 'Select position', th: 'เลือกตำแหน่ง', ja: 'ポジションを選択' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.workLocation', values: { en: 'Work Location', th: 'สถานที่ปฏิบัติงาน', ja: '勤務地' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.locationSelect', values: { en: 'Select location', th: 'เลือกสถานที่', ja: '勤務地を選択' } },
    // Skills
    { pageKey: 'jobForm', labelKey: 'jobForm.skills', values: { en: 'Skills', th: 'ทักษะ', ja: 'スキル' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.hardSkill', values: { en: 'Hard Skill', th: 'Hard Skill', ja: 'ハードスキル' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.hardSkillPlaceholder', values: { en: 'e.g. JavaScript, React, SQL, Python...', th: 'เช่น JavaScript, React, SQL, Python...', ja: '例：JavaScript、React、SQL、Python...' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.softSkill', values: { en: 'Soft Skill', th: 'Soft Skill', ja: 'ソフトスキル' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.softSkillPlaceholder', values: { en: 'e.g. Communication, Teamwork, Leadership...', th: 'เช่น การสื่อสาร, การทำงานเป็นทีม, ภาวะผู้นำ...', ja: '例：コミュニケーション、チームワーク、リーダーシップ...' } },
    // Education
    { pageKey: 'jobForm', labelKey: 'jobForm.education', values: { en: 'Education', th: 'ข้อมูลการศึกษา', ja: '学歴' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.addEducation', values: { en: 'Add Education', th: 'เพิ่มการศึกษา', ja: '学歴を追加' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.educationNo', values: { en: 'Education #', th: 'การศึกษาที่', ja: '学歴' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.institution', values: { en: 'Institution', th: 'สถาบันการศึกษา', ja: '教育機関' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.institutionPlaceholder', values: { en: 'Institution / University', th: 'ชื่อสถาบัน / มหาวิทยาลัย', ja: '学校名 / 大学名' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.subject', values: { en: 'Subject / Major', th: 'สาขาวิชา', ja: '専攻 / 学科' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.degree', values: { en: 'Degree', th: 'วุฒิการศึกษา', ja: '学位' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.degreeSelect', values: { en: 'Select degree', th: 'เลือกวุฒิการศึกษา', ja: '学位を選択' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.eduStartDate', values: { en: 'Start Date', th: 'วันที่เริ่มเรียน', ja: '入学日' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.eduEndDate', values: { en: 'Completion Date', th: 'วันที่สำเร็จการศึกษา', ja: '卒業日' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.grade', values: { en: 'GPA', th: 'เกรดเฉลี่ย', ja: 'GPA' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.gradePlaceholder', values: { en: 'e.g. 3.50', th: 'เช่น 3.50', ja: '例：3.50' } },
    // Experience
    { pageKey: 'jobForm', labelKey: 'jobForm.experience', values: { en: 'Work Experience', th: 'ประสบการณ์การทำงาน', ja: '職歴' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.addExperience', values: { en: 'Add Experience', th: 'เพิ่มประสบการณ์', ja: '職歴を追加' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.experienceNo', values: { en: 'Experience #', th: 'ประสบการณ์ที่', ja: '職歴' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.companyName', values: { en: 'Company Name', th: 'ชื่อบริษัท', ja: '会社名' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.companyPlaceholder', values: { en: 'Company / Organization', th: 'ชื่อบริษัท / องค์กร', ja: '会社名 / 組織名' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.expLocation', values: { en: 'Location', th: 'สถานที่', ja: '勤務地' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.expLocationPlaceholder', values: { en: 'Bangkok, Chiang Mai, etc.', th: 'กรุงเทพฯ, เชียงใหม่, etc.', ja: '東京、大阪など' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.jobPosition', values: { en: 'Job Position', th: 'ตำแหน่งงาน', ja: '職位' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.periodFrom', values: { en: 'From', th: 'ตั้งแต่', ja: '開始日' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.periodTo', values: { en: 'To', th: 'ถึง', ja: '終了日' } },
    // Buttons & Messages
    { pageKey: 'jobForm', labelKey: 'jobForm.remove', values: { en: 'Remove', th: 'ลบ', ja: '削除' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.cancel', values: { en: 'Cancel', th: 'ยกเลิก', ja: 'キャンセル' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.submit', values: { en: 'Submit Application', th: 'ส่งใบสมัคร', ja: '応募を送信' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.submitting', values: { en: 'Submitting...', th: 'กำลังส่ง...', ja: '送信中...' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.successTitle', values: { en: 'Application Submitted!', th: 'ส่งใบสมัครเรียบร้อยแล้ว!', ja: '応募が送信されました！' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.successText', values: { en: 'Thank you for your interest. Our team will review your application and contact you within 3-5 business days.', th: 'ขอบคุณสำหรับความสนใจ ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับภายใน 3–5 วันทำการ', ja: 'ご応募ありがとうございます。担当者が内容を確認し、3〜5営業日以内にご連絡いたします。' } },
    { pageKey: 'jobForm', labelKey: 'jobForm.close', values: { en: 'Close', th: 'ปิด', ja: '閉じる' } },
];

@Injectable()
export class TranslationsService implements OnModuleInit {
    constructor(
        @InjectRepository(Language)
        private readonly langRepo: Repository<Language>,
        @InjectRepository(LanguageTranslation)
        private readonly transRepo: Repository<LanguageTranslation>,
    ) {}

    /**
     * Safe upsert: insert if not exists, update if exists
     * Prevents "duplicate key" constraint violations
     */
    private async safeUpsert(data: { languageCode: string; pageKey: string; labelKey: string; labelValue: string }): Promise<LanguageTranslation> {
        const existing = await this.transRepo.findOne({
            where: { languageCode: data.languageCode, labelKey: data.labelKey },
        });
        if (existing) {
            existing.labelValue = data.labelValue;
            existing.pageKey = data.pageKey;
            return this.transRepo.save(existing);
        }
        return this.transRepo.save(this.transRepo.create(data));
    }

    // ── Auto-seed on startup ──
    async onModuleInit() {
        // Seed languages
        const langCount = await this.langRepo.count();
        if (langCount === 0) {
            console.log('🌐 Seeding default languages...');
            for (const lang of defaultLanguages) {
                await this.langRepo.save(this.langRepo.create(lang));
            }
            console.log(`✅ Seeded ${defaultLanguages.length} languages`);
        }

        // Seed translations
        const transCount = await this.transRepo.count();
        if (transCount === 0) {
            console.log('🌐 Seeding default translations...');
            let count = 0;
            for (const item of defaultTranslations) {
                for (const [langCode, value] of Object.entries(item.values)) {
                    await this.transRepo.save(this.transRepo.create({
                        languageCode: langCode,
                        pageKey: item.pageKey,
                        labelKey: item.labelKey,
                        labelValue: value,
                    }));
                    count++;
                }
            }
            console.log(`✅ Seeded ${count} translation rows`);
        }
    }

    // ════════════════════════════════════════
    // LANGUAGES
    // ════════════════════════════════════════

    async getLanguages(): Promise<Language[]> {
        return this.langRepo.find({ order: { id: 'ASC' } });
    }

    async getActiveLanguages(): Promise<Language[]> {
        return this.langRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
    }

    /**
     * Auto-translate text using MyMemory free API
     * @param text - source text to translate
     * @param targetLang - target language code (e.g. 'en', 'th')
     * @param sourceLang - source language code (default: auto-detect)
     */
    private async autoTranslate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
        if (!text || text.trim().length === 0) return '';
        // Skip translation for very short text, symbols, or already-target content
        if (text.length <= 2 || /^[0-9\s\-\+\.\,\!\?\@\#\$\%\^\&\*\(\)]+$/.test(text)) return text;

        // Auto-detect source language if not provided
        const src = sourceLang || (/[\u0E00-\u0E7F]/.test(text) ? 'th' : 'en');

        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${targetLang}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translated = data.responseData.translatedText;
                // MyMemory sometimes returns the same text if it can't translate
                return translated !== text ? translated : text;
            }
            return text; // Fallback to original
        } catch {
            return text; // Fallback to original on error
        }
    }

    async createLanguage(data: { languageCode: string; languageName: string; description?: string }): Promise<Language & { translationsCreated: number }> {
        const existing = await this.langRepo.findOne({ where: { languageCode: data.languageCode } });
        if (existing) throw new Error(`Language "${data.languageCode}" already exists`);

        // 1. Create the language record
        const lang = await this.langRepo.save(this.langRepo.create({ ...data, isActive: true, createBy: 'system', updateBy: 'system' }));

        // 2. Get all existing English translations as source
        const sourceRows = await this.transRepo.find({
            where: { languageCode: 'en' },
            order: { pageKey: 'ASC', labelKey: 'ASC' },
        });

        // 3. Run auto-translation in background (don't block the response)
        console.log(`🌐 Creating language "${data.languageCode}" — auto-translating ${sourceRows.length} keys in background...`);

        // Fire-and-forget: translate in background
        this.translateInBackground(data.languageCode, sourceRows).catch(err => {
            console.error(`❌ Background translation for "${data.languageCode}" failed:`, err);
        });

        // Return immediately with estimated count
        return { ...lang, translationsCreated: sourceRows.length };
    }

    /**
     * Background translation: runs after createLanguage returns response
     */
    private async translateInBackground(
        languageCode: string,
        sourceRows: Array<{ labelValue: string; pageKey: string; labelKey: string }>,
    ): Promise<void> {
        let created = 0;
        for (const row of sourceRows) {
            try {
                const exists = await this.transRepo.findOne({
                    where: { languageCode, labelKey: row.labelKey },
                });
                if (exists) continue;

                const translated = await this.autoTranslate(row.labelValue, languageCode);
                await this.safeUpsert({
                    languageCode,
                    pageKey: row.pageKey,
                    labelKey: row.labelKey,
                    labelValue: translated,
                });
                created++;

                if (created % 20 === 0) {
                    console.log(`   ... translated ${created}/${sourceRows.length}`);
                }

                await new Promise(resolve => setTimeout(resolve, 120));
            } catch (err) {
                console.error(`   ⚠️ Failed to translate key "${row.labelKey}":`, err);
            }
        }
        console.log(`✅ Background translation complete for "${languageCode}": ${created} keys created`);
    }

    async updateLanguage(id: number, data: Partial<{ languageName: string; description: string; isActive: boolean }>): Promise<Language> {
        const lang = await this.langRepo.findOne({ where: { id } });
        if (!lang) throw new Error('Language not found');
        Object.assign(lang, data);
        lang.updateBy = 'system';
        return this.langRepo.save(lang);
    }

    async deleteLanguage(id: number): Promise<{ success: boolean }> {
        const lang = await this.langRepo.findOne({ where: { id } });
        if (!lang) return { success: false };
        // Also delete all translations for this language
        await this.transRepo.delete({ languageCode: lang.languageCode });
        await this.langRepo.remove(lang);
        return { success: true };
    }

    // ════════════════════════════════════════
    // TRANSLATIONS
    // ════════════════════════════════════════

    /**
     * Get all translations as a flat map for frontend: { key: value }
     * Used by frontend to render translated text
     */
    async getAllAsMap(lang: string = 'th'): Promise<Record<string, string>> {
        const all = await this.transRepo.find({
            where: { languageCode: lang },
            order: { pageKey: 'ASC', labelKey: 'ASC' },
        });
        const map: Record<string, string> = {};
        for (const t of all) {
            map[t.labelKey] = t.labelValue || '';
        }
        return map;
    }

    /**
     * Get translations grouped by labelKey for backoffice editing.
     * Returns: { labelKey, pageKey, values: { en: "...", th: "...", ja: "..." } }
     */
    async findAllGrouped(pageKey?: string): Promise<any[]> {
        const where: any = {};
        if (pageKey && pageKey !== 'all') where.pageKey = pageKey;

        const all = await this.transRepo.find({ where, order: { pageKey: 'ASC', labelKey: 'ASC' } });

        // Group by labelKey
        const grouped: Record<string, { pageKey: string; labelKey: string; values: Record<string, { id: number; value: string; isActive?: boolean }> }> = {};
        for (const row of all) {
            if (!grouped[row.labelKey]) {
                grouped[row.labelKey] = { pageKey: row.pageKey, labelKey: row.labelKey, values: {} };
            }
            grouped[row.labelKey].values[row.languageCode] = { id: row.id, value: row.labelValue || '', isActive: row.is_active };
        }

        return Object.values(grouped);
    }

    /**
     * Get unique page keys (sections)
     */
    async getPageKeys(): Promise<string[]> {
        const result = await this.transRepo
            .createQueryBuilder('t')
            .select('DISTINCT t.pageKey', 'pageKey')
            .orderBy('t.pageKey', 'ASC')
            .getRawMany();
        return result.map((r) => r.pageKey);
    }

    /**
     * Create a new translation key with values for each language
     */
    async createKey(data: { labelKey: string; pageKey: string; values: Record<string, string> }): Promise<{ success: boolean }> {
        const existing = await this.transRepo.findOne({ where: { labelKey: data.labelKey, languageCode: Object.keys(data.values)[0] } });
        if (existing) throw new Error(`Key "${data.labelKey}" already exists`);

        for (const [langCode, value] of Object.entries(data.values)) {
            await this.transRepo.save(this.transRepo.create({
                languageCode: langCode,
                pageKey: data.pageKey,
                labelKey: data.labelKey,
                labelValue: value,
            }));
        }
        return { success: true };
    }

    /**
     * Update a single translation row by id
     */
    async updateOne(id: number, data: Partial<LanguageTranslation>): Promise<LanguageTranslation> {
        const row = await this.transRepo.findOne({ where: { id } });
        if (!row) throw new Error('Translation not found');
        if (data.labelValue !== undefined) row.labelValue = data.labelValue;
        if (data.is_active !== undefined) row.is_active = data.is_active;
        return this.transRepo.save(row);
    }

    /**
     * Bulk update: array of { id, labelValue }
     */
    async bulkUpdate(items: Array<{ id: number; labelValue: string }>): Promise<{ success: boolean; updated: number }> {
        let updated = 0;
        for (const item of items) {
            const row = await this.transRepo.findOne({ where: { id: item.id } });
            if (row) {
                row.labelValue = item.labelValue;
                await this.transRepo.save(row);
                updated++;
            }
        }
        return { success: true, updated };
    }

    /**
     * Delete all translations for a given labelKey
     */
    async deleteByKey(labelKey: string): Promise<{ success: boolean; deleted: number }> {
        const result = await this.transRepo.delete({ labelKey });
        return { success: true, deleted: result.affected || 0 };
    }

    /**
     * Delete translation by ID
     */
    async deleteById(id: number): Promise<{ success: boolean; deleted: number }> {
        const result = await this.transRepo.delete({ id });
        return { success: true, deleted: result.affected || 0 };
    }

    // ════════════════════════════════════════
    // AUTO-GENERATE TRANSLATIONS FROM LAYOUT
    // ════════════════════════════════════════

    /**
     * Text-like props we want to extract per component type.
     * Key = prop name, Value = human-readable label for reference.
     */
    private static TEXT_PROPS: Record<string, string[]> = {
        hero: ['title', 'subtitle', 'btnText'],
        features: ['badge', 'title', 'subtitle'],
        stats: ['badge', 'title', 'subtitle', 'description'],
        cta: ['title', 'subtitle', 'primaryText', 'secondaryText'],
        portfolio: ['badge', 'title', 'subtitle', 'ctaText'],
        contactform: ['title', 'subtitle'],
        careers: ['sectionTitle', 'sectionSubtitle'],
        heading: ['text'],
        text: ['content'],
        basic: ['content', 'title'],
    };

    /**
     * Detect language of given text (simple heuristic: if has Thai chars → assume th)
     */
    private detectLang(text: string): 'th' | 'en' {
        return /[\u0E00-\u0E7F]/.test(text) ? 'th' : 'en';
    }

    /**
     * Scan page layout components and auto-generate translation keys.
     * - Creates pageKey from component type (e.g. 'hero', 'cta')
     * - Creates labelKey like 'cms.hero.title'
     * - Thai text is stored directly, English is auto-translated (or vice versa)
     * - Skips keys that already exist
     */
    async generateFromLayout(
        layout: Array<{ id: string; type: string; props: Record<string, any>; children?: any[] }>,
        pageSlug?: string,
    ): Promise<{ success: boolean; created: number; skipped: number; keys: string[] }> {
        let created = 0;
        let skipped = 0;
        const createdKeys: string[] = [];

        // Flatten all components (including children)
        const flatComponents: Array<{ type: string; props: Record<string, any> }> = [];
        const flatten = (items: any[]) => {
            for (const item of items) {
                flatComponents.push({ type: item.type, props: item.props || {} });
                if (item.children) flatten(item.children);
                // Also flatten columns
                if (item.type === 'columns' && item.props?.columns) {
                    for (const col of item.props.columns) {
                        if (col.components) flatten(col.components);
                    }
                }
            }
        };
        flatten(layout);

        // Count occurrences of each type for unique key naming
        const typeCounts: Record<string, number> = {};

        for (const comp of flatComponents) {
            const textProps = TranslationsService.TEXT_PROPS[comp.type];
            if (!textProps) continue; // Unknown type, skip

            // Build unique suffix if multiple of same type
            typeCounts[comp.type] = (typeCounts[comp.type] || 0) + 1;
            const suffix = typeCounts[comp.type] > 1 ? `_${typeCounts[comp.type]}` : '';
            const pageKey = `cms.${comp.type}${suffix}`;

            for (const propName of textProps) {
                const value = comp.props[propName];
                if (!value || typeof value !== 'string' || value.trim().length === 0) continue;

                const labelKey = `cms.${comp.type}${suffix}.${propName}`;

                // Check if this key already exists
                const existing = await this.transRepo.findOne({
                    where: { labelKey, languageCode: 'th' },
                });

                if (existing) {
                    // Update existing if value changed
                    if (existing.labelValue !== value) {
                        const sourceLang = this.detectLang(value);
                        existing.labelValue = sourceLang === 'th' ? value : existing.labelValue;
                        await this.transRepo.save(existing);

                        // Also update the other language
                        const targetLang = sourceLang === 'th' ? 'en' : 'th';
                        const otherRow = await this.transRepo.findOne({
                            where: { labelKey, languageCode: targetLang },
                        });
                        if (otherRow) {
                            const translated = await this.autoTranslate(
                                value,
                                targetLang === 'en' ? 'en' : 'th',
                            );
                            otherRow.labelValue = translated;
                            await this.transRepo.save(otherRow);
                        }
                    }
                    skipped++;
                    continue;
                }

                // Detect source language and translate to the other
                const sourceLang = this.detectLang(value);
                const targetLang = sourceLang === 'th' ? 'en' : 'th';

                let thValue: string;
                let enValue: string;

                if (sourceLang === 'th') {
                    thValue = value;
                    enValue = await this.autoTranslate(value, 'en');
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 150));
                } else {
                    enValue = value;
                    thValue = await this.autoTranslate(value, 'th');
                    await new Promise(resolve => setTimeout(resolve, 150));
                }

                // Save TH (safe upsert)
                await this.safeUpsert({
                    languageCode: 'th',
                    pageKey,
                    labelKey,
                    labelValue: thValue,
                });

                // Save EN (safe upsert)
                await this.safeUpsert({
                    languageCode: 'en',
                    pageKey,
                    labelKey,
                    labelValue: enValue,
                });

                created++;
                createdKeys.push(labelKey);
                console.log(`🌐 Generated: ${labelKey} → TH: "${thValue.substring(0, 40)}..." / EN: "${enValue.substring(0, 40)}..."`);
            }

            // ── Handle array items (feature cards, stat items, etc.) ──
            const ARRAY_ITEM_PROPS: Record<string, Array<{ arrayProp: string; keyPrefix: string; textFields: Array<{ field: string; key: string }> }>> = {
                features: [
                    { arrayProp: 'items', keyPrefix: 'features.card', textFields: [
                        { field: 'title', key: 'title' },
                        { field: 'description', key: 'desc' },
                        { field: 'detail', key: 'detail' },
                    ]},
                ],
                stats: [
                    { arrayProp: 'statsItems', keyPrefix: 'stats.card', textFields: [
                        { field: 'label', key: 'label' },
                    ]},
                    { arrayProp: 'whyItems', keyPrefix: 'whyus.card', textFields: [
                        { field: 'title', key: 'title' },
                        { field: 'desc', key: 'desc' },
                    ]},
                ],
                testimonials: [
                    { arrayProp: 'testimonials', keyPrefix: 'testimonials.card', textFields: [
                        { field: 'name', key: 'name' },
                        { field: 'role', key: 'role' },
                        { field: 'text', key: 'text' },
                    ]},
                ],
            };

            const arrayConfigs = ARRAY_ITEM_PROPS[comp.type];
            if (arrayConfigs) {
                for (const config of arrayConfigs) {
                    const items: any[] = comp.props[config.arrayProp];
                    if (!Array.isArray(items)) continue;

                    for (let idx = 0; idx < items.length; idx++) {
                        const item = items[idx];
                        for (const tf of config.textFields) {
                            const val = item[tf.field];
                            if (!val || typeof val !== 'string' || val.trim().length === 0) continue;

                            const itemLabelKey = `${config.keyPrefix}_${idx}.${tf.key}`;

                            const existingItem = await this.transRepo.findOne({
                                where: { labelKey: itemLabelKey, languageCode: 'th' },
                            });

                            if (existingItem) {
                                skipped++;
                                continue;
                            }

                            const srcLang = this.detectLang(val);
                            let thVal: string;
                            let enVal: string;

                            if (srcLang === 'th') {
                                thVal = val;
                                enVal = await this.autoTranslate(val, 'en');
                            } else {
                                enVal = val;
                                thVal = await this.autoTranslate(val, 'th');
                            }
                            await new Promise(resolve => setTimeout(resolve, 150));

                            await this.safeUpsert({
                                languageCode: 'th',
                                pageKey: comp.type,
                                labelKey: itemLabelKey,
                                labelValue: thVal,
                            });
                            await this.safeUpsert({
                                languageCode: 'en',
                                pageKey: comp.type,
                                labelKey: itemLabelKey,
                                labelValue: enVal,
                            });

                            created++;
                            createdKeys.push(itemLabelKey);
                            console.log(`🌐 Generated: ${itemLabelKey} → TH: "${thVal.substring(0, 40)}..." / EN: "${enVal.substring(0, 40)}..."`);
                        }
                    }
                }
            }
        }

        console.log(`✅ Translation generation complete: ${created} created, ${skipped} skipped`);
        return { success: true, created, skipped, keys: createdKeys };
    }

    // ════════════════════════════════════════
    // BACKOFFICE KEY GENERATION
    // ════════════════════════════════════════

    private static readonly BO_KEYS: Array<{ key: string; th: string; en: string }> = [
        // Analytics
        { key: 'bo.analytics.authLogs', th: 'บันทึกการเข้าสู่ระบบ', en: 'Auth Logs' },
        { key: 'bo.analytics.failedLogins', th: 'เข้าสู่ระบบล้มเหลว', en: 'Failed Logins' },
        { key: 'bo.analytics.loading', th: 'กำลังโหลด...', en: 'Loading...' },
        { key: 'bo.analytics.loginsToday', th: 'เข้าสู่ระบบวันนี้', en: 'Logins Today' },
        { key: 'bo.analytics.publishedPages', th: 'หน้าที่เผยแพร่แล้ว', en: 'Published Pages' },
        { key: 'bo.analytics.recentActivity', th: 'กิจกรรมล่าสุด', en: 'Recent Activity' },
        { key: 'bo.analytics.topPages', th: 'หน้ายอดนิยม', en: 'Top Pages' },
        { key: 'bo.analytics.totalViews', th: 'จำนวนการเข้าชมทั้งหมด', en: 'Total Page Views' },
        // Common
        { key: 'bo.common.actions', th: 'การดำเนินการ', en: 'Actions' },
        { key: 'bo.common.status', th: 'สถานะ', en: 'Status' },
        { key: 'bo.common.views', th: 'การเข้าชม', en: 'views' },
        // Dashboard
        { key: 'bo.dashboard.draft', th: 'ฉบับร่าง', en: 'Draft' },
        { key: 'bo.dashboard.published', th: 'เผยแพร่แล้ว', en: 'Published' },
        { key: 'bo.dashboard.recentPages', th: 'หน้าล่าสุด', en: 'Recent Pages' },
        { key: 'bo.dashboard.totalPages', th: 'จำนวนหน้าทั้งหมด', en: 'Total Pages' },
        { key: 'bo.dashboard.totalViews', th: 'การเข้าชมทั้งหมด', en: 'Total Views' },
        // Language
        { key: 'bo.lang.addKey', th: 'เพิ่ม Key', en: 'Add Key' },
        { key: 'bo.lang.addLanguage', th: 'เพิ่มภาษา', en: 'Language' },
        { key: 'bo.lang.allSections', th: 'ทุกส่วน', en: 'All Sections' },
        { key: 'bo.lang.keyRef', th: 'อ้างอิง KEY', en: 'KEY REFERENCE' },
        { key: 'bo.lang.languages', th: 'ภาษา', en: 'language(s)' },
        { key: 'bo.lang.saveChanges', th: 'บันทึกการเปลี่ยนแปลง', en: 'Save Changes' },
        { key: 'bo.lang.saving', th: 'กำลังบันทึก...', en: 'Saving...' },
        { key: 'bo.lang.scanUntranslated', th: 'สแกนที่ยังไม่แปล', en: 'Scan Untranslated' },
        { key: 'bo.lang.section', th: 'หมวด', en: 'SECTION' },
        { key: 'bo.lang.showAll', th: 'แสดงทั้งหมด', en: 'Show All Translations' },
        { key: 'bo.lang.subtitle', th: 'จัดการการแปลหลายภาษา', en: 'Manage multi-language translations' },
        { key: 'bo.lang.supports', th: 'รองรับ', en: 'Supports' },
        // Navigation
        { key: 'bo.nav.language', th: 'ภาษา', en: 'Language' },
        { key: 'bo.nav.pages', th: 'หน้าเว็บ', en: 'Pages' },
        { key: 'bo.switchLang', th: 'เปลี่ยนภาษา', en: 'Switch Language' },
        // Pages
        { key: 'bo.pages.all', th: 'ทั้งหมด', en: 'All' },
        { key: 'bo.pages.createNew', th: 'สร้างหน้าใหม่', en: 'Create New Page' },
        { key: 'bo.pages.edit', th: 'แก้ไข', en: 'Edit' },
        { key: 'bo.pages.hidden', th: 'ซ่อน', en: 'Hidden' },
        { key: 'bo.pages.navbar', th: 'แถบนำทาง', en: 'Navbar' },
        { key: 'bo.pages.preview', th: 'ดูตัวอย่าง', en: 'Preview' },
        { key: 'bo.pages.publish', th: 'เผยแพร่', en: 'Publish' },
        { key: 'bo.pages.search', th: 'ค้นหาหน้า...', en: 'Search pages...' },
        { key: 'bo.pages.sections', th: 'ส่วนประกอบ', en: 'Components' },
        { key: 'bo.pages.showNavbar', th: 'แสดงใน Navbar', en: 'Show in Navbar' },
        { key: 'bo.pages.slug', th: 'ลิงก์', en: 'Slug' },
        { key: 'bo.pages.unpublish', th: 'ยกเลิกเผยแพร่', en: 'Unpublish' },
        { key: 'bo.pages.updated', th: 'อัปเดตล่าสุด', en: 'Updated' },
        { key: 'bo.pages.views', th: 'การเข้าชม', en: 'Views' },
        // Settings
        { key: 'bo.settings.address', th: 'ที่อยู่', en: 'Address' },
        { key: 'bo.settings.addUser', th: '+ เพิ่มผู้ใช้', en: '+ Add User' },
        { key: 'bo.settings.changePassword', th: 'เปลี่ยนรหัสผ่าน', en: 'Change Password' },
        { key: 'bo.settings.description', th: 'คำอธิบาย', en: 'Description' },
        { key: 'bo.settings.email', th: 'อีเมลติดต่อ', en: 'Contact Email' },
        { key: 'bo.settings.emailTab', th: 'การแจ้งเตือนอีเมล', en: 'Email Notification' },
        { key: 'bo.settings.phone', th: 'เบอร์โทร', en: 'Phone' },
        { key: 'bo.settings.privacyPolicy', th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
        { key: 'bo.settings.save', th: 'บันทึก', en: 'Save' },
        { key: 'bo.settings.security', th: 'ความปลอดภัย', en: 'Security' },
        { key: 'bo.settings.siteName', th: 'ชื่อเว็บไซต์', en: 'Site Name' },
        { key: 'bo.settings.systemInfo', th: 'ข้อมูลระบบ', en: 'System Info' },
        { key: 'bo.settings.userManagement', th: 'จัดการผู้ใช้', en: 'User Management' },
        { key: 'bo.settings.websiteInfo', th: 'ข้อมูลเว็บไซต์', en: 'Website Info' },
        // Email settings
        { key: 'bo.settings.email.disabled', th: 'ปิดใช้งาน', en: 'Disabled' },
        { key: 'bo.settings.email.enabled', th: 'เปิดใช้งาน', en: 'Enabled' },
        { key: 'bo.settings.email.enableToggle', th: 'เปิดใช้งานการส่งอีเมลแจ้งเตือน', en: 'Enable email notifications' },
        { key: 'bo.settings.email.fromEmail', th: 'อีเมลผู้ส่ง', en: 'From Email' },
        { key: 'bo.settings.email.fromName', th: 'ชื่อผู้ส่ง', en: 'From Name' },
        { key: 'bo.settings.email.recipientEmail', th: 'อีเมลผู้รับแจ้งเตือน', en: 'Recipient Email' },
        { key: 'bo.settings.email.recipientHint', th: 'หากมีหลายอีเมล ให้คั่นด้วยเครื่องหมายจุลภาค (,)', en: 'Separate multiple emails with commas (,)' },
        { key: 'bo.settings.email.saveBtn', th: 'บันทึกการตั้งค่า', en: 'Save Settings' },
        { key: 'bo.settings.email.saving', th: 'กำลังบันทึก...', en: 'Saving...' },
        { key: 'bo.settings.email.sending', th: 'กำลังส่ง...', en: 'Sending...' },
        { key: 'bo.settings.email.smtpHost', th: 'SMTP Host', en: 'SMTP Host' },
        { key: 'bo.settings.email.smtpPassword', th: 'SMTP Password / App Password', en: 'SMTP Password / App Password' },
        { key: 'bo.settings.email.smtpPort', th: 'SMTP Port', en: 'SMTP Port' },
        { key: 'bo.settings.email.smtpTitle', th: 'ตั้งค่า SMTP Server', en: 'SMTP Server Settings' },
        { key: 'bo.settings.email.smtpUser', th: 'SMTP Username', en: 'SMTP Username' },
        { key: 'bo.settings.email.subtitle', th: 'ตั้งค่าอีเมลที่จะรับแจ้งเตือนเมื่อมีผู้ติดต่อจากหน้าเว็บไซต์', en: 'Configure notification emails for website contact submissions' },
        { key: 'bo.settings.email.testBtn', th: 'ทดสอบส่งอีเมล', en: 'Send Test Email' },
        { key: 'bo.settings.email.title', th: 'ตั้งค่าอีเมลแจ้งเตือน', en: 'Email Notification Settings' },
        // Theme
        { key: 'bo.theme.brandColors', th: 'สีแบรนด์หลัก', en: 'Brand Colors' },
        { key: 'bo.theme.brandDesc', th: 'สีเหล่านี้จะถูกใช้ทั่วทั้งเว็บไซต์', en: 'These colors are used throughout the website' },
        { key: 'bo.theme.fonts', th: 'ฟอนต์', en: 'Fonts' },
        { key: 'bo.theme.fontsDesc', th: 'กำหนดฟอนต์หลักและน้ำหนักของตัวอักษร', en: 'Set primary font and font weight' },
        { key: 'bo.theme.reset', th: 'รีเซ็ต', en: 'Reset' },
        { key: 'bo.theme.saved', th: 'บันทึกแล้ว!', en: 'Saved!' },
        { key: 'bo.theme.saving', th: 'กำลังบันทึก...', en: 'Saving...' },
        { key: 'bo.theme.sectionColors', th: 'สีแต่ละ Section', en: 'Section Colors' },
        { key: 'bo.theme.sectionDesc', th: 'กำหนดสีพื้นหลัง, สีข้อความ, และหัวข้อสำหรับแต่ละส่วนของเว็บ', en: 'Set background, text, and heading colors for each section' },
        { key: 'bo.theme.subtitle', th: 'เปลี่ยนเฉดสีและสีฟอนต์ในแต่ละส่วนของเว็บไซต์', en: 'Customize colors and fonts for each website section' },
        { key: 'bo.theme.title', th: 'ธีมและสี', en: 'Theme & Colors' },
    ];

    /**
     * Generate all backoffice UI translation keys (bo.*).
     * Merges the static BO_KEYS list with dynamic keys collected from the frontend.
     * Creates missing TH/EN keys and auto-translates to other active languages.
     */
    async generateBoKeys(usedKeys?: Record<string, string>): Promise<{ success: boolean; created: number; skipped: number; keys: string[] }> {
        let created = 0;
        let skipped = 0;
        const createdKeys: string[] = [];

        // Build combined key map: static BO_KEYS + dynamic usedKeys from frontend
        const allKeys: Array<{ key: string; th: string; en: string }> = [...TranslationsService.BO_KEYS];
        const existingKeySet = new Set(allKeys.map(k => k.key));

        // Merge dynamic keys from frontend (only bo.* keys)
        if (usedKeys && typeof usedKeys === 'object') {
            for (const [key, fallback] of Object.entries(usedKeys)) {
                if (!key.startsWith('bo.') || existingKeySet.has(key)) continue;
                
                // Detect if fallback is Thai or English
                const isThai = /[\u0E00-\u0E7F]/.test(fallback);
                allKeys.push({
                    key,
                    th: isThai ? fallback : '',
                    en: isThai ? '' : fallback,
                });
                existingKeySet.add(key);
            }
        }

        // Get other active languages (besides TH/EN)
        const otherLangs = (await this.getActiveLanguages())
            .filter(l => l.languageCode !== 'th' && l.languageCode !== 'en');

        console.log(`🔧 Gen Backoffice: processing ${allKeys.length} keys (${TranslationsService.BO_KEYS.length} static + ${allKeys.length - TranslationsService.BO_KEYS.length} dynamic)...`);

        for (const item of allKeys) {
            const pageKey = item.key.split('.').slice(0, 2).join('.');

            // Check if TH already exists
            const existingTh = await this.transRepo.findOne({
                where: { labelKey: item.key, languageCode: 'th' },
            });

            if (existingTh) {
                skipped++;
                continue;
            }

            // Resolve TH/EN values (auto-translate if one is missing)
            let thValue = item.th;
            let enValue = item.en;

            if (!thValue && enValue) {
                thValue = await this.autoTranslate(enValue, 'th', 'en');
                await new Promise(resolve => setTimeout(resolve, 120));
            } else if (!enValue && thValue) {
                enValue = await this.autoTranslate(thValue, 'en', 'th');
                await new Promise(resolve => setTimeout(resolve, 120));
            }

            // Fallback to key name if both are empty
            if (!thValue) thValue = item.key;
            if (!enValue) enValue = item.key;

            // Create TH (safe upsert)
            await this.safeUpsert({
                languageCode: 'th',
                pageKey,
                labelKey: item.key,
                labelValue: thValue,
            });

            // Create EN (safe upsert)
            await this.safeUpsert({
                languageCode: 'en',
                pageKey,
                labelKey: item.key,
                labelValue: enValue,
            });

            // Auto-translate to other active languages (safe upsert)
            for (const lang of otherLangs) {
                try {
                    const translated = await this.autoTranslate(enValue, lang.languageCode, 'en');
                    await this.safeUpsert({
                        languageCode: lang.languageCode,
                        pageKey,
                        labelKey: item.key,
                        labelValue: translated,
                    });
                    await new Promise(resolve => setTimeout(resolve, 120));
                } catch {
                    // skip failed translations
                }
            }

            created++;
            createdKeys.push(item.key);
            console.log(`   ✅ Created: ${item.key}`);
        }

        console.log(`✅ Backoffice keys generation complete: ${created} created, ${skipped} skipped`);
        return { success: true, created, skipped, keys: createdKeys };
    }
}

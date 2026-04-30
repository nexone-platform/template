"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Trophy, ArrowLeft } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, LoadingSpinner, EmptyState, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Types ── */
type QuizStatus = "DRAFT" | "SUCCESS" | "FAIL";
type ChoiceKey = "optionA" | "optionB" | "optionC" | "optionD";

interface ManageResume {
    manageResumeId: number; firstName?: string | null; lastName?: string | null;
    email?: string | null; positionName?: string | null;
}
interface Question {
    questionsId: number; categoryId?: number | null; position?: number | null;
    questions?: string | null; optionA?: string | null; optionB?: string | null;
    optionC?: string | null; optionD?: string | null; correctAns?: string | null;
    codeSnippets?: string | null; imgPath?: string | null;
}
interface AssignedCategoryRow {
    categoryId: number; categoryName: string; status: string;
    scorePercent: number | null; scoreText: string | null; score: number;
    spentMinutes?: number | null;
}
interface TestingCreateRequest {
    manageResumeId: number; categoryId: number; totalQuestions: number;
    correctCount: number; score: number; status: QuizStatus;
    answersJson: string; spentSeconds?: number;
}

/* ── Helpers ── */
const formatTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
};

const correctAnsToChoice = (ans: string | null | undefined): ChoiceKey | null => {
    if (!ans) return null;
    const upper = ans.toUpperCase().trim();
    if (["OPTIONA", "OPTIONB", "OPTIONC", "OPTIOND"].includes(upper)) return upper.charAt(0).toLowerCase() + upper.slice(1) as ChoiceKey;
    const n = Number(upper);
    if (n === 2) return "optionA"; if (n === 3) return "optionB";
    if (n === 4) return "optionC"; if (n === 5) return "optionD";
    return null;
};

const buildScoreDisplay = (scoreText?: string | null, scorePercent?: number | null): string => {
    if (!scoreText) return "-";
    const slashPart = scoreText.includes("/") ? "/" + scoreText.split("/")[1] : "";
    return `${scorePercent ?? 0}${slashPart}`;
};

/* ── OptionButton (must be declared outside the page component) ── */
function OptionButton({ label, choiceKey, q, isSelected, disabled, onSelect }: {
    label: string; choiceKey: ChoiceKey; q: Question;
    isSelected: boolean; disabled: boolean; onSelect: (qId: number, ck: ChoiceKey) => void;
}) {
    return (
        <button type="button" disabled={disabled} onClick={() => onSelect(q.questionsId, choiceKey)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium ${isSelected ? "bg-nv-violet text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-nv-violet hover:bg-nv-violet-light"} disabled:opacity-70`}>
            <b>{label}.</b> {(q as any)[choiceKey] ?? "-"}
        </button>
    );
}

export default function ExperienceLevelPage() {
    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <ExperienceLevelContent />
        </React.Suspense>
    );
}

function ExperienceLevelContent() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const searchParams = useSearchParams();
    const manageResumeId = Number(searchParams.get("manageResumeId") ?? 1);

    const [view, setView] = useState<"list" | "exam" | "result">("list");
    const [mode, setMode] = useState<"exam" | "result">("exam");
    const [categoryId, setCategoryId] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});
    const [submittedAnswers] = useState<Record<number, ChoiceKey>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [spentSeconds, setSpentSeconds] = useState(0);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { data: applicant } = useQuery({
        queryKey: ["testingApplicant", manageResumeId],
        queryFn: async () => { const { data } = await apiClient.get<any>(`testing/getManageResumeById/${manageResumeId}`); return data as ManageResume; },
    });

    const { data: assignedCategoriesData, isLoading, refetch: refetchCategories } = useQuery({
        queryKey: ["testingCategories", manageResumeId],
        queryFn: async () => { const { data } = await apiClient.get<any>(`testing/getAssignedCategories/${manageResumeId}`); return data; },
    });

    const assignedCategories: AssignedCategoryRow[] = useMemo(() => assignedCategoriesData?.data ?? [], [assignedCategoriesData]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setSpentSeconds(prev => prev + 1), 1000);
    }, []);
    const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
    useEffect(() => () => stopTimer(), [stopTimer]);

    const startExam = async (row: AssignedCategoryRow) => {
        setCategoryId(row.categoryId); setView("exam"); setMode("exam");
        setAnswers({}); setQuestions([]); setCurrentIndex(0); setSpentSeconds(0);
        stopTimer(); startTimer(); setIsLoadingQuestions(true);
        try {
            const { data } = await apiClient.get<any>(`testing/getQuestionsByManageResume/${manageResumeId}`);
            const list: Question[] = data?.data ?? [];
            const filtered = list.filter(q => (q.categoryId ?? 0) === row.categoryId);
            filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            setQuestions(filtered); setCurrentIndex(0);
        } catch { setQuestions([]); showError('SAVE_ERROR', 'Error!', 'ดึงข้อสอบไม่สำเร็จ'); }
        setIsLoadingQuestions(false);
    };

    const submitMutation = useMutation({
        mutationFn: async (payload: TestingCreateRequest) => { const { data } = await apiClient.post<any>("testing/update", payload); return data; },
        onSuccess: (_, vars) => {
            showSuccess('SAVE_SUCCESS', 'ส่งคำตอบแล้ว ✅', `คะแนน ${vars.score}% (${vars.correctCount}/${vars.totalQuestions})`);
            setIsSubmitting(false); stopTimer(); setView("list"); refetchCategories();
        },
        onError: () => { setIsSubmitting(false); showError('SAVE_ERROR', 'Error!', 'บันทึกผลสอบไม่สำเร็จ'); },
    });

    const currentQuestion = questions[currentIndex] ?? null;
    const selectAnswer = (qId: number, choice: ChoiceKey) => { if (mode !== "exam") return; setAnswers(prev => ({ ...prev, [qId]: choice })); };
    const canGoNext = (): boolean => { if (!currentQuestion) return false; if (mode === "result") return true; return !!answers[currentQuestion.questionsId]; };
    const next = () => { if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1); };
    const prev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
    const progressPercent = (): number => { if (!questions.length) return 0; return Math.round(((currentIndex + 1) / questions.length) * 100); };

    const handleSubmit = () => {
        if (isSubmitting) return;
        const unanswered = questions.filter(q => !answers[q.questionsId]);
        if (unanswered.length) { showWarning('REQUIRED_FIELDS', 'Warning!', `ยังตอบไม่ครบ ${unanswered.length} ข้อ`); return; }
        setIsSubmitting(true); stopTimer();
        let correct = 0;
        for (const q of questions) { const sel = answers[q.questionsId]; const right = correctAnsToChoice(q.correctAns); if (sel && right && sel === right) correct++; }
        const total = questions.length;
        const answersPayload = questions.map(q => ({ questionsId: q.questionsId, selected: answers[q.questionsId], correct: q.correctAns ?? null }));
        submitMutation.mutate({ manageResumeId, categoryId, totalQuestions: total, correctCount: correct, score: correct, status: "SUCCESS", answersJson: JSON.stringify(answersPayload), spentSeconds });
    };

    const backToList = () => { stopTimer(); setView("list"); setQuestions([]); setAnswers({}); setCurrentIndex(0); };

    const getIsSelected = (qId: number, choiceKey: ChoiceKey) =>
        mode === "result" ? submittedAnswers[qId] === choiceKey : answers[qId] === choiceKey;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Applicant Testing', 'Applicant Testing')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Jobs', 'Jobs') }, { label: t('Testing', 'Testing') }]}
                extra={view === "exam" ? (
                    <span className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {formatTime(spentSeconds)}
                    </span>
                ) : undefined}
            />

            {isLoading ? <LoadingSpinner /> : (
                <>
                    {/* Applicant Card */}
                    <div className={`${ui.tableWrapper} mb-6`}>
                        <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Applicant: {applicant?.firstName ?? "-"} {applicant?.lastName ?? "-"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    ResumeId: {applicant?.manageResumeId ?? manageResumeId} | Email: {applicant?.email ?? "-"} | Position: {applicant?.positionName ?? "-"}
                                </p>
                            </div>
                            <div className="w-full md:w-48">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-nv-violet h-2.5 rounded-full transition-all" style={{ width: `${progressPercent()}%` }} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{progressPercent()}%</p>
                            </div>
                        </div>
                    </div>

                    {/* LIST VIEW */}
                    {view === "list" && (
                        <div className={ui.tableWrapper}>
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">{t('Knowledge Test', 'แบบทดสอบความรู้')}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className={ui.table}>
                                    <thead className={ui.thead}>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Test', 'แบบทดสอบ')}</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase" style={{ width: 160 }}>{t('Start Test', 'เริ่มทดสอบ')}</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase" style={{ width: 140 }}>{t('Test Result', 'ผลการทดสอบ')}</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase" style={{ width: 140 }}>{t('Score (%)', 'คะแนน (%)')}</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase" style={{ width: 180 }}>{t('Time Spent', 'เวลาที่ใช้')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className={ui.tbody}>
                                        {assignedCategories.length === 0 ? (
                                            <EmptyState colSpan={5} message={t('No test found', 'ไม่พบรายการแบบทดสอบ')} />
                                        ) : assignedCategories.map((row, idx) => (
                                            <tr key={row.categoryId || idx} className={ui.tr}>
                                                <td className={ui.tdBold}>{row.categoryName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => startExam(row)} disabled={row.status === "SUCCESS"}
                                                        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${row.status === "SUCCESS" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ui.btnPrimary}`}>
                                                        {t('Start Test', 'เริ่มทดสอบ')}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <StatusBadge status={buildScoreDisplay(row.scoreText, row.scorePercent)} variant={row.status === "SUCCESS" ? "success" : "default"} />
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-600">{row.score != null ? `${row.score}%` : "-"}</td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-600">{row.spentMinutes != null ? `${row.spentMinutes} ${t('minutes', 'นาที')}` : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* EXAM VIEW */}
                    {(view === "exam" || view === "result") && (
                        <div className={ui.tableWrapper}>
                            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                                <button onClick={backToList} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <h3 className="text-lg font-semibold text-gray-800">{mode === "result" ? "Result" : "Exam"}</h3>
                            </div>
                            <div className="p-6">
                                {isLoadingQuestions ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Loading questions...
                                    </div>
                                ) : currentQuestion ? (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">Question {currentIndex + 1}</h4>
                                                <p className="text-sm text-gray-500">Category: {categoryId}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">QID: {currentQuestion.questionsId}</span>
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-800 mb-4">{currentQuestion.questions}</h3>
                                        {currentQuestion.codeSnippets && (
                                            <div className="mb-4">
                                                <label className="text-sm font-semibold text-gray-700 block mb-1">Code Snippet</label>
                                                <pre className="p-4 bg-gray-100 rounded-lg text-sm whitespace-pre-wrap font-mono">{currentQuestion.codeSnippets}</pre>
                                            </div>
                                        )}
                                        {currentQuestion.imgPath && (
                                            <div className="mb-4">
                                                <label className="text-sm font-semibold text-gray-700 block mb-1">Image</label>
                                                <img src={currentQuestion.imgPath} className="max-w-full rounded-lg" alt="question" />
                                            </div>
                                        )}
                                        <div className="space-y-3 mb-6">
                                            <OptionButton label="A" choiceKey="optionA" q={currentQuestion} isSelected={getIsSelected(currentQuestion.questionsId, "optionA")} disabled={mode === "result"} onSelect={selectAnswer} />
                                            <OptionButton label="B" choiceKey="optionB" q={currentQuestion} isSelected={getIsSelected(currentQuestion.questionsId, "optionB")} disabled={mode === "result"} onSelect={selectAnswer} />
                                            <OptionButton label="C" choiceKey="optionC" q={currentQuestion} isSelected={getIsSelected(currentQuestion.questionsId, "optionC")} disabled={mode === "result"} onSelect={selectAnswer} />
                                            <OptionButton label="D" choiceKey="optionD" q={currentQuestion} isSelected={getIsSelected(currentQuestion.questionsId, "optionD")} disabled={mode === "result"} onSelect={selectAnswer} />
                                        </div>
                                        <hr className="my-4" />
                                        <div className="flex justify-between items-center">
                                            <button onClick={prev} disabled={currentIndex === 0}
                                                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
                                                <ChevronLeft className="w-4 h-4" /> {t('Previous', 'Previous')}
                                            </button>
                                            <span className="text-sm text-gray-500">{t('Select answer to proceed', 'ต้องเลือกคำตอบก่อนถึงจะไปข้อถัดไปได้')}</span>
                                            {currentIndex < questions.length - 1 ? (
                                                <button onClick={next} disabled={mode === "exam" && !canGoNext()}
                                                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition ${ui.btnPrimary}`}>
                                                    {t('Next', 'Next')} <ChevronRight className="w-4 h-4" />
                                                </button>
                                            ) : mode === "exam" ? (
                                                <button onClick={handleSubmit} disabled={isSubmitting}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-nv-violet-dark disabled:opacity-50 transition">
                                                    <Trophy className="w-4 h-4" /> {isSubmitting ? t('Submitting...', 'Submitting...') : t('Submit Exam', 'Submit Exam')}
                                                </button>
                                            ) : <div />}
                                        </div>
                                    </>
                                ) : (
                                    <h4 className="text-center text-gray-500 py-8">{t('No questions found', 'ไม่พบข้อสอบ')}</h4>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

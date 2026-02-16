export interface SubjectStats {
    classes_held: number;
    classes_attended: number;
    attendance_required: number;
    internal_marks: number;
    max_internal_marks: number;
    passing_marks: number;
    exam_weightage: number;
    weekly_study_hours: number;
    assignment_completion: number;
}

export const calculateAttendancePercentage = (held: number, attended: number) => {
    if (held === 0) return 100; // New subjects start with perfect record
    return (attended / held) * 100;
};

export const calculatePassProbability = (stats: SubjectStats) => {
    // Attendance Score (30%)
    const attendancePct = calculateAttendancePercentage(stats.classes_held, stats.classes_attended);
    const attendanceScore = Math.min(100, (attendancePct / (stats.attendance_required || 75)) * 100) * 0.3;

    // Internal Marks Score (40%)
    // Based on how much of the passing threshold has been secured via internals
    const internalScore = stats.passing_marks > 0
        ? Math.min(100, (stats.internal_marks / stats.passing_marks) * 100) * 0.4
        : 40; // If passing marks is 0, internals are already sufficient

    // Study Hours Score (30%)
    // Logic: 10+ hours/week is a "perfect" score for this weight
    const studyScore = Math.min(100, (stats.weekly_study_hours / 10) * 100) * 0.3;

    return Math.round(attendanceScore + internalScore + studyScore);
};

export const calculateBunkPredictor = (held: number, attended: number, required: number, totalPlanned: number) => {
    const currentPct = calculateAttendancePercentage(held, attended);
    const req = required || 75;

    // Max bunks allowed while staying above threshold
    // (attended / (held + future_held)) >= req/100
    // attended >= (held + future_held) * (req/100)
    // future_held <= (attended / (req/100)) - held

    if (req === 0) return { currentPct, maxFutureBunks: 99, isCritical: false };

    // If held is 0, they haven't started yet, so they can't bunk "away" credit
    if (held === 0) return { currentPct: 100, maxFutureBunks: 0, isCritical: false };

    const maxTotalClassesAllowed = Math.floor(attended / (req / 100));
    const maxFutureBunks = Math.max(0, maxTotalClassesAllowed - held);

    return {
        currentPct,
        maxFutureBunks,
        isCritical: currentPct < req
    };
};

export const calculateRequiredFinalsScore = (stats: SubjectStats) => {
    // Total passing marks required = stats.passing_marks
    // current_marks = stats.internal_marks
    // external_weightage = stats.exam_weightage
    // Required in finals = (passing_marks - internal_marks) / (external_weightage / 100)

    const required = (stats.passing_marks - stats.internal_marks);
    const requiredPercentage = (required / stats.exam_weightage) * 100;

    return {
        requiredMarks: Math.max(0, required),
        requiredPercentage: Math.max(0, Math.round(requiredPercentage))
    };
};

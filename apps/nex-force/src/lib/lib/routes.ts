/**
 * Route constants — replaces Angular's static `routes` class.
 *
 * In Angular these were static getters with `BehaviorSubject` for RTL support.
 * In Next.js we use simple constants since file-based routing handles navigation.
 */
export const ROUTES = {
    // Auth
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    registerLine: "/mobile/register-line",
    changePassword: "/change-password",

    // Dashboard
    dashboard: "/dashboard/employee",
    adminDashboard: "/dashboard/admin",
    employeeDashboard: "/dashboard/employee",

    // Employees
    employees: "/employees",
    employeePage: "/employees/employee-page",
    employeeProfile: (id: string | number) => `/employees/employee-profile/${id}`,
    departments: "/employees/departments",
    designations: "/employees/designations",
    holidays: "/employees/holidays",
    leaveAdmin: "/employees/leave-admin",
    leaveEmployee: "/employees/leave-employee",
    leaveSettings: "/employees/leave-settings",
    leaveType: "/employees/leave-type",
    attendanceAdmin: "/employees/attendance-admin",
    attendanceEmployee: "/employees/attendance-employee",
    timesheet: "/employees/timesheet",
    overtime: "/employees/overtime",
    overtimeAdmin: "/employees/overtime-admin",
    overtimeType: "/employees/overtime-type",
    workingDays: "/employees/working-days",

    // Clients
    clientPage: "/clients/client-page",
    clientProfile: (id: string | number) => `/clients/client-profile/${id}`,

    // Projects
    projects: "/projects",
    projectPage: "/projects/project-page",
    projectView: (id: string | number) => `/projects/project-view/${id}`,
    projectList: "/projects/project-list",
    projectType: "/projects/project-type",
    tasks: "/projects/tasks",

    // Assets
    assets: "/assets",
    assetsDetails: (id: string | number) => `/assets/${id}`,
    userAssetsDetails: "/assets/user-assets",

    // Jobs
    jobs: "/jobs",
    manageJobs: "/jobs/manage-jobs",
    manageResumes: "/jobs/manage-resumes",
    resumeProfile: (id: string | number) => `/jobs/manage-resumes-profile/${id}`,
    interviewQuestions: "/jobs/interview-questions",
    scheduleTiming: "/jobs/schedule-timing",
    shortlist: "/jobs/shortlist",
    aptitudeResult: "/jobs/aptitude-result",
    experienceLevel: "/jobs/experience-level",

    // Payroll
    payroll: "/payroll",
    employeeSalaryAdmin: "/payroll/employee-salary-admin",
    addSalaryDetail: "/payroll/employee-salary-admin/add-salary-detail",
    approveSalary: "/payroll/approve-salary",
    payrollItems: "/payroll/payroll-items",
    salaryView: (id: string | number) => `/payroll/salary-view/${id}`,

    // Settings
    companySettings: "/settings/company-settings",
    users: "/users/user-view",

    // Performances
    promotion: "/promotion/views",
    promotionAdmin: "/promotion/admin",
    resignation: "/resignation",
    resignationMain: "/resignation/res-main",
    resignationAdmin: "/resignation/res-admin",
    termination: "/termination",
    terminationMain: "/termination/term-main",
    terminationType: "/termination/term-type",

    // Tax
    taxMain: "/tax/tax-main",
    taxType: "/tax/tax-type",
    taxIncome: "/tax/tax-income",

    // Reports
    leaveReport: "/reports/leave-report",

    // Apps
    calendar: "/apps/calendar",

    // Mobile
    checkIn: "/mobile/check-in",
    mobileAnnouncement: "/mobile/announcement",
} as const;

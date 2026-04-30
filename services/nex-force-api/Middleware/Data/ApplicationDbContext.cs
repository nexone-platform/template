using Microsoft.AspNetCore.SignalR.Protocol;
using Microsoft.EntityFrameworkCore;
using Middleware.Configurations;
using Middleware.Models;
using Middlewares.Configurations;
using Middlewares.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middleware.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Additions> Additions { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<AssetCategory> AssetCategorys { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Employment> Employments { get; set; }
        public DbSet<EmploymentHistory> EmploymentHistorys { get; set; }
        public DbSet<DeductionEmployeeAssignment> DeductionEmployeeAssignments { get; set; }
        public DbSet<Deduction> Deductions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Designation> Designations { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<EmployeeOtp> EmployeeOtps { get; set; }
        public DbSet<Gender> Genders { get; set; }
        public DbSet<MaritalStatus> MaritalStatuss { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Terminate> Terminates { get; set; }
        public DbSet<CheckIn> CheckIns { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectType> ProjectTypes { get; set; }
        public DbSet<PersonalAdditional> PersonalAdditionals { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<LeaveQuota> LeaveQuotas { get; set; }
        public DbSet<SpecialWorkingDays> SpecialWorkingDays { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<OvertimeRequest> OvertimeRequests { get; set; }
        public DbSet<Resignation> Resignations { get; set; }
        public DbSet<OtType> OtTypes { get; set; }
        public DbSet<PaymentType> PaymentTypes { get; set; }
        public DbSet<EmployeeType> EmployeeTypes { get; set; }
        public DbSet<AdditionEmployeeAssignment> AdditionEmployeeAssignments { get; set; }
        public DbSet<LogCheckInOutResult> LogCheckInOutResults { get; set; }
        public DbSet<Logs> LoggError { get; set; }
        public DbSet<PersonalDeduction> PersonalDeductions { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<PeriodPayroll> PeriodPayrolls { get; set; }
        public DbSet<SocialSecurityRate> SocialSecurityRates { get; set; }
        public DbSet<TerminateType> TerminateTypes { get; set; }
        public DbSet<TaxDeductionType> TaxDeductionTypes { get; set; }
        public DbSet<TaxDeduction> TaxDeductions { get; set; }
        public DbSet<IncomeTaxBracket> IncomeTaxBrackets { get; set; }
        public DbSet<TaxResult> TaxResults { get; set; }
        public DbSet<Tasks> Tasks { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }
        public DbSet<TimesheetDetail> TimesheetDetails { get; set;}
        public DbSet<Menu> Menus { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Branch> Branchs { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<DocumentRunning> DocumentRunning { get; set; }
        public DbSet<Prefixes> Prefixes { get; set; }
        public DbSet<ManageJobs> ManageJobs { get; set; }
        public DbSet<ManageResume> ManageResume { get; set; }
        public DbSet<NotificationChanel> NotificationChanel { get; set; }
        public DbSet<NotificationModule> NotificationModule { get; set; }
        public DbSet<NotificationSetting> NotificationSetting { get; set; }
        public DbSet<EmailSetting> EmailSettings { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<Label> Labels { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<LanguageTranslation> LanguageTranslations { get; set; }
        public DbSet<ResponseMessage> ResponseMessages { get; set; }

        public DbSet<ApprovalLog> ApprovalLogs { get; set; }
        public DbSet<ApprovalStep> ApprovalSteps { get; set; }
        public DbSet<ApprovalRule> ApprovalRules { get; set; }
        public DbSet<ApprovalStatus> ApprovalStatuses { get; set; }
        public DbSet<RuleType> RuleTypes { get; set; }
        public DbSet<ApprovalReference> ApprovalReferences { get; set; }
        public DbSet<ApprovalCancelReason> ApprovalCancelReasons { get; set; }
        public DbSet<Title> Title { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Questions> Questions { get; set; }
        public DbSet<ScheduleTiming> ScheduleTiming { get; set; }
        public DbSet<ManageApplicantTesting> ManageApplicantTesting { get; set; }
        public DbSet<Testing> Testing { get; set; }
        public DbSet<ProjectFile> ProjectFiles { get; set; }

        public DbSet<InterviewResult> InterviewResult { get; set; }

        public DbSet<ProjectAssignment> ProjectAssignments { get; set; }
        public DbSet<ProjectCostDetail> ProjectCostDetails { get; set; }
        public DbSet<ProjectCost> ProjectCosts { get; set; }
        public DbSet<SystemConfig> SystemConfigs { get; set; }
        public DbSet<ThemeSettings> ThemeSettings { get; set; }
        public DbSet<TaskBoard> TaskBoards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
      
        {
            modelBuilder.Entity<LogCheckInOutResult>()
                .HasNoKey();
            modelBuilder.Entity<TaxResult>()
                .HasNoKey();
            modelBuilder.HasDefaultSchema("solution-one");
            base.OnModelCreating(modelBuilder);



            modelBuilder.ApplyConfiguration(new ProjectCostConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectCostDetailConfiguration());
            modelBuilder.ApplyConfiguration(new TimesheetConfiguration());
            modelBuilder.ApplyConfiguration(new TimesheetDetailConfiguration());
            modelBuilder.ApplyConfiguration(new AdditionEmployeeAssignmentConfiguration());
            modelBuilder.ApplyConfiguration(new AdditionsConfiguration());
            modelBuilder.ApplyConfiguration(new AssetConfiguration());
            modelBuilder.ApplyConfiguration(new AssetCategoryConfiguration());
            modelBuilder.ApplyConfiguration(new EmployeeConfiguration());
            modelBuilder.ApplyConfiguration(new EmploymentConfiguration());
            modelBuilder.ApplyConfiguration(new EmploymentHistoryConfiguration());
            modelBuilder.ApplyConfiguration(new DeductionEmployeeAssignmentConfiguration());
            modelBuilder.ApplyConfiguration(new DeductionConfiguration());
            modelBuilder.ApplyConfiguration(new RoleConfiguration());
            modelBuilder.ApplyConfiguration(new HolidayConfiguration());
            modelBuilder.ApplyConfiguration(new DepartmentConfiguration());
            modelBuilder.ApplyConfiguration(new DesignationConfiguration());
            modelBuilder.ApplyConfiguration(new LeaveTypeConfiguration());
            modelBuilder.ApplyConfiguration(new OrganizationConfiguration()); 
            modelBuilder.ApplyConfiguration(new EmployeeOtpConfiguration());
            modelBuilder.ApplyConfiguration(new GenderConfiguration());
            modelBuilder.ApplyConfiguration(new MaritalStatusConfiguration());
            modelBuilder.ApplyConfiguration(new CheckInConfiguration());
            modelBuilder.ApplyConfiguration(new AuthTbMsUserConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectTypeConfiguration());
            modelBuilder.ApplyConfiguration(new ClientConfiguration());
            modelBuilder.ApplyConfiguration(new SpecialWorkingDaysConfiguration());
            modelBuilder.ApplyConfiguration(new LeaveQuotaConfiguration());
            modelBuilder.ApplyConfiguration(new LeaveRequestConfiguration());
            modelBuilder.ApplyConfiguration(new ResignationConfiguration());
            modelBuilder.ApplyConfiguration(new OvertimeRequestConfiguration());
            modelBuilder.ApplyConfiguration(new PersonalAdditionalConfiguration());
            modelBuilder.ApplyConfiguration(new OtTypeConfiguration());
            modelBuilder.ApplyConfiguration(new PromotionConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentTypeConfiguration());
            modelBuilder.ApplyConfiguration(new EmployeeTypeConfiguration());
            modelBuilder.ApplyConfiguration(new LogsConfiguration());
            modelBuilder.ApplyConfiguration(new PersonalDeductionConfiguration());
            modelBuilder.ApplyConfiguration(new PayrollConfiguration());
            modelBuilder.ApplyConfiguration(new PeriodPayrollConfiguration());
            modelBuilder.ApplyConfiguration(new SocialSecurityRateConfiguration());
            modelBuilder.ApplyConfiguration(new TerminateConfiguration());
            modelBuilder.ApplyConfiguration(new TerminateTypeConfiguration());
            modelBuilder.ApplyConfiguration(new TaxDeductionTypeConfiguration());
            modelBuilder.ApplyConfiguration(new TaxDeductionConfiguration());
            modelBuilder.ApplyConfiguration(new IncomeTaxBracketConfiguration());
            modelBuilder.ApplyConfiguration(new TasksConfiguration());
            modelBuilder.ApplyConfiguration(new MenuConfiguration());
            modelBuilder.ApplyConfiguration(new RolePermissionConfiguration());
            modelBuilder.ApplyConfiguration(new BranchConfiguration());
            modelBuilder.ApplyConfiguration(new EmailTemplateConfiguration());
            modelBuilder.ApplyConfiguration(new DocumentRunningConfiguration());
            modelBuilder.ApplyConfiguration(new PreFixesConfiguration()); 
            modelBuilder.ApplyConfiguration(new EmailSettingConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationChanelConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationModuleConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationSettingConfiguration());
            modelBuilder.ApplyConfiguration(new LabelConfiguration());
            modelBuilder.ApplyConfiguration(new LanguageConfiguration());
            modelBuilder.ApplyConfiguration(new LanguageTranslationConfiguration());
            modelBuilder.ApplyConfiguration(new PageConfiguration());

            modelBuilder.ApplyConfiguration(new ApprovalLogConfiguration());
            modelBuilder.ApplyConfiguration(new ApprovalStepConfiguration());
            modelBuilder.ApplyConfiguration(new ApprovalRuleConfiguration());
            modelBuilder.ApplyConfiguration(new ApprovalStatusConfiguration());
            modelBuilder.ApplyConfiguration(new RuleTypeConfiguration());
            modelBuilder.ApplyConfiguration(new ApprovalReferenceConfig());
            modelBuilder.ApplyConfiguration(new ApprovalCancelReasonConfig());
            modelBuilder.ApplyConfiguration(new ManageJobsConfiguration());
            modelBuilder.ApplyConfiguration(new ManageResumeConfiguration());
            modelBuilder.ApplyConfiguration(new TitleConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
            modelBuilder.ApplyConfiguration(new QuestionsConfiguration());
            modelBuilder.ApplyConfiguration(new ScheduleTimingConfiguration());
            modelBuilder.ApplyConfiguration(new ManageApplicantTestingConfiguration());
            modelBuilder.ApplyConfiguration(new TestingConfiguration());
            modelBuilder.ApplyConfiguration(new BankConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectFileConfiguration());
            modelBuilder.ApplyConfiguration(new InterviewResultConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectAssignmentConfiguration());
            modelBuilder.ApplyConfiguration(new SystemConfigConfiguration());
            modelBuilder.ApplyConfiguration(new ResponseMessageConfiguration());
            modelBuilder.ApplyConfiguration(new ThemeSettingsConfiguration());
            modelBuilder.ApplyConfiguration(new TaskBoardConfiguration());
        }
    }
    public class LogCheckInOutResult
    {
        public string? Message { get; set; }
    }

    public class TaxResult
    {
        [Column("annual_tax")]
        public decimal AnnualTax { get; set; }

        [Column("monthly_tax")]
        public decimal MonthlyTax { get; set; }

        [Column("last_month_tax")]
        public decimal LastMonthTax { get; set; }
    }
}


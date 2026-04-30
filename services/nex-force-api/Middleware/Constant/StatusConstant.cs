using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Constant
{
    public class StatusConstant
    {
        public enum LeaveRequestStatus
        {
            New,
            Approved,
            Rejected,
            Declined
        }
 
        public enum AdditionTypeEnum
        {
            Salary = 1,
            Overtime = 2,
            Commission = 3,
            Bonus = 4,
            Travel = 5,
            Shift = 6,
            Other = 7
        }

        public enum AssignmentType
        {
            NoAssignee = 1,      // ไม่ได้กำหนดพนักงาน หรือใช้กับ Option 1 (ไม่ระบุ)
            AllEmployees = 2,    // สำหรับทุกพนักงาน (Option 2)
            Specific = 3,        // ระบุพนักงานรายบุคคล
            Department = 4,      // ระบุแผนก
            Project = 5          // ระบุโปรเจกต์
        }

        public enum DeductionTypeEnum
        {
            SocialSecurityFund = 1,
            WithholdingTax = 2,
            StudentLoanFund = 3,
            AbsentLeaveLate = 4,
            Other = 5
        }

        public enum PeriodStatus
        {
            Draft = 1,              // ฉบับร่าง
            Pending = 2,    // รออนุมัติ
            Approved = 3,           // อนุมัติ
            Declined = 4,     // รอชำระเงิน
            Return = 5,
        }
        public enum PaymentChannel
        {
            BankTransfer = 1,
            CashPayment = 2
        }

        public enum ApproveStatus
        {
            New = 1,              // ฉบับร่าง
            WaitForApprove = 2,    // รออนุมัติ
            Approved = 3,           // อนุมัติ
            Declined = 4,     
            Return = 5,
            Cancelled = 6,
        }
        public static class RefTypes
        {
            public const string Leave = "LEAVE";
            public const string Resign = "RESIGNATION";
            public const string Promotion = "PROMOTION";
            public const string Overtime = "OVERTIME";
        }

    }
}

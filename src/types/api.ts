export type Role = 'ROLE_ADMIN' | 'ROLE_HR_MANAGER' | 'ROLE_EMPLOYEE'
export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'UNPAID'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export interface Page<T> { content:T[]; number:number; size:number; totalElements:number; totalPages:number; first:boolean; last:boolean }
export interface ApiError { success:boolean; message:string; timestamp:string }
export interface AuthResponse { accessToken:string; tokenType:string }
export interface MeResponse { userId:number; username:string; role:Role; employeeId:number|null; firstName:string|null; lastName:string|null; profilePhoto:string|null }
export interface Employee {
 id:number; firstName:string; lastName:string; email:string; phoneNumber:string; salary:number; hireDate:string;
 departmentId:number; departmentName:string; profilePhoto:string|null; kraPin:string|null; nssfNumber:string|null; shaNumber:string|null
}
export interface Department { id:number; name:string; code:string }
export interface Leave { id:number; employeeId:number; employeeName:string; leaveType:LeaveType; startDate:string; endDate:string; reason:string; status:LeaveStatus; appliedDate:string }
export interface Attendance { id:number; employeeId:number; employeeName:string; attendanceDate:string; checkInTime:string|null; checkOutTime:string|null; workingHours:string|null; late:boolean; overtime:boolean; status?:string }
export interface Payroll {
 id:number; employeeId:number; employeeName:string; payrollMonth:string; basicSalary:number; houseAllowance:number;
 transportAllowance:number; bonus:number; grossPay:number; taxablePay:number; nssf:number; shif:number; housingLevy:number;
 employerNssf:number; employerHousingLevy:number; pensionContribution:number; personalRelief:number; insuranceRelief:number;
 insurancePremium:number; deductions:number; tax:number; netSalary:number; residentTaxpayer:boolean
}
export interface PerformanceReview { id:number; employeeId:number; employeeName:string; reviewDate:string; reviewer:string; rating:number; comments:string; goals:string }
export interface Announcement { id:number; title:string; message:string; publishDate:string; expiryDate:string }
export interface Notification { id:number; title:string; message:string; read:boolean; createdAt:string }
export interface User { id:number; employeeId?:number; username:string; employeeName:string|null; role:Role; enabled:boolean }
export interface SystemLog { id:number; username:string; role:string; action:string; description:string; createdAt:string }
export interface DashboardStats { totalEmployees:number; totalDepartments:number; employeesHiredThisMonth:number; totalPayroll:number; highestSalary:number; lowestSalary:number; averageSalary:number }
export interface CompanyProfile { companyName:string; kraPin:string|null; nssfEmployerNumber:string|null; shaEmployerNumber:string|null; address:string|null; phoneNumber:string|null; email:string|null }
export interface StatutoryObligation { code:string; name:string; employeeAmount:number; employerAmount:number; totalAmount:number; dueDate:string; dueDateRule:string; remittingAuthority:string }
export interface StatutoryEmployeeLine { employeeId:number; employeeName:string; kraPin:string|null; nssfNumber:string|null; shaNumber:string|null; paye:number; employeeNssf:number; employerNssf:number; shif:number; employeeHousingLevy:number; employerHousingLevy:number }
export interface StatutoryRemittanceReport {
 payrollMonth:string; company:CompanyProfile; employeeCount:number; missingKraPinCount:number; missingNssfNumberCount:number; missingShaNumberCount:number;
 grossPayTotal:number; payeTotal:number; employeeNssfTotal:number; employerNssfTotal:number; shifTotal:number;
 employeeHousingLevyTotal:number; employerHousingLevyTotal:number; totalRemittance:number;
 obligations:StatutoryObligation[]; employees:StatutoryEmployeeLine[]
}

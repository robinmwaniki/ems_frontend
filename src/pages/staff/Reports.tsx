import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import type {Attendance,Employee,Leave,Payroll,PerformanceReview} from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table,{Td} from '@/components/Table'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
type Type='employees'|'payroll'|'leave'|'attendance'|'performance'|'statutory'
type Data=Employee[]|Payroll[]|Leave[]|Attendance[]|PerformanceReview[]
type Cell=string|number|null
const labels:Record<Type,string>={employees:'Employees',payroll:'Payroll',leave:'Leave',attendance:'Attendance',performance:'Performance',statutory:'Kenyan statutory remittances'}
const monthNow=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
const kes=(n:number)=>'KES '+Number(n??0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function ReportsPage(){
 const [type,setType]=useState<Type>('employees');const [month,setMonth]=useState(monthNow())
 const query=useQuery<Data>({queryKey:['reports',type],enabled:type!=='statutory',queryFn:async()=>{switch(type){case'employees':return reportsApi.employees();case'payroll':return reportsApi.payroll();case'leave':return reportsApi.leave();case'attendance':return reportsApi.attendance();case'performance':return reportsApi.performance();default:return[]}}})
 const statutory=useQuery({queryKey:['reports','statutory',month],queryFn:()=>reportsApi.statutoryRemittances(month),enabled:type==='statutory'})
 let headers:string[]=[];let rows:Cell[][]=[]
 switch(type){
 case'employees':headers=['Employee','Email','Department','Salary'];rows=((query.data??[])as Employee[]).map(x=>[x.firstName+' '+x.lastName,x.email,x.departmentName,x.salary]);break
 case'payroll':headers=['Employee','Month','Basic salary','Net salary'];rows=((query.data??[])as Payroll[]).map(x=>[x.employeeName,x.payrollMonth,x.basicSalary,x.netSalary]);break
 case'leave':headers=['Employee','Type','Start','End','Status'];rows=((query.data??[])as Leave[]).map(x=>[x.employeeName,x.leaveType,x.startDate,x.endDate,x.status]);break
 case'attendance':headers=['Employee','Date','Check in','Check out','Status'];rows=((query.data??[])as Attendance[]).map(x=>[x.employeeName,x.attendanceDate,x.checkInTime??'—',x.checkOutTime??'—',x.status??(x.late?'LATE':'PRESENT')]);break
 case'performance':headers=['Employee','Review date','Reviewer','Rating'];rows=((query.data??[])as PerformanceReview[]).map(x=>[x.employeeName,x.reviewDate,x.reviewer,x.rating]);break
 }
 const download=async()=>{try{await reportsApi.downloadStatutoryCsv(month)}catch{toast.error('Unable to download report.')}}
 return <div><PageHeader title="Reports" subtitle="Operational and statutory reports from EMS records."/>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'.75rem',marginBottom:'1rem'}}>
 <label style={{display:'grid',gap:'.4rem'}}>Report category<select value={type} onChange={e=>setType(e.target.value as Type)} style={{padding:'.65rem',border:'1px solid var(--border)',borderRadius:10}}>{(Object.keys(labels)as Type[]).map(k=><option key={k} value={k}>{labels[k]}</option>)}</select></label>
 {type==='statutory'&&<label style={{display:'grid',gap:'.4rem'}}>Payroll month<input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{padding:'.65rem',border:'1px solid var(--border)',borderRadius:10}}/></label>}
 </div>
 {type==='statutory'?statutory.isLoading?<Card><p style={{padding:'2rem'}}>Preparing statutory report…</p></Card>:statutory.isError||!statutory.data?<Card><p style={{padding:'2rem'}}>Unable to load statutory remittances. Confirm payroll exists for this month and access is authorized.</p></Card>:<div style={{display:'grid',gap:'1rem'}}>
 <Card style={{padding:'1.25rem'}}><div style={{display:'flex',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap',alignItems:'center'}}><div><h3>{statutory.data.company.companyName}</h3><p style={{color:'var(--muted)'}}>Payroll {statutory.data.payrollMonth} · {statutory.data.employeeCount} employees</p></div><Button onClick={download}>Download CSV</Button></div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'.75rem'}}>{[['PAYE',statutory.data.payeTotal],['Employee NSSF',statutory.data.employeeNssfTotal],['Employer NSSF',statutory.data.employerNssfTotal],['SHIF',statutory.data.shifTotal],['Employee Housing Levy',statutory.data.employeeHousingLevyTotal],['Employer Housing Levy',statutory.data.employerHousingLevyTotal],['Total remittance',statutory.data.totalRemittance]].map(([k,v])=><div key={String(k)} style={{border:'1px solid var(--border)',borderRadius:12,padding:'.85rem'}}><small style={{color:'var(--muted)'}}>{k}</small><strong style={{display:'block',marginTop:'.3rem'}}>{kes(Number(v))}</strong></div>)}</div></Card>
 {(statutory.data.missingKraPinCount+statutory.data.missingNssfNumberCount+statutory.data.missingShaNumberCount)>0&&<Card style={{padding:'1rem'}}><strong>Employee registration details missing</strong><p style={{color:'var(--muted)'}}>KRA PIN: {statutory.data.missingKraPinCount} · NSSF: {statutory.data.missingNssfNumberCount} · SHA: {statutory.data.missingShaNumberCount}. Complete these records before filing.</p></Card>}
 <Card><h3 style={{padding:'1rem 1rem 0'}}>Obligations and due dates</h3><Table head={['Obligation','Employee','Employer','Total','Due date','Authority']}>{statutory.data.obligations.map(o=><tr key={o.code}><Td>{o.name}</Td><Td>{kes(o.employeeAmount)}</Td><Td>{kes(o.employerAmount)}</Td><Td>{kes(o.totalAmount)}</Td><Td>{o.dueDate}</Td><Td>{o.remittingAuthority}</Td></tr>)}</Table><p style={{padding:'0 1rem 1rem',color:'var(--muted)',fontSize:'.8rem'}}>Housing Levy date excludes weekends but not gazetted public holidays. Confirm the official due date before payment.</p></Card>
 <Card><h3 style={{padding:'1rem 1rem 0'}}>Employee remittance schedule</h3><Table head={['Employee','KRA PIN','NSSF No.','SHA No.','PAYE','NSSF','SHIF','Housing']}>{statutory.data.employees.map(e=><tr key={e.employeeId}><Td>{e.employeeName}</Td><Td>{e.kraPin??'Missing'}</Td><Td>{e.nssfNumber??'Missing'}</Td><Td>{e.shaNumber??'Missing'}</Td><Td>{kes(e.paye)}</Td><Td>{kes(e.employeeNssf)}</Td><Td>{kes(e.shif)}</Td><Td>{kes(e.employeeHousingLevy)}</Td></tr>)}</Table></Card>
 </div>:<Card>{query.isLoading?<p style={{padding:'2rem'}}>Loading report…</p>:query.isError?<p style={{padding:'2rem'}}>Unable to load this report.</p>:<Table head={headers} empty="No records found.">{rows.map((row,i)=><tr key={i}>{row.map((v,j)=><Td key={j}>{v??'—'}</Td>)}</tr>)}</Table>}</Card>}
 </div>
}

import { useState } from 'react'
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query'
import { employeesApi } from '@/api/employees'
import { departmentsApi } from '@/api/departments'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table,{Td} from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'
import ProtectedImage from '@/components/ProtectedImage'
interface Form {firstName:string;lastName:string;email:string;phoneNumber:string;salary:string;hireDate:string;departmentId:string;kraPin:string;nssfNumber:string;shaNumber:string}
const empty:Form={firstName:'',lastName:'',email:'',phoneNumber:'',salary:'',hireDate:'',departmentId:'',kraPin:'',nssfNumber:'',shaNumber:''}
const style={padding:'.65rem .9rem',border:'1px solid var(--border)',borderRadius:10,fontSize:'.9rem',width:'100%'}
export default function EmployeesPage(){
 const qc=useQueryClient();const [page,setPage]=useState(0);const [keyword,setKeyword]=useState('');const [search,setSearch]=useState('');const [show,setShow]=useState(false);const [editing,setEditing]=useState<number|null>(null);const [form,setForm]=useState<Form>(empty)
 const {data,isLoading,isError}=useQuery({queryKey:['employees',page,search],queryFn:()=>employeesApi.list(page,10,search||undefined)})
 const {data:departments=[]}=useQuery({queryKey:['departments'],queryFn:departmentsApi.list})
 const reset=()=>{setForm(empty);setEditing(null);setShow(false)}
 const request=(v:Form)=>({...v,firstName:v.firstName.trim(),lastName:v.lastName.trim(),email:v.email.trim(),phoneNumber:v.phoneNumber.trim(),salary:Number(v.salary),departmentId:Number(v.departmentId),kraPin:v.kraPin.trim(),nssfNumber:v.nssfNumber.trim(),shaNumber:v.shaNumber.trim()})
 const create=useMutation({mutationFn:(v:Form)=>employeesApi.create(request(v)),onSuccess:async()=>{toast.success('Employee created.');await qc.invalidateQueries({queryKey:['employees']});reset()},onError:()=>toast.error('Failed to create employee.')})
 const update=useMutation({mutationFn:({id,v}:{id:number;v:Form})=>employeesApi.update(id,request(v)),onSuccess:async()=>{toast.success('Employee updated.');await qc.invalidateQueries({queryKey:['employees']});reset()},onError:()=>toast.error('Failed to update employee.')})
 const del=useMutation({mutationFn:employeesApi.delete,onSuccess:async()=>{toast.success('Employee deleted.');await qc.invalidateQueries({queryKey:['employees']})},onError:()=>toast.error('Failed to delete employee.')})
 const edit=(e:NonNullable<typeof data>['content'][number])=>{setEditing(e.id);setForm({firstName:e.firstName,lastName:e.lastName,email:e.email,phoneNumber:e.phoneNumber,salary:String(e.salary),hireDate:e.hireDate,departmentId:String(e.departmentId),kraPin:e.kraPin??'',nssfNumber:e.nssfNumber??'',shaNumber:e.shaNumber??''});setShow(true)}
 return <div><PageHeader title="Employees" subtitle="Manage employee records and statutory registration details." action={<div style={{display:'flex',gap:'.75rem',flexWrap:'wrap'}}><form onSubmit={e=>{e.preventDefault();setSearch(keyword.trim());setPage(0)}} style={{display:'flex',gap:'.5rem'}}><input type="search" value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search employees..." style={style}/><Button type="submit" variant="ghost" size="sm">Search</Button></form><Button onClick={()=>{setEditing(null);setForm(empty);setShow(v=>!v)}}>+ Add Employee</Button></div>}/>
 {show&&<Card style={{padding:'1.5rem',marginBottom:'1.5rem'}}><h3>{editing===null?'New Employee':'Edit Employee'}</h3><form onSubmit={e=>{e.preventDefault();if(editing===null){create.mutate(form)}else{update.mutate({id:editing,v:form})}}} style={{display:'grid',gap:'.9rem'}}>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'.75rem'}}>
 {(['firstName','lastName','email','phoneNumber','salary','hireDate'] as const).map(k=><label key={k}><span>{({firstName:'First name',lastName:'Last name',email:'Email',phoneNumber:'Phone',salary:'Salary (KES)',hireDate:'Hire date'})[k]}</span><input required value={form[k]} type={k==='email'?'email':k==='salary'?'number':k==='hireDate'?'date':'text'} min={k==='salary'?'0.01':undefined} step={k==='salary'?'0.01':undefined} onChange={e=>setForm({...form,[k]:e.target.value})} style={style}/></label>)}
 <label><span>Department</span><select required value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})} style={style}><option value="">Select department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
 </div><div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}><h4>Kenyan statutory details <small style={{color:'var(--muted)',fontWeight:400}}>Optional until verified</small></h4><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'.75rem'}}>
 <label><span>KRA PIN</span><input maxLength={11} value={form.kraPin} onChange={e=>setForm({...form,kraPin:e.target.value.toUpperCase()})} style={style}/></label>
 <label><span>NSSF membership number</span><input maxLength={50} value={form.nssfNumber} onChange={e=>setForm({...form,nssfNumber:e.target.value})} style={style}/></label>
 <label><span>SHA membership number</span><input maxLength={50} value={form.shaNumber} onChange={e=>setForm({...form,shaNumber:e.target.value})} style={style}/></label>
 </div></div><div style={{display:'flex',gap:'.5rem'}}><Button type="submit" disabled={create.isPending||update.isPending||departments.length===0}>{create.isPending||update.isPending?'Saving…':editing===null?'Create Employee':'Save Changes'}</Button><Button type="button" variant="secondary" onClick={reset}>Cancel</Button></div></form></Card>}
 <Card>{isLoading?<p style={{padding:'2rem'}}>Loading employees…</p>:isError?<p style={{padding:'2rem'}}>Unable to load employees.</p>:<Table head={['Employee','Phone','Department','Salary','KRA PIN','Actions']} empty="No employees found.">{data?.content.map(e=><tr key={e.id}><Td><div style={{display:'flex',alignItems:'center',gap:'.75rem'}}><div style={{width:40,height:40,borderRadius:'50%',background:'var(--brand-soft)',display:'grid',placeItems:'center',overflow:'hidden'}}>{e.profilePhoto?<ProtectedImage srcPath={employeesApi.photoPath(e.id,e.profilePhoto)} alt={e.firstName} fallback={e.firstName[0]} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:e.firstName[0]}</div><div><strong>{e.firstName} {e.lastName}</strong><div style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.email}</div></div></div></Td><Td>{e.phoneNumber}</Td><Td>{e.departmentName}</Td><Td>KES {Number(e.salary).toLocaleString()}</Td><Td>{e.kraPin??'—'}</Td><Td><div style={{display:'flex',gap:'.4rem'}}><Button variant="ghost" size="sm" onClick={()=>edit(e)}>Edit</Button><Button variant="danger" size="sm" onClick={()=>{if(window.confirm('Delete this employee?'))del.mutate(e.id)}}>Delete</Button></div></Td></tr>)}</Table>}</Card>
 {data&&data.totalPages>0&&<Pager page={page} totalPages={data.totalPages} onPage={setPage}/>}</div>
}

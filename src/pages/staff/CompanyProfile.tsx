import { useEffect,useState } from 'react'
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query'
import { companyProfileApi } from '@/api/companyProfile'
import type { CompanyProfile } from '@/types/api'
import { useAuthStore } from '@/store/auth'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
type Form={companyName:string;kraPin:string;nssfEmployerNumber:string;shaEmployerNumber:string;address:string;phoneNumber:string;email:string}
const empty:Form={companyName:'',kraPin:'',nssfEmployerNumber:'',shaEmployerNumber:'',address:'',phoneNumber:'',email:''}
const input={width:'100%',padding:'.7rem .85rem',border:'1px solid var(--border)',borderRadius:10,background:'var(--surface)',color:'var(--text)'}
export default function CompanyProfilePage(){
 const qc=useQueryClient(); const admin=useAuthStore(s=>s.isAdmin()); const [form,setForm]=useState<Form>(empty)
 const query=useQuery({queryKey:['company-profile'],queryFn:companyProfileApi.get,enabled:admin})
 useEffect(()=>{if(query.data){const p:CompanyProfile=query.data;setForm({companyName:p.companyName??'',kraPin:p.kraPin??'',nssfEmployerNumber:p.nssfEmployerNumber??'',shaEmployerNumber:p.shaEmployerNumber??'',address:p.address??'',phoneNumber:p.phoneNumber??'',email:p.email??''})}},[query.data])
 const save=useMutation({mutationFn:companyProfileApi.update,onSuccess:async p=>{qc.setQueryData(['company-profile'],p);toast.success('Company statutory profile saved.')},onError:()=>toast.error('Unable to save company details.')})
 if(!admin)return <Card><p style={{padding:'1rem'}}>Only an administrator can manage employer registration details.</p></Card>
 const field=(label:string,key:keyof Form,max:number,type='text')=><label style={{display:'grid',gap:'.4rem'}}><span>{label}</span><input type={type} maxLength={max} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={input}/></label>
 return <div><PageHeader title="Company statutory profile" subtitle="Employer registration details used on monthly statutory schedules."/>
 {query.isLoading?<Card><p style={{padding:'2rem'}}>Loading company profile…</p></Card>:query.isError?<Card><p style={{padding:'2rem'}}>Unable to load company profile. Refresh and try again.</p></Card>:
 <Card style={{padding:'1.5rem'}}><form onSubmit={e=>{e.preventDefault();save.mutate({...form,companyName:form.companyName.trim(),kraPin:form.kraPin.trim(),nssfEmployerNumber:form.nssfEmployerNumber.trim(),shaEmployerNumber:form.shaEmployerNumber.trim(),address:form.address.trim(),phoneNumber:form.phoneNumber.trim(),email:form.email.trim()})}} style={{display:'grid',gap:'1rem'}}>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:'.9rem'}}>
 {field('Registered company name','companyName',150)}{field('Company KRA PIN','kraPin',11)}{field('NSSF employer number','nssfEmployerNumber',50)}{field('SHA employer number','shaEmployerNumber',50)}{field('Business address','address',300)}{field('Contact phone','phoneNumber',30)}{field('Contact email','email',255,'email')}
 </div><p style={{color:'var(--muted)',fontSize:'.82rem'}}>The initial company name is EMS Workforce. Replace it with the legal registered name and enter verified registration numbers before filing.</p>
 <div><Button type="submit" disabled={save.isPending||!form.companyName.trim()}>{save.isPending?'Saving…':'Save company details'}</Button></div></form></Card>}</div>
}

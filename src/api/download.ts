import { client } from './client'
async function download(path:string, filename:string, type:string):Promise<void> {
 const response = await client.get<Blob>(path,{responseType:'blob'})
 const url = window.URL.createObjectURL(new Blob([response.data],{type}))
 const anchor = window.document.createElement('a')
 anchor.href=url; anchor.download=filename; anchor.style.display='none'
 window.document.body.appendChild(anchor); anchor.click(); anchor.remove()
 window.setTimeout(()=>window.URL.revokeObjectURL(url),1000)
}
export function downloadPdf(path:string,filename:string):Promise<void> { return download(path,filename,'application/pdf') }
export function downloadCsv(path:string,filename:string):Promise<void> { return download(path,filename,'text/csv;charset=utf-8') }

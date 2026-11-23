import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
type Theme = 'light' | 'dark'
const ThemeContext = createContext<{theme:Theme;toggleTheme:()=>void}|null>(null)
export function ThemeProvider({children}:{children:ReactNode}) {
  const [theme,setTheme]=useState<Theme>(()=>{if(typeof window==='undefined')return 'light';const value=window.localStorage.getItem('ems-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=value;return value})
  useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;window.localStorage.setItem('ems-theme',theme)},[theme])
  return <ThemeContext.Provider value={{theme,toggleTheme:()=>setTheme(v=>v==='light'?'dark':'light')}}>{children}</ThemeContext.Provider>
}
export default function ThemeToggle(){
 const context=useContext(ThemeContext);if(!context)throw new Error('ThemeToggle must be used inside ThemeProvider')
 const {theme,toggleTheme}=context
 return <button type="button" onClick={toggleTheme} aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} aria-pressed={theme==='dark'} title={theme==='light'?'Switch to dark mode':'Switch to light mode'} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'.5rem',minHeight:38,padding:'0 .75rem',border:'1px solid rgba(255,255,255,.16)',borderRadius:9,background:'rgba(255,255,255,.07)',color:'#fff',cursor:'pointer',fontSize:'.82rem',fontWeight:600}}>
 <span aria-hidden="true">{theme==='light'?'☾':'☀'}</span><span>{theme==='light'?'Dark mode':'Light mode'}</span></button>
}
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light'
        return window.localStorage.getItem('ems-theme') === 'dark' ? 'dark' : 'light'
    })

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        window.localStorage.setItem('ems-theme', theme)
    }, [theme])

    return (
        <button
            type="button"
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'.5rem', minHeight:38, padding:'0 .75rem', border:'1px solid rgba(255,255,255,.16)', borderRadius:9, background:'rgba(255,255,255,.07)', color:'#fff', cursor:'pointer', fontSize:'.82rem', fontWeight:600 }}
        >
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
    )
}

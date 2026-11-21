import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { initializeSentry } from '@/observability/sentry'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { ThemeProvider } from '@/components/ThemeToggle'
import './index.css'
initializeSentry()
const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,staleTime:30_000}}})
ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter>
 <ThemeProvider><AppErrorBoundary><App /></AppErrorBoundary></ThemeProvider>
 <Toaster position="top-right" toastOptions={{duration:4000,style:{borderRadius:'12px',fontFamily:'Inter,sans-serif'}}}/>
 </BrowserRouter></QueryClientProvider></React.StrictMode>
)
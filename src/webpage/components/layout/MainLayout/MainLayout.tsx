import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/webpage/components/ui/sonner';
import { Sidebar } from '../Sidebar/Sidebar';
import { YouTubePage } from '@/webpage/content-pages/youtube';
import { GitHubPage } from '@/webpage/content-pages/github';
import { Home } from '../Home/Home';


// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

export interface PagesInterface { id: string; element: JSX.Element; path: string }

const PAGES: PagesInterface[] = [
    {
        id: 'home',
        element: <Home />,
        path: '/'
    },
    {
        id: 'youtube',
        element: <YouTubePage />,
        path: '/site/youtube'
    },
    {
        id: 'github',
        element: <GitHubPage />,
        path: '/site/github'
    }
] 

const MainLayout = () => {
    return (
        <BrowserRouter>
            <Toaster />
            <div className="flex h-screen bg-background">
                <Sidebar pages={PAGES} />
                <main className="flex-1 overflow-auto">
                    {!isExtension && (
                        <div className="sticky top-0 w-full bg-amber-50 border-b border-amber-200 px-6 py-3">
                            <div className="flex items-center gap-2 text-amber-900">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">
                                Development Mode - Load as Chrome extension to enable full functionality
                                </span>
                            </div>
                        </div>
                    )}
                    <Routes>
                        <Route index element={<Home />} />
                        {PAGES.map(page => (
                            <Route key={page.id} path={page.path} element={page.element} />
                        ))}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}

export default MainLayout
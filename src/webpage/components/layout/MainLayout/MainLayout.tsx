import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { YouTubePage } from '@/webpage/content-pages/youtube';
import { GitHubPage } from '@/webpage/content-pages/github';
import { Home } from '../../../content-pages/home';



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
            <div className="flex h-screen bg-background">
                <Sidebar pages={PAGES} />
                <main className="flex-1">

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
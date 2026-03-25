import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Sidebar } from '../Sidebar/Sidebar';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { PAGES } from '../../../configs/pages';
import Home from '@/webpage/pages/home';


const MainLayout = () => {
  const { isExtension } = useSettings();

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar pages={PAGES} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Development Mode Banner */}
          {!isExtension && (
            <div className={cn(
              "relative border-b",
              "bg-gradient-to-r from-amber-50 to-amber-100/50",
              "dark:from-amber-950/50 dark:to-amber-900/20",
              "border-amber-200 dark:border-amber-800"
            )}>
              <div className="px-6 py-3 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Development Mode
                </span>
                <span className="hidden sm:inline text-sm text-amber-700 dark:text-amber-400">
                  — Settings won't be saved
                </span>
              </div>
              {/* Subtle bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route index element={<Home />} />
              {PAGES.map(page => (
                <Route key={page.id} path={page.path} element={page.element} />
              ))}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default MainLayout;
import MainLayout from "./components/layout/MainLayout/MainLayout";
import { Toaster } from '@/webpage/components/ui/sonner';
import { ThemeProvider } from "./components/ThemeProvider";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MainLayout />
      <Toaster />
    </ThemeProvider>
  );
}


export default App;

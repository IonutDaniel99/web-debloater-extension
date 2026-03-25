import MainLayout from "./components/layout/MainLayout/MainLayout";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from '@/webpage/components/ui/sonner';


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MainLayout />
      <Toaster />
    </ThemeProvider>
  );
}


export default App;

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui"


export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    const handleThemeChange = (theme: "light" | "dark") => {
        setTheme(theme)
    }

    return (
        <Button variant="outline" size="icon" onClick={() => handleThemeChange(theme === "light" ? "dark" : "light")}>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
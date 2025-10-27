import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export const ThemeToggle = ({ theme, onThemeChange }: ThemeToggleProps) => {
  const [isChecked, setIsChecked] = useState(theme === "dark");

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

  const handleToggle = (checked: boolean) => {
    setIsChecked(checked);
    const newTheme = checked ? "dark" : "light";
    onThemeChange(newTheme);
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className={`h-4 w-4 transition-all ${!isChecked ? "text-primary" : "text-muted-foreground"}`} />
      <Switch
        id="theme-toggle"
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
      />
      <Moon className={`h-4 w-4 transition-all ${isChecked ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
};
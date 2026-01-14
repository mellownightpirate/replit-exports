import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Download, Upload, ChevronLeft, ChevronRight, Settings2, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRef } from "react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onExport: () => void;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  dateLabel,
  onPrev,
  onNext,
  onExport,
  onImport,
  onReset,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          const success = onImport(result);
          if (!success) {
            alert("Failed to import data. Please check the file format.");
          }
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold hidden sm:block" data-testid="app-title">
              Habit Tracker
            </h1>
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrev}
              data-testid="button-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center hidden sm:block" data-testid="date-label">
              {dateLabel}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              data-testid="button-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-settings">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExport} data-testid="menu-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="menu-import"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                      data-testid="menu-reset"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset All Data
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all your habits, tasks, and tracking data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onReset}>
                        Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </header>
  );
}

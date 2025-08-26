import { useState } from "react";
import {
  Calendar,
  BarChart3,
  Plus,
  Settings,
  Target,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const Layout = ({ children, currentView, onViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "habits", name: "Meus Hábitos", icon: Target },
    { id: "media", name: "Mídias", icon: Film },
    { id: "calendar", name: "Calendário", icon: Calendar },
    { id: "add-habit", name: "Novo Hábito", icon: Plus },
  ];

  return (
    <div className="min-h-svh bg-background">
      {/* Header (h-16 = 4rem) */}
      <header className="h-16 border-b border-border bg-card">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Área abaixo do header ocupa a viewport restante */}
      <div className="flex min-h-[calc(100svh-4rem)]">
        {/* Sidebar */}
        <aside
          className={cn(
            // base: overlay no mobile
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out h-svh",
            // desktop: fica dentro do fluxo, cola no topo do viewport e ocupa a altura restante
            "lg:sticky lg:top-16 lg:translate-x-0 lg:h-[calc(100svh-4rem)]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col pt-16 lg:pt-0">
            {/* rolagem no menu se a lista ficar grande */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onViewChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            <div className="mt-auto p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
            </div>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content: rola o conteúdo, menu fica no tamanho máximo */}
        <main className="flex-1 overflow-y-auto lg:ml-64 lg:ml-0">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

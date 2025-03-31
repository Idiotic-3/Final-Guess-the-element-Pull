import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Game } from "@/components/game";
import { UserNav } from "@/components/user-nav";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="element-game-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <h1 className="text-2xl font-bold">Element Guessing Game</h1>
                <UserNav />
              </div>
            </header>
            <main>
              <Game />
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

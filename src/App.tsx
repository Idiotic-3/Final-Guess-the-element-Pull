import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Game } from "@/components/game";
import { UserNav } from "@/components/user-nav";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

function AppContent() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Element Guessing Game</h1>
          {session && <UserNav />}
        </div>
      </header>
      <main className="container py-6">
        {session ? <Game /> : <AuthForm />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="element-game-theme">
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

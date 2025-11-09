import { NavLink } from "@/components/NavLink";
import { Home, Globe, Database, Package, FileSpreadsheet, Settings, LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navigation = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin } = useUserRole();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Fehler beim Abmelden");
    } else {
      toast.success("Erfolgreich abgemeldet");
      navigate("/");
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <NavLink to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-lg">
              <Package className="w-6 h-6" />
              <span>Produktmanagement</span>
            </NavLink>
            
            {user && (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/dashboard" activeClassName="bg-muted">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </NavLink>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/scraper" activeClassName="bg-muted">
                    <Globe className="w-4 h-4 mr-2" />
                    Scraper
                  </NavLink>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/pixi" activeClassName="bg-muted">
                    <Database className="w-4 h-4 mr-2" />
                    Pixi
                  </NavLink>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/products" activeClassName="bg-muted">
                    <Package className="w-4 h-4 mr-2" />
                    Produkte
                  </NavLink>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/export" activeClassName="bg-muted">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export
                  </NavLink>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/suppliers" activeClassName="bg-muted">
                    <Settings className="w-4 h-4 mr-2" />
                    Lieferanten
                  </NavLink>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="w-4 h-4 mr-2" />
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Users, Activity, Database, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as SupabaseUser } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin, isLoading } = useUserRole(user);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = [
    {
      title: "Gesamt Nutzer",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Aktive Sessions",
      value: "89",
      change: "+5.2%",
      icon: Activity,
      trend: "up",
    },
    {
      title: "Datenbank Größe",
      value: "2.4 GB",
      change: "+18.3%",
      icon: Database,
      trend: "up",
    },
    {
      title: "System Status",
      value: "Optimal",
      change: "100%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const adminTools = [
    {
      title: "Benutzerverwaltung",
      description: "Verwalte Benutzer, Rollen und Berechtigungen",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "System Einstellungen",
      description: "Konfiguriere System-Parameter und Einstellungen",
      icon: Settings,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Sicherheit",
      description: "Überwache Sicherheitsereignisse und Logs",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Datenbank Admin",
      description: "Verwalte Datenbank-Tabellen und Backups",
      icon: Database,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <Badge variant="secondary" className="ml-2">
              Administrator
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Willkommen im Administrator-Bereich. Hier haben Sie vollständigen Zugriff auf alle System-Funktionen.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.change}</span>
                  <span>seit letztem Monat</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {adminTools.map((tool) => (
              <Card 
                key={tool.title} 
                className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                        <tool.icon className={`h-6 w-6 ${tool.color}`} />
                      </div>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Öffnen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Letzte Aktivitäten
            </CardTitle>
            <CardDescription>
              Die neuesten System-Ereignisse und Admin-Aktionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Neuer Benutzer registriert", time: "vor 5 Minuten", type: "info" },
                { action: "Datenbank Backup erstellt", time: "vor 1 Stunde", type: "success" },
                { action: "System Update verfügbar", time: "vor 3 Stunden", type: "warning" },
                { action: "Sicherheitslog überprüft", time: "vor 5 Stunden", type: "info" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "warning" ? "bg-yellow-500" :
                      "bg-blue-500"
                    }`} />
                    <span className="font-medium">{activity.action}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

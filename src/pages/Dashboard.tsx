import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, Database, Package, FileSpreadsheet, Settings, TrendingUp, Clock, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: Globe,
      title: "Product Scraper",
      description: "Scrape Produkte von Lieferanten-Webseiten",
      path: "/scraper",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      stats: "156 Produkte heute"
    },
    {
      icon: Database,
      title: "Pixi ERP Integration",
      description: "Synchronisiere mit deinem Pixi ERP",
      path: "/pixi",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      stats: "Letzte Sync: vor 2h"
    },
    {
      icon: Package,
      title: "Produktverwaltung",
      description: "Verwalte alle gescrapten Produkte",
      path: "/products",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      stats: "3.421 Produkte"
    },
    {
      icon: FileSpreadsheet,
      title: "Export & Import",
      description: "CSV/JSON Export für Pixi",
      path: "/export",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      stats: "12 Exports heute"
    },
    {
      icon: Settings,
      title: "Lieferanten",
      description: "Konfiguriere Lieferanten & Pixi-Nr.",
      path: "/suppliers",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      stats: "5 Lieferanten aktiv"
    }
  ];

  const recentActivity = [
    {
      icon: Globe,
      title: "Scraping abgeschlossen",
      description: "156 neue Produkte von akkuteile-b2b.de",
      time: "vor 15 Min",
      color: "text-blue-500"
    },
    {
      icon: Database,
      title: "Pixi Sync erfolgreich",
      description: "142 Produkte synchronisiert",
      time: "vor 2 Std",
      color: "text-purple-500"
    },
    {
      icon: FileSpreadsheet,
      title: "CSV Export",
      description: "products_2025-01-09.csv erstellt",
      time: "vor 4 Std",
      color: "text-orange-500"
    }
  ];

  const quickStats = [
    {
      label: "Heute gescraped",
      value: "156",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      label: "Verarbeitungszeit",
      value: "2,3 Min",
      icon: Clock,
      color: "text-blue-500"
    },
    {
      label: "Erfolgsrate",
      value: "98%",
      icon: CheckCircle,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Willkommen zurück! Hier ist deine Übersicht.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tools Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Deine Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card 
                  key={tool.path}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 group"
                  onClick={() => navigate(tool.path)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {tool.stats}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Letzte Aktivitäten</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground flex-shrink-0">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

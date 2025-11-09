import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, Database, Package, FileSpreadsheet, Settings } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: Globe,
      title: "Product Scraper",
      description: "Scrape Produkte von Lieferanten-Webseiten und importiere sie automatisch",
      path: "/scraper",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Database,
      title: "Pixi ERP Integration",
      description: "Synchronisiere Produkte mit deinem Pixi ERP System",
      path: "/pixi",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Package,
      title: "Produktverwaltung",
      description: "Verwalte alle gescrapten Produkte und deren Status",
      path: "/products",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: FileSpreadsheet,
      title: "Export & Import",
      description: "Exportiere Produkte als CSV für Pixi oder andere Systeme",
      path: "/export",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Settings,
      title: "Lieferanten",
      description: "Konfiguriere Lieferanten und deren Pixi-Nummern",
      path: "/suppliers",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Produktmanagement Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatisiere deinen Produktimport, synchronisiere mit Pixi ERP und verwalte dein Sortiment effizient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => (
            <Card 
              key={tool.path}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-base">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tool.path);
                  }}
                >
                  Öffnen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Schnellstart</CardTitle>
              <CardDescription>
                Beginne mit dem Product Scraper, um Produkte von Lieferanten zu importieren. 
                Anschließend kannst du sie mit Pixi synchronisieren und verwalten.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;

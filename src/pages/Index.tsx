import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ScrapeProgress } from "@/components/ScrapeProgress";
import { ProductTable } from "@/components/ProductTable";
import { Product, ScrapeRequest } from "@/types/product";
import { mockScrapeAPI } from "@/utils/mockScraper";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Database, LogOut } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pagesScraped, setPagesScraped] = useState(0);
  const [itemsFound, setItemsFound] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleScrape = async (request: ScrapeRequest) => {
    setIsLoading(true);
    setProgress(0);
    setPagesScraped(0);
    setItemsFound(0);
    setProducts([]);

    try {
      const response = await mockScrapeAPI(request, (prog, pages, items) => {
        setProgress(prog);
        setPagesScraped(pages);
        setItemsFound(items);
      });

      if (response.ok) {
        setProducts(response.items);
        toast({
          title: "Scraping erfolgreich",
          description: `${response.count} Produkte gefunden auf ${response.pagesScraped} Seiten`,
        });
      } else {
        toast({
          title: "Fehler beim Scraping",
          description: response.error || "Unbekannter Fehler",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scraping-Fehler:", error);
      toast({
        title: "Fehler",
        description: "Beim Scraping ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(products, `neuheiten-${new Date().toISOString().split("T")[0]}.csv`);
    toast({
      title: "CSV-Export erfolgreich",
      description: `${products.length} Produkte exportiert`,
    });
  };

  const handleExportJSON = () => {
    exportToJSON(products, `neuheiten-${new Date().toISOString().split("T")[0]}.json`);
    toast({
      title: "JSON-Export erfolgreich",
      description: `${products.length} Produkte exportiert`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Erfolgreich abgemeldet",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">
                  Neuheiten Scraper
                </h1>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">
              Erfasse Produkte mit "Neuheit"-Kennzeichnung automatisch aus
              Online-Shops
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Demo-Modus aktiv</AlertTitle>
            <AlertDescription>
              Diese App verwendet aktuell Mock-Daten. Für echtes Web-Scraping
              muss ein separates Backend mit Playwright implementiert werden.
              Die komplette UI und Export-Funktionalität ist bereits
              einsatzbereit.
            </AlertDescription>
          </Alert>

          {/* Form */}
          <ScrapeForm onScrape={handleScrape} isLoading={isLoading} />

          {/* Progress */}
          <ScrapeProgress
            isLoading={isLoading}
            progress={progress}
            pagesScraped={pagesScraped}
            itemsFound={itemsFound}
          />

          {/* Results Table */}
          <ProductTable
            products={products}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

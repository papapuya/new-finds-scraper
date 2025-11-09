import { useState } from "react";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ScrapeProgress } from "@/components/ScrapeProgress";
import { ProductTable } from "@/components/ProductTable";
import { Product, ScrapeRequest } from "@/types/product";
import { mockScrapeAPI } from "@/utils/mockScraper";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pagesScraped, setPagesScraped] = useState(0);
  const [itemsFound, setItemsFound] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const handleScrape = async (request: ScrapeRequest) => {
    setIsLoading(true);
    setProgress(0);
    setPagesScraped(0);
    setItemsFound(0);
    setProducts([]);

    try {
      // Verwende echtes Backend wenn EXTERNAL_SCRAPER_URL konfiguriert ist
      // Ansonsten falle auf Mock-Daten zurück
      const useRealBackend = true; // Ändere auf false für Mock-Modus
      
      if (useRealBackend) {
        toast({
          title: "Scraping gestartet",
          description: "Verbinde mit Backend und führe Login durch...",
        });

        const { data, error } = await supabase.functions.invoke('scrape-products', {
          body: { url: request.url, onlyNew: request.onlyNew }
        });

        if (error) throw error;

        if (data.ok) {
          setProducts(data.items);
          setProgress(100);
          setPagesScraped(data.pagesScraped);
          setItemsFound(data.count);
          toast({
            title: "Scraping erfolgreich",
            description: `${data.count} Produkte mit Händlerpreisen gefunden`,
          });
        } else {
          throw new Error(data.error || "Unbekannter Fehler");
        }
      } else {
        // Mock-Modus für Testing
        const response = await mockScrapeAPI(request, (prog, pages, items) => {
          setProgress(prog);
          setPagesScraped(pages);
          setItemsFound(items);
        });

        if (response.ok) {
          setProducts(response.items);
          toast({
            title: "Scraping erfolgreich (Mock)",
            description: `${response.count} Produkte gefunden auf ${response.pagesScraped} Seiten`,
          });
        }
      }
    } catch (error) {
      console.error("Scraping-Fehler:", error);
      toast({
        title: "Fehler beim Scraping",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Database className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">
                Neuheiten Scraper
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Erfasse Produkte mit "Neuheit"-Kennzeichnung automatisch aus
              Online-Shops
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Backend-Setup erforderlich</AlertTitle>
            <AlertDescription>
              Um echtes Scraping mit Händler-Login zu aktivieren, musst du ein externes
              Node.js Backend mit Playwright deployen. Siehe <code>EXTERNAL_BACKEND_SETUP.md</code> für
              eine detaillierte Anleitung. Die Credentials sind bereits sicher in Lovable Cloud hinterlegt.
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

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

  const handleScrape = async (request: ScrapeRequest & { credentials: { username: string; password: string }; backendUrl: string }) => {
    setIsLoading(true);
    setProgress(0);
    setPagesScraped(0);
    setItemsFound(0);
    setProducts([]);

    try {
      toast({
        title: "Scraping gestartet",
        description: "Verbinde mit lokalem Backend...",
      });

      // Rufe Backend auf (entweder lokal oder Render)
      const response = await fetch(`${request.backendUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: request.url,
          onlyNew: request.onlyNew,
          credentials: request.credentials
        })
      });

      const data = await response.json();

      if (data.success) {
        // Konvertiere Backend-Format zu Frontend-Format
        const convertedProducts: Product[] = data.products.map((p: any) => ({
          product_title: p.title || 'N/A',
          price: p.price || 'N/A',
          brand: 'N/A',
          sku: 'N/A',
          product_url: request.url,
          image_url: p.image || '',
          badges: p.isNew ? 'Neuheit' : '',
          availability_text: 'N/A',
          rating: null,
          category_path: 'N/A'
        }));

        setProducts(convertedProducts);
        setProgress(100);
        setPagesScraped(data.pagesScraped || 1);
        setItemsFound(data.itemsFound || convertedProducts.length);
        toast({
          title: "Scraping erfolgreich",
          description: `${convertedProducts.length} Produkte gefunden`,
        });
      } else {
        throw new Error(data.error || "Unbekannter Fehler");
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
            <AlertTitle>Backend erforderlich</AlertTitle>
            <AlertDescription>
              <strong>Lokales Backend starten:</strong><br />
              <code>cd backend && npm install && npx playwright install chromium && npm start</code>
              <br /><br />
              <strong>Oder auf Render deployen:</strong><br />
              Siehe <code>backend/README.md</code> für Anleitung zum Deployment auf Render.
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

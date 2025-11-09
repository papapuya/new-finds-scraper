import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database } from "lucide-react";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ScrapeProgress } from "@/components/ScrapeProgress";
import { ProductTable } from "@/components/ProductTable";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";

const Scraper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const handleScrape = async (request: { url: string; onlyNew: boolean; credentials: { username: string; password: string }; backendUrl: string }) => {
    setIsLoading(true);
    setProgress(0);
    setCurrentPage(0);
    setTotalPages(0);
    setProducts([]);

    try {
      const response = await fetch(`${request.backendUrl}/api/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          url: request.url,
          onlyNew: request.onlyNew,
          credentials: request.credentials
        }),
      });

      if (!response.ok) {
        throw new Error(`Scraping fehlgeschlagen: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.ok) {
        setProducts(data.items);
        setProgress(100);
        toast.success(`${data.count} Produkte erfolgreich gescraped!`);
      } else {
        toast.error(data.error || "Scraping fehlgeschlagen");
      }
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Scrapen"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(products, `products_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("CSV Export erfolgreich!");
  };

  const handleExportJSON = () => {
    exportToJSON(products, `products_${new Date().toISOString().split('T')[0]}.json`);
    toast.success("JSON Export erfolgreich!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Product Scraper</h1>
            <p className="text-muted-foreground">
              Scrape Produkte von Lieferanten-Webseiten
            </p>
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Backend erforderlich</AlertTitle>
            <AlertDescription>
              Diese Funktion benötigt ein externes Backend für das Scraping.
              Stelle sicher, dass die VITE_EXTERNAL_SCRAPER_URL konfiguriert ist.
            </AlertDescription>
          </Alert>

          <ScrapeForm onScrape={handleScrape} isLoading={isLoading} />

          {(isLoading || progress > 0) && (
            <ScrapeProgress
              isLoading={isLoading}
              progress={progress}
              pagesScraped={totalPages}
              itemsFound={products.length}
            />
          )}

          {products.length > 0 && (
            <ProductTable
              products={products}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Scraper;

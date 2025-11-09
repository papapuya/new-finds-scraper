import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ScrapeProgressProps {
  isLoading: boolean;
  progress: number;
  pagesScraped?: number;
  itemsFound?: number;
}

export const ScrapeProgress = ({
  isLoading,
  progress,
  pagesScraped = 0,
  itemsFound = 0,
}: ScrapeProgressProps) => {
  if (!isLoading && progress === 0) return null;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-success" />
            )}
            <h3 className="font-semibold">
              {isLoading ? "Scraping läuft..." : "Scraping abgeschlossen"}
            </h3>
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Seiten durchsucht</p>
            <p className="text-lg font-semibold">{pagesScraped}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Produkte gefunden</p>
            <p className="text-lg font-semibold">{itemsFound}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

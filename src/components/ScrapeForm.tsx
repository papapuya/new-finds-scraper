import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { ScrapeRequest } from "@/types/product";

interface ScrapeFormProps {
  onScrape: (request: ScrapeRequest) => Promise<void>;
  isLoading: boolean;
}

export const ScrapeForm = ({ onScrape, isLoading }: ScrapeFormProps) => {
  const [url, setUrl] = useState("https://www.akkuteile-b2b.de/");
  const [onlyNew, setOnlyNew] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onScrape({ url, onlyNew });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="url">Kategorie- oder Start-URL</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/kategorie"
            required
            disabled={isLoading}
            className="transition-all"
          />
          <p className="text-sm text-muted-foreground">
            Geben Sie die URL ein, von der aus gescrapt werden soll
          </p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="only-new" className="cursor-pointer">
              Nur Neuheiten
            </Label>
            <p className="text-sm text-muted-foreground">
              Nur Produkte mit "Neuheit"-Badge erfassen
            </p>
          </div>
          <Switch
            id="only-new"
            checked={onlyNew}
            onCheckedChange={setOnlyNew}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scraping läuft...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Scrapen starten
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

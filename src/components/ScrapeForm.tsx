import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { ScrapeRequest } from "@/types/product";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const credentialsSchema = z.object({
  username: z.string().trim().min(1, "Username ist erforderlich").max(100),
  password: z.string().trim().min(1, "Passwort ist erforderlich").max(100),
  url: z.string().trim().url("Ungültige URL").max(500),
});

interface ScrapeFormProps {
  onScrape: (request: ScrapeRequest & { credentials: { username: string; password: string }; backendUrl: string }) => Promise<void>;
  isLoading: boolean;
}

export const ScrapeForm = ({ onScrape, isLoading }: ScrapeFormProps) => {
  const [url, setUrl] = useState("https://www.akkuteile-b2b.de/");
  const [onlyNew, setOnlyNew] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [backendUrl, setBackendUrl] = useState("http://localhost:3000");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      credentialsSchema.parse({ username, password, url });
      await onScrape({ url, onlyNew, credentials: { username, password }, backendUrl });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validierungsfehler",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
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

        <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/50">
          <h3 className="font-medium text-sm">Backend-URL</h3>
          <div className="space-y-2">
            <Label htmlFor="backendUrl">Scraper Backend URL</Label>
            <Input
              id="backendUrl"
              type="url"
              placeholder="https://dein-backend.onrender.com"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Lokal: <code>http://localhost:3000</code> | Render: <code>https://dein-service.onrender.com</code>
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/50">
          <h3 className="font-medium text-sm">Würth B2B Zugangsdaten</h3>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Dein Würth Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="Dein Würth Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Deine Zugangsdaten werden nur für die Anmeldung verwendet und nicht gespeichert.
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

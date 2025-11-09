import { NavLink } from "@/components/NavLink";
import { Home, Globe, Database, Package, FileSpreadsheet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <NavLink to="/" end className="flex items-center gap-2 font-semibold text-lg">
              <Package className="w-6 h-6" />
              <span>Produktmanagement</span>
            </NavLink>
            
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/" end activeClassName="bg-muted">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </NavLink>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/scraper" activeClassName="bg-muted">
                  <Globe className="w-4 h-4 mr-2" />
                  Scraper
                </NavLink>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/pixi" activeClassName="bg-muted">
                  <Database className="w-4 h-4 mr-2" />
                  Pixi
                </NavLink>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/products" activeClassName="bg-muted">
                  <Package className="w-4 h-4 mr-2" />
                  Produkte
                </NavLink>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/export" activeClassName="bg-muted">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export
                </NavLink>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/suppliers" activeClassName="bg-muted">
                  <Settings className="w-4 h-4 mr-2" />
                  Lieferanten
                </NavLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileJson, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const ProductTable = ({
  products,
  onExportCSV,
  onExportJSON,
}: ProductTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.product_title.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.badges.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  if (products.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Ergebnisse</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} von {products.length} Produkten
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={onExportJSON} variant="outline" size="sm">
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Titel, Marke, SKU oder Badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[80px]">Bild</TableHead>
                  <TableHead className="min-w-[250px]">Titel</TableHead>
                  <TableHead>Marke</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Verfügbarkeit</TableHead>
                  <TableHead>Bewertung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.product_title}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-primary"
                      >
                        {product.product_title}
                      </a>
                    </TableCell>
                    <TableCell>{product.brand || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku || "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {product.price || "-"}
                    </TableCell>
                    <TableCell>
                      {product.badges ? (
                        <div className="flex flex-wrap gap-1">
                          {product.badges.split(",").map((badge, i) => (
                            <Badge
                              key={i}
                              variant={
                                badge.trim().toLowerCase().includes("neu")
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {badge.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.availability_text || "-"}
                    </TableCell>
                    <TableCell>
                      {product.rating ? `⭐ ${product.rating}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
};

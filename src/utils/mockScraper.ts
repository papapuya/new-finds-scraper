import { Product, ScrapeRequest, ScrapeResponse } from "@/types/product";

// Mock-Daten für Demo-Zwecke
const generateMockProducts = (count: number): Product[] => {
  const brands = ["Varta", "Panasonic", "Keeppower", "Molicel", "Samsung", "LG"];
  const types = ["18650", "21700", "AAA", "AA", "14500", "26650"];
  const newBadges = ["Neuheit", "Neu", "New"];
  
  return Array.from({ length: count }, (_, i) => {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const hasNewBadge = i < count * 0.3; // 30% sind Neuheiten
    
    return {
      product_title: `${brand} ${type} Li-Ion Akku ${(2500 + Math.random() * 1500).toFixed(0)}mAh`,
      price: `${(3 + Math.random() * 15).toFixed(2)} EUR`,
      brand,
      sku: `${type}-${String(10000 + i).padStart(5, "0")}`,
      product_url: `https://www.akkuteile-b2b.de/p/${type}-${10000 + i}`,
      image_url: "/placeholder.svg",
      badges: hasNewBadge 
        ? `${newBadges[Math.floor(Math.random() * newBadges.length)]},Empfohlen`
        : "Empfohlen",
      availability_text: Math.random() > 0.2 ? "Sofort lieferbar" : "2-3 Tage Lieferzeit",
      rating: Math.random() > 0.3 ? Number((4 + Math.random()).toFixed(1)) : null,
      category_path: `Akkus/${type}/${brand}`,
      attributes: {
        voltage: "3.7V",
        capacity: `${(2500 + Math.random() * 1500).toFixed(0)}mAh`,
        chemistry: "Li-Ion",
      },
    };
  });
};

export const mockScrapeAPI = async (
  request: ScrapeRequest,
  onProgress?: (progress: number, pagesScraped: number, itemsFound: number) => void
): Promise<ScrapeResponse> => {
  console.log("Mock-Scraping gestartet:", request);

  // Simuliere verschiedene Seiten
  const totalPages = 3;
  const productsPerPage = 12;
  let allProducts: Product[] = [];

  for (let page = 1; page <= totalPages; page++) {
    // Simuliere Ladezeit
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pageProducts = generateMockProducts(productsPerPage);
    allProducts = [...allProducts, ...pageProducts];

    const progress = Math.round((page / totalPages) * 100);
    const currentCount = request.onlyNew
      ? allProducts.filter((p) => p.badges.toLowerCase().includes("neu")).length
      : allProducts.length;

    onProgress?.(progress, page, currentCount);
  }

  // Filtere nur Neuheiten wenn aktiviert
  const filteredProducts = request.onlyNew
    ? allProducts.filter((p) => p.badges.toLowerCase().includes("neu"))
    : allProducts;

  console.log(`Mock-Scraping abgeschlossen: ${filteredProducts.length} Produkte gefunden`);

  return {
    ok: true,
    count: filteredProducts.length,
    items: filteredProducts,
    pagesScraped: totalPages,
  };
};

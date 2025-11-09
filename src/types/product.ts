export interface Product {
  product_title: string;
  price: string;
  brand: string;
  sku: string;
  product_url: string;
  image_url: string;
  badges: string;
  availability_text: string;
  rating: number | null;
  category_path: string;
  attributes?: Record<string, string>;
}

export interface ScrapeRequest {
  url: string;
  onlyNew: boolean;
}

export interface ScrapeResponse {
  ok: boolean;
  count: number;
  items: Product[];
  pagesScraped?: number;
  error?: string;
}

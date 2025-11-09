import { Product } from "@/types/product";

export const exportToCSV = (products: Product[], filename = "products.csv") => {
  const headers = [
    "product_title",
    "price",
    "brand",
    "sku",
    "product_url",
    "image_url",
    "badges",
    "availability_text",
    "rating",
    "category_path",
    "attributes",
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((product) =>
    headers
      .map((header) => {
        const value = product[header as keyof Product];
        if (header === "attributes" && typeof value === "object") {
          return escapeCSV(JSON.stringify(value));
        }
        return escapeCSV(value as string | number | null);
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (products: Product[], filename = "products.json") => {
  const json = JSON.stringify(products, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

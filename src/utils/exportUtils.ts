import { Product } from "@/types/product";

export const exportToCSV = (products: Product[], filename = "products.csv") => {
  const headers = [
    "p_item_number",
    "p_group_path[de]",
    "p_brand",
    "p_status",
    "p_name[de]",
    "p_tax_class",
    "p_never_out_of_stock",
    "p_condition",
    "v_item_number",
    "v_ean",
    "v_manufacturers_item_number",
    "v_status",
    "v_classification",
    "v_price[Eur]",
    "v_delivery_time[de]",
    "v_supplier[Eur]",
    "v_supplier_item_number",
    "v_purchase_price",
    "v_never_out_of_stock[standard]",
    "v_weight",
    "p_country",
    "v_customs_tariff_number",
    "v_customs_tariff_text",
    "p_description[de]",
    "p_attributes[OTTOMARKET_GEFAHRGUT][de]",
    "v_attributes[OTTOMARKET_GEFAHRGUT][de]",
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(";") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const mapProductToPixi = (product: Product) => {
    return {
      "p_item_number": product.sku || "",
      "p_group_path[de]": product.category_path || "",
      "p_brand": product.brand || "",
      "p_status": "active",
      "p_name[de]": product.product_title || "",
      "p_tax_class": "standard",
      "p_never_out_of_stock": "false",
      "p_condition": "new",
      "v_item_number": product.sku || "",
      "v_ean": "",
      "v_manufacturers_item_number": product.sku || "",
      "v_status": product.availability_text || "",
      "v_classification": "",
      "v_price[Eur]": product.price || "",
      "v_delivery_time[de]": product.availability_text || "",
      "v_supplier[Eur]": "",
      "v_supplier_item_number": product.sku || "",
      "v_purchase_price": "",
      "v_never_out_of_stock[standard]": "false",
      "v_weight": "",
      "p_country": "DE",
      "v_customs_tariff_number": "",
      "v_customs_tariff_text": "",
      "p_description[de]": "",
      "p_attributes[OTTOMARKET_GEFAHRGUT][de]": "",
      "v_attributes[OTTOMARKET_GEFAHRGUT][de]": "",
    };
  };

  const rows = products.map((product) => {
    const mappedProduct = mapProductToPixi(product);
    return headers
      .map((header) => escapeCSV(mappedProduct[header as keyof typeof mappedProduct]))
      .join(";");
  });

  const csv = [headers.join(";"), ...rows].join("\n");

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

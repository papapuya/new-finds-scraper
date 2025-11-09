import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, TestTube } from "lucide-react";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  supplier_id: z.string().min(1, "Lieferantennummer ist erforderlich"),
  url_pattern: z.string().url("Gültige URL erforderlich"),
  description: z.string().optional(),
});

type Supplier = {
  id: string;
  name: string;
  description: string | null;
  supplier_id: string;
  url_pattern: string;
  login_url: string | null;
  username_field_selector: string | null;
  password_field_selector: string | null;
  username_value: string | null;
  password_value: string | null;
  user_agent: string | null;
  session_cookie: string | null;
  auto_login_enabled: boolean;
  use_session_cookies: boolean;
  product_selectors: any;
  test_url: string | null;
  css_selector_product_link: string | null;
  active: boolean;
};

const Suppliers = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supplier_id: "",
    url_pattern: "",
    login_url: "",
    username_field_selector: "input[name='email']",
    password_field_selector: "input[name='password']",
    username_value: "",
    password_value: "",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    session_cookie: "",
    auto_login_enabled: true,
    use_session_cookies: false,
    test_url: "",
    css_selector_product_link: ".product-image-link",
    product_selectors: {
      artikelnummer: "{itemprop='sku'}, .product-code, .article-number",
      ean: "{itemprop='gtin13'}, .ean-code, .product-ean",
      preis: ".price-caliber, .b2b-price, .price_amount, .price",
      bilder: ".product-images img, [itemprop='image'], .gallery",
      produktname: "h1[itemprop='name'], .product-title, .headline",
      hersteller: "[itemprop='brand'], .manufacturer, .brand-name",
      beschreibung: "[itemprop='description'], .product-description",
      gewicht: "[itemprop='weight'], .weight",
      höhe: "td:contains('Höhe') + td",
      kategorie: ".breadcrumb, [itemprop='category']"
    }
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Fehler beim Laden der Lieferanten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      supplierSchema.parse(formData);

      const supplierData = {
        ...formData,
        product_selectors: formData.product_selectors,
      };

      if (editingSupplier) {
        const { error } = await supabase
          .from("suppliers")
          .update(supplierData)
          .eq("id", editingSupplier.id);

        if (error) throw error;
        toast.success("Lieferant aktualisiert");
      } else {
        const { error } = await supabase
          .from("suppliers")
          .insert([supplierData]);

        if (error) throw error;
        toast.success("Lieferant erstellt");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error saving supplier:", error);
        toast.error("Fehler beim Speichern");
      }
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      description: supplier.description || "",
      supplier_id: supplier.supplier_id,
      url_pattern: supplier.url_pattern,
      login_url: supplier.login_url || "",
      username_field_selector: supplier.username_field_selector || "input[name='email']",
      password_field_selector: supplier.password_field_selector || "input[name='password']",
      username_value: supplier.username_value || "",
      password_value: supplier.password_value || "",
      user_agent: supplier.user_agent || "",
      session_cookie: supplier.session_cookie || "",
      auto_login_enabled: supplier.auto_login_enabled,
      use_session_cookies: supplier.use_session_cookies,
      test_url: supplier.test_url || "",
      css_selector_product_link: supplier.css_selector_product_link || "",
      product_selectors: supplier.product_selectors || {}
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Lieferant wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Lieferant gelöscht");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      description: "",
      supplier_id: "",
      url_pattern: "",
      login_url: "",
      username_field_selector: "input[name='email']",
      password_field_selector: "input[name='password']",
      username_value: "",
      password_value: "",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      session_cookie: "",
      auto_login_enabled: true,
      use_session_cookies: false,
      test_url: "",
      css_selector_product_link: ".product-image-link",
      product_selectors: {
        artikelnummer: "{itemprop='sku'}, .product-code",
        ean: "{itemprop='gtin13'}, .ean-code",
        preis: ".price-caliber, .b2b-price, .price",
        bilder: ".product-images img, [itemprop='image']",
        produktname: "h1[itemprop='name'], .product-title",
        hersteller: "[itemprop='brand'], .manufacturer",
        beschreibung: "[itemprop='description'], .product-description",
        gewicht: "[itemprop='weight'], .weight",
        höhe: "td:contains('Höhe') + td",
        kategorie: ".breadcrumb, [itemprop='category']"
      }
    });
  };

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lieferantenverwaltung</h1>
          <p className="text-muted-foreground">Verwalte Lieferanten-Konfigurationen für den Scraper</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Lieferant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Lieferant bearbeiten" : "Neuer Lieferant"}</DialogTitle>
              <DialogDescription>
                Konfigurieren Sie die CSS-Selektoren für einen Lieferanten
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplier_id">Lieferantennummer *</Label>
                  <Input
                    id="supplier_id"
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    placeholder="7073"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url_pattern">URL-Muster *</Label>
                  <Input
                    id="url_pattern"
                    type="url"
                    value={formData.url_pattern}
                    onChange={(e) => setFormData({ ...formData, url_pattern: e.target.value })}
                    placeholder="https://www.akkuteile-b2b.de/"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Akkus, Ladegeräte, Taschenlampen..."
                  />
                </div>
              </div>

              {/* Login Config */}
              <Card>
                <CardHeader>
                  <CardTitle>🔐 Authentifizierung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_login">Automatischer Login</Label>
                    <Switch
                      id="auto_login"
                      checked={formData.auto_login_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_login_enabled: checked })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login_url">Login-URL</Label>
                    <Input
                      id="login_url"
                      type="url"
                      value={formData.login_url}
                      onChange={(e) => setFormData({ ...formData, login_url: e.target.value })}
                      placeholder="https://www.akkuteile-b2b.de/login"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username_field">Username-Feld-Selektor</Label>
                      <Input
                        id="username_field"
                        value={formData.username_field_selector}
                        onChange={(e) => setFormData({ ...formData, username_field_selector: e.target.value })}
                        placeholder="input[name='email']"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password_field">Passwort-Feld-Selektor</Label>
                      <Input
                        id="password_field"
                        value={formData.password_field_selector}
                        onChange={(e) => setFormData({ ...formData, password_field_selector: e.target.value })}
                        placeholder="input[name='password']"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username_value">Benutzername</Label>
                      <Input
                        id="username_value"
                        value={formData.username_value}
                        onChange={(e) => setFormData({ ...formData, username_value: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password_value">Passwort</Label>
                      <Input
                        id="password_value"
                        type="password"
                        value={formData.password_value}
                        onChange={(e) => setFormData({ ...formData, password_value: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="user_agent">Custom User-Agent</Label>
                    <Input
                      id="user_agent"
                      value={formData.user_agent}
                      onChange={(e) => setFormData({ ...formData, user_agent: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="session_cookie">Session Cookies</Label>
                    <Textarea
                      id="session_cookie"
                      value={formData.session_cookie}
                      onChange={(e) => setFormData({ ...formData, session_cookie: e.target.value })}
                      placeholder="plentyID=xyz; session-id=abcd..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Selectors */}
              <Card>
                <CardHeader>
                  <CardTitle>🛍️ Produkt-Selektoren</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(formData.product_selectors).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="capitalize">{key}</Label>
                      <Input
                        id={key}
                        value={value as string}
                        onChange={(e) => setFormData({
                          ...formData,
                          product_selectors: {
                            ...formData.product_selectors,
                            [key]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Test Config */}
              <Card>
                <CardHeader>
                  <CardTitle>🧪 Test-Konfiguration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test_url">Test-URL</Label>
                    <Input
                      id="test_url"
                      type="url"
                      value={formData.test_url}
                      onChange={(e) => setFormData({ ...formData, test_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="css_product_link">CSS-Selektor Produktlink</Label>
                    <Input
                      id="css_product_link"
                      value={formData.css_selector_product_link}
                      onChange={(e) => setFormData({ ...formData, css_selector_product_link: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Speichern
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{supplier.name}</span>
                <span className="text-sm text-muted-foreground">#{supplier.supplier_id}</span>
              </CardTitle>
              <CardDescription>{supplier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground truncate">{supplier.url_pattern}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(supplier.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;

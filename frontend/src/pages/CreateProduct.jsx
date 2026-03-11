import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = product, 2 = auction dates

  const [form, setForm] = useState({
    title: "", description: "", starting_price: "",
    category_id: "", subcategory_id: "",
    start_date: "", end_date: "",
  });

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  const handleCategoryChange = (catId) => {
    setForm((f) => ({ ...f, category_id: catId, subcategory_id: "" }));
    const cat = categories.find((c) => c.id === parseInt(catId));
    setSubcategories(cat?.subcategories || []);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      // Step 1: create product
      const { data: product } = await api.post("/products", {
        title: form.title,
        description: form.description,
        starting_price: parseFloat(form.starting_price),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
        subcategory_id: form.subcategory_id ? parseInt(form.subcategory_id) : undefined,
      });

      // Step 2: create auction for this product
      await api.post("/auctions", {
        product_id: product.id,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      });

      navigate("/auctions");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page animate-fade-up" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 4 }}>List a Product</h1>
        <p style={{ color: "var(--muted)" }}>Fill in the details to create your auction listing.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[{ n: 1, label: "Product Details" }, { n: 2, label: "Auction Schedule" }].map(({ n, label }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: step >= n ? "var(--amber)" : "var(--surface-2)",
              border: `2px solid ${step >= n ? "var(--amber)" : "var(--border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.8rem",
              color: step >= n ? "#000" : "var(--muted)",
              transition: "all 0.3s ease",
            }}>{n}</div>
            <span style={{ fontSize: "0.82rem", color: step >= n ? "var(--text)" : "var(--muted)", fontWeight: step >= n ? 600 : 400 }}>
              {label}
            </span>
            {n < 2 && <div style={{ flex: 1, height: 1, background: step > n ? "var(--amber)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="msg-error" style={{ marginBottom: 20 }}>{error}</div>}

        {step === 1 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label>Product Title *</label>
                <input className="input" placeholder="e.g. Vintage Rolex Submariner"
                  value={form.title} onChange={set("title")} required />
              </div>
              <div>
                <label>Description</label>
                <textarea className="input" rows={4}
                  placeholder="Describe the item — condition, history, specifications..."
                  value={form.description} onChange={set("description")}
                  style={{ resize: "vertical", minHeight: 100 }} />
              </div>
              <div>
                <label>Starting Price ($) *</label>
                <input className="input" type="number" min="0.01" step="0.01"
                  placeholder="0.00" value={form.starting_price} onChange={set("starting_price")} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label>Category</label>
                  <select className="input" value={form.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Subcategory</label>
                  <select className="input" value={form.subcategory_id}
                    onChange={set("subcategory_id")} disabled={!form.category_id}>
                    <option value="">Select subcategory</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" className="btn-primary"
                style={{ alignSelf: "flex-end" }}
                onClick={() => {
                  if (!form.title || !form.starting_price) {
                    setError("Title and starting price are required.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}>
                Next: Set Schedule →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                padding: 14, background: "var(--surface-2)",
                borderRadius: 8, border: "1px solid var(--border)",
                fontSize: "0.82rem", color: "var(--muted)",
              }}>
                💡 The auction will automatically activate at the start date and close at the end date.
              </div>
              <div>
                <label>Auction Start Date *</label>
                <input className="input" type="datetime-local"
                  value={form.start_date} onChange={set("start_date")} required />
              </div>
              <div>
                <label>Auction End Date *</label>
                <input className="input" type="datetime-local"
                  value={form.end_date} onChange={set("end_date")} required />
              </div>

              {/* Summary */}
              <div style={{
                padding: 16, background: "rgba(245,158,11,0.06)",
                borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)",
              }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.85rem", marginBottom: 10, color: "var(--amber)" }}>
                  LISTING SUMMARY
                </div>
                {[
                  { label: "Title", value: form.title },
                  { label: "Starting Price", value: `$${form.starting_price}` },
                  { label: "Category", value: categories.find(c => c.id === parseInt(form.category_id))?.name || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 6 }}>
                    <span style={{ color: "var(--muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                  {loading ? "Creating listing..." : "🏷️ Publish Auction"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
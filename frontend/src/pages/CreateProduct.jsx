import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Label = ({ children, required }) => (
  <div style={{
    fontSize: "0.65rem", color: "var(--muted)",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontWeight: 700, marginBottom: 6,
  }}>
    {children}{required && <span style={{ color: "var(--lime)", marginLeft: 4 }}>*</span>}
  </div>
);

// ── Rich text toolbar ─────────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); };
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", gap: 2, padding: "6px 10px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}>
        {[
          { cmd: "bold",          label: "B",  style: { fontWeight: 900 } },
          { cmd: "italic",        label: "I",  style: { fontStyle: "italic" } },
          { cmd: "underline",     label: "U",  style: { textDecoration: "underline" } },
          { cmd: "insertUnorderedList", label: "• List" },
          { cmd: "insertOrderedList",   label: "1. List" },
        ].map(({ cmd, label, style }) => (
          <button key={cmd} type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-2)", cursor: "pointer",
              padding: "3px 10px", borderRadius: 2,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.78rem", fontWeight: 700,
              transition: "all 0.15s", ...(style || {}),
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime)"; e.currentTarget.style.color = "var(--lime)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >{label}</button>
        ))}
      </div>
      {/* Editable area */}
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: 120, padding: "12px 14px",
          background: "var(--surface-2)", color: "var(--text)",
          fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem",
          lineHeight: 1.7, outline: "none",
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

// ── Image upload zone ─────────────────────────────────────────
function ImageUploadZone({ images, setImages }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const addFiles = (files) => {
    const newImgs = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 6));
  };

  const remove = (id) => setImages((prev) => prev.filter((img) => img.id !== id));

  const handleDragStart = (id) => setDragging(id);
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop      = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setImages((prev) => {
      const arr  = [...prev];
      const from = arr.findIndex((i) => i.id === dragging);
      const to   = arr.findIndex((i) => i.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragging(null); setDragOver(null);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
        {images.map((img, i) => (
          <div key={img.id}
            draggable
            onDragStart={() => handleDragStart(img.id)}
            onDragOver={(e) => handleDragOver(e, img.id)}
            onDrop={(e) => handleDrop(e, img.id)}
            style={{
              position: "relative", aspectRatio: "4/3",
              border: dragOver === img.id ? "2px solid var(--lime)" : "1px solid var(--border)",
              borderRadius: 2, overflow: "hidden", cursor: "grab",
              opacity: dragging === img.id ? 0.5 : 1,
              transition: "border-color 0.15s, opacity 0.15s",
            }}>
            <img src={img.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* Primary badge */}
            {i === 0 && (
              <div style={{
                position: "absolute", top: 6, left: 6,
                background: "var(--lime)", color: "#000",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: "0.58rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 6px", borderRadius: 2,
              }}>Cover</div>
            )}
            {/* Remove */}
            <button onClick={() => remove(img.id)} type="button" style={{
              position: "absolute", top: 6, right: 6,
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(0,0,0,0.8)", border: "none",
              color: "var(--text)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem",
            }}>✕</button>
          </div>
        ))}

        {/* Add slot */}
        {images.length < 6 && (
          <div onClick={() => inputRef.current.click()} style={{
            aspectRatio: "4/3", border: "2px dashed var(--border)",
            borderRadius: 2, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: 6, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--lime)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ fontSize: "1.4rem", opacity: 0.4 }}>+</div>
            <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Add Image
            </div>
          </div>
        )}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
        Up to 6 images · First image is the cover · Drag to reorder
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
        onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}

// ── Live preview card ─────────────────────────────────────────
function PreviewCard({ title, description, price, category, image }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 2, overflow: "hidden", position: "sticky", top: 80,
    }}>
      <div style={{ height: 200, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {image
          ? <img src={image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: "3rem", opacity: 0.15 }}>🏷</span>}
      </div>
      <div style={{ padding: "14px 16px" }}>
        {category && (
          <div style={{ fontSize: "0.62rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            {category}
          </div>
        )}
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6, color: title ? "var(--text)" : "var(--muted)", fontStyle: title ? "normal" : "italic" }}>
          {title || "Product title"}
        </div>
        {description && (
          <div style={{
            fontSize: "0.78rem", color: "var(--muted)", marginBottom: 10,
            lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }} dangerouslySetInnerHTML={{ __html: description || "" }} />
        )}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
          <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Starting Bid
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: price ? "var(--lime)" : "var(--muted)" }}>
            {price ? `$${parseFloat(price).toLocaleString()}` : "$0"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CreateProduct() {
  const navigate = useNavigate();

  const [categories, setCategories]   = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages]           = useState([]);

  // Form fields
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [categoryId, setCategoryId]   = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); setSubcategoryId(""); return; }
    const cat = categories.find((c) => c.id.toString() === categoryId);
    setSubcategories(cat?.subcategories || []);
    setSubcategoryId("");
  }, [categoryId, categories]);

  // Default dates: start now, end in 7 days
  useEffect(() => {
    const now  = new Date();
    const end  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fmt  = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setStartDate(fmt(now));
    setEndDate(fmt(end));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !startDate || !endDate) { setError("Please fill in all required fields."); return; }
    if (new Date(endDate) <= new Date(startDate)) { setError("End date must be after start date."); return; }
    setError(""); setLoading(true);
    try {
      // 1. Create product
      const { data: product } = await api.post("/products", {
        title, description,
        starting_price: parseFloat(price),
        start_date: new Date(startDate).toISOString(),
        end_date:   new Date(endDate).toISOString(),
        category_id:    categoryId    ? parseInt(categoryId)    : null,
        subcategory_id: subcategoryId ? parseInt(subcategoryId) : null,
      });

      // 2. Upload images
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img.file);
        await api.post(`/products/${product.id}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Auto-create auction
      await api.post("/auctions", {
        product_id: product.id,
        start_date: new Date(startDate).toISOString(),
        end_date:   new Date(endDate).toISOString(),
      });

      navigate(`/profile?tab=listings`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCatName = categories.find((c) => c.id.toString() === categoryId)?.name;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 32px" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontSize: "0.68rem", color: "var(--lime)",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.15em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 6,
        }}>New Listing</div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 900 }}>List Your Item</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>

          {/* ── Left — form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {error && <div className="msg-error">{error}</div>}

            {/* Images */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, borderRadius: 2 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Photos
              </h3>
              <ImageUploadZone images={images} setImages={setImages} />
            </div>

            {/* Details */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, borderRadius: 2 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <Label required>Title</Label>
                  <input className="input" placeholder="e.g. 1972 Porsche 911 T Coupe"
                    value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div>
                  <Label>Description</Label>
                  <RichTextEditor value={description} onChange={setDescription} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <Label>Category</Label>
                    <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ cursor: "pointer" }}>
                      <option value="">Select category...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Subcategory</Label>
                    <select className="input" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}
                      disabled={!subcategories.length} style={{ cursor: subcategories.length ? "pointer" : "not-allowed", opacity: subcategories.length ? 1 : 0.4 }}>
                      <option value="">All subcategories</option>
                      {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Schedule */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, borderRadius: 2 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Pricing & Schedule
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <Label required>Starting Price ($)</Label>
                  <input className="input" type="number" min="0" step="0.01"
                    placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <Label required>Auction Start</Label>
                    <input className="input" type="datetime-local"
                      value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div>
                    <Label required>Auction End</Label>
                    <input className="input" type="datetime-local"
                      value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>
                {startDate && endDate && new Date(endDate) > new Date(startDate) && (
                  <div style={{
                    fontSize: "0.78rem", color: "var(--lime)",
                    fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em",
                  }}>
                    ✓ Auction runs for{" "}
                    {Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button className="btn-primary" type="submit" disabled={loading}
              style={{ padding: "14px 40px", fontSize: "0.95rem", alignSelf: "flex-start" }}>
              {loading ? "Publishing..." : "Publish Listing →"}
            </button>
          </div>

          {/* ── Right — live preview ── */}
          <div>
            <div style={{
              fontSize: "0.65rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase",
              fontWeight: 700, marginBottom: 12,
            }}>Live Preview</div>
            <PreviewCard
              title={title}
              description={description}
              price={price}
              category={selectedCatName}
              image={images[0]?.preview}
            />
          </div>

        </div>
      </form>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import BackToHome from "../components/BackToHome";
import CAT_SVG_ICONS from "../components/CategoryIcons";
import ConfirmationDialog from "../components/ConfirmationDialog";
import Footer from "../components/Footer";

// ── Step config ───────────────────────────────────────────────
const STEPS = [
  { number: 1, label: "Photos"   },
  { number: 2, label: "Details"  },
  { number: 3, label: "Category" },
  { number: 4, label: "Schedule" },
  { number: 5, label: "Review"   },
];

// ── Step indicator ────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
      {STEPS.map((step, i) => {
        const done   = current > step.number;
        const active = current === step.number;
        return (
          <div key={step.number} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "0.85rem",
                transition: "all 0.3s",
                background: done ? "var(--primary)" : active ? "var(--primary)" : "transparent",
                border: done || active ? "none" : "2px solid var(--border-strong)",
                color: done || active ? "var(--bg)" : "var(--muted)",
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : step.number}
              </div>
              <div style={{
                fontSize: "0.62rem",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: active ? "var(--primary)" : done ? "var(--text-2)" : "var(--muted)",
                transition: "color 0.3s",
              }}>{step.label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 60, height: 2, marginBottom: 22, marginLeft: 4, marginRight: 4,
                background: done ? "var(--primary)" : "var(--border)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Image upload zone ─────────────────────────────────────────
function ImageUploadZone({ images, setImages, onRemoveClick }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const addFiles = (files) => {
    const newImgs = Array.from(files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: Math.random().toString(36).slice(2),
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 6));
  };

  const handleDrop = (e, targetId) => {
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
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        style={{
          border: "2px dashed var(--border-strong)", borderRadius: 4,
          padding: "40px 20px", textAlign: "center",
          cursor: "pointer", marginBottom: 20, transition: "border-color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
      >
        <div style={{ fontSize: "2rem", marginBottom: 10, opacity: 0.5 }}>📷</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.06em",
          marginBottom: 6,
        }}>Drop photos here or click to upload</div>
        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
          Up to 6 images · JPG, PNG, WEBP · First image is the cover
        </div>
      </div>

      {/* Grid of uploaded images */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {images.map((img, i) => (
            <div key={img.id}
              draggable
              onDragStart={() => setDragging(img.id)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(img.id); }}
              onDrop={(e) => handleDrop(e, img.id)}
              style={{
                position: "relative", aspectRatio: "4/3",
                border: dragOver === img.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 2, overflow: "hidden", cursor: "grab",
                opacity: dragging === img.id ? 0.5 : 1, transition: "border-color 0.15s",
              }}>
              <img src={img.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <div style={{
                  position: "absolute", top: 6, left: 6,
                  background: "var(--primary)", color: "var(--bg)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: "0.58rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 6px", borderRadius: 2,
                }}>Cover</div>
              )}
              <button onClick={(e) => { e.stopPropagation(); onRemoveClick(img.id); }} type="button" style={{
                position: "absolute", top: 6, right: 6,
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(0,0,0,0.85)", border: "none",
                color: "white", cursor: "pointer", fontSize: "0.75rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" multiple accept="image/*"
        style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}

// ── Rich text editor ──────────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const exec = (cmd) => { document.execCommand(cmd, false, null); };

  // Set initial content only once on mount
  useEffect(() => {
    if (editorRef.current && value === "") {
      editorRef.current.innerHTML = "";
    }
  }, [value]);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        display: "flex", gap: 4, padding: "8px 12px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
      }}>
        {[
          { cmd: "bold",                label: "B",      style: { fontWeight: 900 } },
          { cmd: "italic",              label: "I",      style: { fontStyle: "italic" } },
          { cmd: "underline",           label: "U",      style: { textDecoration: "underline" } },
          { cmd: "insertUnorderedList", label: "• List" },
          { cmd: "insertOrderedList",   label: "1. List" },
        ].map(({ cmd, label, style }) => (
          <button key={cmd} type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-2)", cursor: "pointer", padding: "3px 10px",
              borderRadius: 2, fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s",
              ...(style || {}),
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >{label}</button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: 140, padding: "12px 14px",
          background: "var(--surface-2)", color: "var(--text)",
          fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem",
          lineHeight: 1.7, outline: "none",
        }}
      />
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <div style={{
    fontSize: "0.65rem", color: "var(--muted)",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontWeight: 700, marginBottom: 6,
  }}>
    {children}
    {required && <span style={{ color: "var(--primary)", marginLeft: 4 }}>*</span>}
  </div>
);

// ── Step shells ───────────────────────────────────────────────
function StepCard({ title, subtitle, children }) {
  return (
    <div style={{ animation: "fadeUp 0.25s ease forwards" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: 6 }}>{title}</h2>
      {subtitle && <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 28, lineHeight: 1.6 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function CreateProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [categories, setCategories]     = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages]             = useState([]);
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [price, setPrice]               = useState("");
  const [categoryId, setCategoryId]     = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [dialogType, setDialogType]     = useState(null);
  const [imageToRemove, setImageToRemove] = useState(null);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fmt = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setStartDate(fmt(now)); setEndDate(fmt(end));
  }, []);

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); setSubcategoryId(""); return; }
    const cat = categories.find((c) => c.id.toString() === categoryId);
    setSubcategories(cat?.subcategories || []);
    setSubcategoryId("");
  }, [categoryId, categories]);

  const canNext = () => {
    if (step === 1) return true; // photos optional
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return true; // category optional
    if (step === 4) return price && startDate && endDate && new Date(endDate) > new Date(startDate);
    return true;
  };

  const next = () => { if (canNext()) { setError(""); setStep(s => s + 1); } else setError("Please fill in the required fields."); };
  const back = () => { setError(""); setStep(s => s - 1); };

  const confirmRemoveImage = (id) => {
    setImageToRemove(id);
    setDialogType("removeImage");
    setDialogOpen(true);
  };

  const removeImage = () => {
    setImages((prev) => prev.filter((img) => img.id !== imageToRemove));
    setDialogOpen(false);
  };

  const confirmPublish = () => {
    setDialogType("publish");
    setDialogOpen(true);
  };

  const handlePublish = async () => {
    setError(""); setLoading(true);
    try {
      const { data: product } = await api.post("/products", {
        title, description,
        starting_price: parseFloat(price),
        start_date: new Date(startDate).toISOString(),
        end_date:   new Date(endDate).toISOString(),
        category_id:    categoryId    ? parseInt(categoryId)    : null,
        subcategory_id: subcategoryId ? parseInt(subcategoryId) : null,
      });
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img.file);
        await api.post(`/products/${product.id}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await api.post("/auctions", {
        product_id: product.id,
        start_date: new Date(startDate).toISOString(),
        end_date:   new Date(endDate).toISOString(),
      });
      setDialogOpen(false);
      navigate("/profile?tab=listings");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to publish listing.");
    } finally { setLoading(false); }
  };

  const selectedCat = categories.find((c) => c.id.toString() === categoryId);
  const selectedSub = subcategories.find((s) => s.id.toString() === subcategoryId);
  const days = startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 32px" }}>
        <BackToHome />

      {/* Page title */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          fontSize: "0.68rem", color: "var(--primary)",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.15em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 8,
        }}>New Listing</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900 }}>List Your Item</h1>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Card */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 4, padding: "36px 40px",
      }}>
        {error && <div className="msg-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* ── STEP 1 — Photos ── */}
        {step === 1 && (
          <StepCard title="Add Photos" subtitle="Great photos help buyers make confident decisions. Add up to 6 images — drag to reorder, first image becomes the cover.">
            <ImageUploadZone images={images} setImages={setImages} onRemoveClick={confirmRemoveImage} />
          </StepCard>
        )}

        {/* ── STEP 2 — Details ── */}
        {step === 2 && (
          <StepCard title="Describe Your Item" subtitle="Give your listing a clear title and a detailed description so buyers know exactly what they're bidding on.">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <FieldLabel required>Title</FieldLabel>
                <input className="input" placeholder="e.g. 1972 Porsche 911 T Coupe"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
            </div>
          </StepCard>
        )}

        {/* ── STEP 3 — Category ── */}
        {step === 3 && (
          <StepCard title="Choose a Category" subtitle="Placing your item in the right category helps serious buyers find it faster.">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <FieldLabel>Category</FieldLabel>
                <select className="input" value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Select a category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div style={{ animation: "fadeUp 0.2s ease" }}>
                  <FieldLabel>Subcategory</FieldLabel>
                  <select className="input" value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)} style={{ cursor: "pointer" }}>
                    <option value="">All subcategories</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {/* Category grid selector */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
                {categories.map((c) => {
                  const selected = categoryId === c.id.toString();
                  const icon = CAT_SVG_ICONS[c.name];
                  return (
                    <div key={c.id} onClick={() => setCategoryId(selected ? "" : c.id.toString())} style={{
                      padding: "14px 10px", textAlign: "center",
                      border: selected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      borderRadius: 2, cursor: "pointer",
                      background: selected ? "rgba(136,192,208,0.06)" : "var(--surface-2)",
                      transition: "all 0.15s", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 8,
                    }}>
                      <div style={{ opacity: selected ? 1 : 0.4, transition: "opacity 0.15s" }}>
                        {icon || (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        )}
                      </div>
                      <div style={{
                        fontSize: "0.68rem", fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                        color: selected ? "var(--primary)" : "var(--muted)",
                      }}>{c.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </StepCard>
        )}

        {/* ── STEP 4 — Schedule ── */}
        {step === 4 && (
          <StepCard title="Set Your Price & Schedule" subtitle="Set the starting bid and choose when your auction goes live. The auction will be created automatically.">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <FieldLabel required>Starting Bid ($)</FieldLabel>
                <input className="input" type="number" min="0" step="0.01"
                  placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <FieldLabel required>Auction Start</FieldLabel>
                  <input className="input" type="datetime-local"
                    value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>Auction End</FieldLabel>
                  <input className="input" type="datetime-local"
                    value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              {days > 0 && (
                <div style={{
                  padding: "12px 16px", background: "rgba(136,192,208,0.05)",
                  border: "1px solid rgba(136,192,208,0.15)", borderRadius: 2,
                  fontSize: "0.82rem", color: "var(--primary)",
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em",
                }}>
                  ✓ Auction runs for {days} day{days !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </StepCard>
        )}

        {/* ── STEP 5 — Review ── */}
        {step === 5 && (
          <StepCard title="Review & Publish" subtitle="Everything look good? Your listing goes live immediately after publishing.">
            <div style={{ display: "flex", gap: 24 }}>
              {/* Cover image */}
              <div style={{
                width: 140, height: 140, flexShrink: 0, borderRadius: 2,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {images[0]
                  ? <img src={images[0].preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "2.5rem", opacity: 0.2 }}>🏷</span>}
              </div>

              {/* Summary */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Title</div>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                </div>
                {selectedCat && (
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Category</div>
                    <div>{selectedCat.name}{selectedSub ? ` › ${selectedSub.name}` : ""}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Starting Bid</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.3rem", color: "var(--primary)" }}>\${parseFloat(price || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>{days} day{days !== 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Photos</div>
                    <div style={{ fontWeight: 600 }}>{images.length} image{images.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit shortcuts */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Edit Photos",   s: 1 },
                { label: "Edit Details",  s: 2 },
                { label: "Edit Category", s: 3 },
                { label: "Edit Schedule", s: 4 },
              ].map(({ label, s }) => (
                <button key={s} type="button" className="btn-ghost"
                  onClick={() => setStep(s)}
                  style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
                  {label}
                </button>
              ))}
            </div>
          </StepCard>
        )}

        {/* ── Navigation ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border)",
        }}>
          <button type="button" onClick={back} disabled={step === 1}
            className="btn-ghost" style={{
              padding: "10px 24px", fontSize: "0.85rem",
              opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto",
            }}>
            ← Back
          </button>

          <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
            Step {step} of {STEPS.length}
          </div>

          {step < 5 ? (
            <button type="button" onClick={next} className="btn-primary"
              style={{ padding: "10px 28px", fontSize: "0.85rem" }}>
              Continue →
            </button>
          ) : (
            <button type="button" onClick={confirmPublish} disabled={loading}
              className="btn-primary" style={{ padding: "10px 28px", fontSize: "0.85rem" }}>
              {loading ? "Publishing..." : "Publish Listing →"}
            </button>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={dialogOpen}
        title={dialogType === "removeImage" ? "Remove Image" : "Publish Listing"}
        message={
          dialogType === "removeImage"
            ? "Are you sure you want to remove this image? You can add another one if needed."
            : "Are you ready to publish this listing? Once published, it will be live immediately and visible to all buyers."
        }
        onConfirm={dialogType === "removeImage" ? removeImage : handlePublish}
        onCancel={() => setDialogOpen(false)}
        confirmText={dialogType === "removeImage" ? "Remove" : "Publish Listing"}
        isDangerous={dialogType === "removeImage"}
        isLoading={loading}
      />
      <Footer />
    </div>
  );
}
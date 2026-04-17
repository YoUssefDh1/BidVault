import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import BackToHome from "../components/BackToHome";
import FavouriteButton from "../components/FavouriteButton";

function Countdown({ endDate }) {
  const [time, setTime] = useState("");
  const [timerClass, setTimerClass] = useState("timer-normal");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTime("ENDED"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      // Dynamic timer coloring based on urgency
      if (diff < 60000) {
        setTimerClass("timer-danger");
      } else if (diff < 300000) {
        setTimerClass("timer-warning");
      } else {
        setTimerClass("timer-normal");
      }
      
      setTime(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return (
    <span className={timerClass} style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 900, fontSize: "2.4rem",
      letterSpacing: "0.04em", transition: "color 0.3s",
    }}>{time}</span>
  );
}

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [viewers, setViewers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [wsStatus, setWsStatus] = useState("connecting");
  const wsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/auctions/${id}`),
      api.get(`/bids/auction/${id}`),
    ]).then(([{ data: a }, { data: b }]) => {
      setAuction(a);
      setCurrentPrice(a.product.current_price);
      setBids(b);
      setBidAmount((a.product.current_price + 1).toString());
    }).catch(() => navigate("/auctions"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    let ws = null;
    let ping = null;
    let cancelled = false;

    const connect = () => {
      ws = new WebSocket(`ws://localhost:8000/bids/ws/${id}`);
      wsRef.current = ws;

      ws.onopen = () => { if (!cancelled) setWsStatus("connected"); };
      ws.onclose = () => { if (!cancelled) setWsStatus("disconnected"); };
      ws.onerror = () => { if (!cancelled) setWsStatus("error"); };
      ws.onmessage = (e) => {
        if (cancelled) return;
        const data = JSON.parse(e.data);
        if (data.event === "connected") { setCurrentPrice(data.current_price); setViewers(data.viewer_count); }
        if (data.event === "new_bid") {
          setCurrentPrice(data.amount);
          setViewers(data.viewer_count);
          setBidAmount((data.amount + 1).toString());
          setBids((prev) => [{ id: data.bid_id, amount: data.amount, bidder_name: data.bidder_name, bid_date: data.bid_date }, ...prev]);
        }
        if (data.event === "viewer_update") setViewers(data.viewer_count);
      };

      ping = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 20000);
    };

    connect();

    return () => {
      cancelled = true;
      clearInterval(ping);
      if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        ws.close();
      }
    };
  }, [id]);

  const placeBid = async () => {
    if (!token) { navigate("/login"); return; }
    setError(""); setSuccess(""); setBidLoading(true);
    try {
      await api.post("/bids", { auction_id: parseInt(id), amount: parseFloat(bidAmount) });
      setSuccess("Bid placed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place bid.");
    } finally { setBidLoading(false); }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 100, color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      Loading lot...
    </div>
  );
  if (!auction) return null;

  const product = auction.product;
  const isActive = auction.status === "active";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
        <BackToHome />

      {/* Breadcrumb */}
      <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
        <span onClick={() => navigate("/auctions")} style={{ color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Auctions
        </span>
        <span style={{ color: "var(--border-2)" }}>›</span>
        <span style={{ color: "var(--text)", fontSize: "0.78rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Lot #{String(auction.id).padStart(4, "0")}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 48, alignItems: "start" }}>

        {/* ── LEFT ── */}
        <div>
          {/* Image */}
          <div style={{
            width: "100%", aspectRatio: "4/3", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 32, position: "relative",
          }}>
            {product.images?.[0] ? (
              <img src={`http://localhost:8000${product.images[0].url}`}
                alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "6rem", opacity: 0.15 }}>🏷</span>
            )}
            {/* Favourite button overlay */}
            <div style={{ position: "absolute", top: 14, right: 14 }}>
              <FavouriteButton auctionId={auction.id} size={18} />
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span className={`badge badge-${auction.status}`}>
              {isActive && <span className="live-dot" style={{ width: 5, height: 5 }} />}
              {auction.status}
            </span>
            {product.category && (
              <span className="badge" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {product.category.name}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 900, marginBottom: 16, lineHeight: 1 }}>
            {product.title}
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 28, fontSize: "0.92rem" }} dangerouslySetInnerHTML={{ __html: product.description || "<em style='color:var(--muted)'>No description provided.</em>" }}>
            
          </p>

          {/* Seller */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 2,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--primary)", display: "flex", alignItems: "center",
              justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, color: "var(--bg)", fontSize: "1rem",
            }}>{product.seller?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>Seller</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{product.seller?.name}</div>
            </div>
          </div>

          {/* Bid History */}
          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              Bid History
              <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginLeft: 10, fontFamily: "'Barlow', sans-serif", fontWeight: 400, textTransform: "none" }}>
                ({bids.length} bids)
              </span>
            </h2>
            {bids.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.85rem" }}>
                No bids yet — be the first
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {bids.map((bid, i) => (
                  <div key={bid.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0", borderBottom: "1px solid var(--border)",
                    animation: i === 0 ? "slideInBid 0.4s cubic-bezier(0.16,1,0.3,1)" : "none",
                    background: i === 0 ? "rgba(136,192,208,0.03)" : "transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: i === 0 ? "var(--primary)" : "var(--surface-3)",
                        border: i === 0 ? "none" : "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 900, fontSize: "0.78rem",
                        color: i === 0 ? "var(--bg)" : "var(--muted)",
                        transition: "all 0.3s",
                      }}>
                        {bid.bidder_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 600, fontSize: "0.875rem",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {bid.bidder_name}
                          {i === 0 && (
                            <span style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: "0.6rem", fontWeight: 800,
                              letterSpacing: "0.1em", textTransform: "uppercase",
                              background: "var(--primary-soft)",
                              color: "var(--primary)", padding: "1px 6px", borderRadius: 2,
                            }}>LEADING</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          {new Date(bid.bid_date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                      color: i === 0 ? "var(--primary)" : "var(--text-2)",
                      fontSize: i === 0 ? "1.2rem" : "1rem",
                      transition: "all 0.3s",
                    }}>${bid.amount?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — Bid Panel ── */}
        <div style={{ position: "sticky", top: 78 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 2 }}>

            {/* Live bar */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 20px", borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem" }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: wsStatus === "connected" ? "var(--success)" : "var(--danger)",
                }} />
                <span style={{ color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {wsStatus === "connected" ? "Live" : "Reconnecting"}
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>👁 {viewers} watching</span>
            </div>

            <div style={{ padding: 24 }}>
              {/* Current price */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                  Current Bid
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3rem", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  ${currentPrice?.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                  Started at ${product.starting_price?.toLocaleString()}
                </div>
              </div>

              {/* Countdown */}
              {isActive && (
                <div style={{ padding: "14px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 2, marginBottom: 20 }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
                    Ends In
                  </div>
                  <Countdown endDate={auction.end_date} />
                </div>
              )}

              {/* Bid Input */}
              {isActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {error && <div className="msg-error">{error}</div>}
                  {success && <div className="msg-success">{success}</div>}
                  {token ? (
                    <>
                      <div>
                        <label>Your Bid ($)</label>
                        <input className="input" type="number"
                          value={bidAmount} min={currentPrice + 0.01} step="0.01"
                          onChange={(e) => setBidAmount(e.target.value)} />
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                          Min: ${(currentPrice + 0.01).toFixed(2)}
                        </div>
                      </div>
                      <button className="btn-primary" onClick={placeBid} disabled={bidLoading}
                        style={{ width: "100%", justifyContent: "center", fontSize: "0.9rem", padding: "13px" }}>
                        {bidLoading ? "Placing..." : "BID NOW →"}
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary" onClick={() => navigate("/login")}
                      style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                      Login to Bid
                    </button>
                  )}
                </div>
              )}

              {auction.status === "closed" && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    Auction Ended
                  </div>
                  {auction.winner ? (
                    <div style={{ color: "var(--success)", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem" }}>
                      🏆 WON BY {auction.winner.name?.toUpperCase()}
                    </div>
                  ) : (
                    <div style={{ color: "var(--muted)" }}>No winner declared</div>
                  )}
                </div>
              )}

              {/* Details */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                {[
                  { label: "Lot", value: `#${String(auction.id).padStart(4, "0")}` },
                  { label: "Start Date", value: new Date(auction.start_date).toLocaleDateString() },
                  { label: "End Date", value: new Date(auction.end_date).toLocaleDateString() },
                  { label: "Total Bids", value: bids.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
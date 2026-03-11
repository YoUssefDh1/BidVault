import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function Profile() {
  const { user, role } = useAuthStore();
  const [bids, setBids] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqs = [];
    if (role === "buyer") reqs.push(api.get("/bids/mine").then(({ data }) => setBids(data)));
    if (role === "seller") reqs.push(api.get("/products/seller/mine").then(({ data }) => setProducts(data)));
    Promise.all(reqs).finally(() => setLoading(false));
  }, [role]);

  return (
    <div className="page animate-fade-up" style={{ maxWidth: 800 }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: 28, marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--amber)", display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: "'Syne',sans-serif",
          fontWeight: 800, fontSize: "1.6rem", color: "#000",
          flexShrink: 0,
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>{user?.name}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-active">{role}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{user?.email}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading...</div>
      ) : (
        <>
          {/* Buyer: My Bids */}
          {role === "buyer" && (
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 16 }}>My Bids ({bids.length})</h2>
              {bids.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  You haven't placed any bids yet.{" "}
                  <Link to="/auctions" style={{ color: "var(--amber)", textDecoration: "none" }}>Browse auctions →</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bids.map((b) => (
                    <Link key={b.id} to={`/auctions/${b.auction_id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>Auction #{b.auction_id}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                            {new Date(b.bid_date).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--amber)" }}>
                          ${b.amount?.toLocaleString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seller: My Products */}
          {role === "seller" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>My Products ({products.length})</h2>
                <Link to="/products/create">
                  <button className="btn-primary" style={{ padding: "7px 18px" }}>+ List New</button>
                </Link>
              </div>
              {products.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  You haven't listed any products yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {products.map((p) => (
                    <div key={p.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.title}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          Starting at ${p.starting_price?.toLocaleString()}
                        </div>
                      </div>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
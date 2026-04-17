import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function NotificationBell() {
  const { token } = useAuthStore();
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos]         = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const dropRef    = useRef(null);

  const unread = notifs.filter((n) => n.status === "unread").length;

  const fetchNotifs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get("/users/me/notifications");
      setNotifs(data);
    } catch (_) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [token]);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  };

  const markAllRead = async () => {
    await api.post("/users/me/notifications/read-all");
    setNotifs((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  const markRead = async (id) => {
    await api.post(`/users/me/notifications/${id}/read`);
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );
  };

  if (!token) return null;

  return (
    <>
      {/* Bell trigger */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          position: "relative",
          cursor: "pointer",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${open ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 2,
          transition: "border-color 0.15s",
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={open ? "var(--primary)" : "var(--text-2)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unread > 0 && (
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "var(--primary)",
              color: "#000",
              width: 16,
              height: 16,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "0.6rem",
              border: "2px solid var(--bg)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            ref={dropRef}
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              width: 320,
              zIndex: 500,
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 4,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              overflow: "hidden",
              animation: "fadeUp 0.15s ease forwards",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Notifications{" "}
                {unread > 0 && (
                  <span style={{ color: "var(--primary)" }}>({unread})</span>
                )}
              </span>
              {unread > 0 && (
                <span
                  onClick={markAllRead}
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--primary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Mark all read
                </span>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {loading ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "0.82rem",
                  }}
                >
                  Loading...
                </div>
              ) : notifs.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      marginBottom: 8,
                      opacity: 0.3,
                    }}
                  >
                    🔔
                  </div>
                  <div
                    style={{ color: "var(--muted)", fontSize: "0.82rem" }}
                  >
                    No notifications yet
                  </div>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      background:
                        n.status === "unread"
                          ? "rgba(136,192,208,0.03)"
                          : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        n.status === "unread"
                          ? "rgba(136,192,208,0.03)"
                          : "transparent")
                    }
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 5,
                        background:
                          n.status === "unread"
                            ? "var(--primary)"
                            : "transparent",
                        border:
                          n.status === "unread"
                            ? "none"
                            : "1px solid var(--border-2)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          lineHeight: 1.5,
                          color:
                            n.status === "unread"
                              ? "var(--text)"
                              : "var(--text-2)",
                          fontWeight: n.status === "unread" ? 600 : 400,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {new Date(n.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
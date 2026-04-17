import { useEffect, useState } from "react";
import api from "../api";
import useAuthStore from "../store/authStore";
import ConfirmationDialog from "./ConfirmationDialog";

export default function FavouriteButton({ auctionId, size = 20 }) {
  const { token } = useAuthStore();
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    if (!token) return;
    api.get("/users/me/favourites/ids")
      .then(({ data }) => setSaved(data.includes(auctionId)))
      .catch(() => {});
  }, [token, auctionId]);

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    setAction(saved ? "remove" : "add");
    setDialogOpen(true);
  };

  const executeToggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await api.delete(`/users/me/favourites/${auctionId}`);
        setSaved(false);
      } else {
        await api.post(`/users/me/favourites/${auctionId}`);
        setSaved(true);
      }
      setDialogOpen(false);
    } catch {
      // Silently handle API errors
    }
    finally { setLoading(false); }
  };

  if (!token) return null;

  return (
    <>
      <button
        onClick={handleToggleClick}
        disabled={loading}
        title={saved ? "Remove from favourites" : "Save to favourites"}
        style={{
          background: saved ? "rgba(136,192,208,0.1)" : "rgba(0,0,0,0.5)",
          border: `1px solid ${saved ? "var(--primary)" : "rgba(255,255,255,0.15)"}`,
          borderRadius: "50%",
          width: size + 16, height: size + 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={e => { if (!saved) e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={e => { if (!saved) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24"
          fill={saved ? "var(--primary)" : "none"}
          stroke={saved ? "var(--primary)" : "rgba(255,255,255,0.7)"}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <ConfirmationDialog
        isOpen={dialogOpen}
        title={action === "add" ? "Save Auction" : "Remove Favorite"}
        message={
          action === "add"
            ? "Add this auction to your favorites? You can access it later from your profile."
            : "Remove this auction from your favorites?"
        }
        onConfirm={executeToggle}
        onCancel={() => setDialogOpen(false)}
        confirmText={action === "add" ? "Save" : "Remove"}
        isDangerous={action === "remove"}
        isLoading={loading}
      />
    </>
  );
}
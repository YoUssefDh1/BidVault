import { create } from "zustand";

const loadAuth = () => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : { token: null, role: null, user: null };
  } catch {
    return { token: null, role: null, user: null };
  }
};

const useAuthStore = create((set) => ({
  ...loadAuth(),

  login: (token, role, user) => {
    const state = { token, role, user };
    localStorage.setItem("auth", JSON.stringify(state));
    set(state);
  },

  logout: () => {
    localStorage.removeItem("auth");
    set({ token: null, role: null, user: null });
  },
}));

export default useAuthStore;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AuctionList from "./pages/AuctionList";
import AuctionDetail from "./pages/AuctionDetail";
import CreateProduct from "./pages/CreateProduct";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/Notfound";

function ProtectedRoute({ children, roles }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Navigate to="/" replace />} />
        <Route path="/register"     element={<Navigate to="/" replace />} />
        <Route path="/auctions"     element={<AuctionList />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />

        <Route path="/products/create" element={
          <ProtectedRoute roles={["user"]}>
            <CreateProduct />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
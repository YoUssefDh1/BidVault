import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AuctionList from "./pages/AuctionList";
import AuctionDetail from "./pages/AuctionDetail";
import CategoryPage from "./pages/CategoryPage";
import CreateProduct from "./pages/CreateProduct";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";

function ProtectedRoute({ children, roles }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function PageRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Navigate to="/" replace />} />
        <Route path="/register"     element={<Navigate to="/" replace />} />
        <Route path="/auctions"      element={<AuctionList />} />
        <Route path="/auctions/:id"  element={<AuctionDetail />} />
        <Route path="/category/:id"  element={<CategoryPage />} />

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

        <Route path="/faq" element={<FAQ />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <PageRoutes />
    </BrowserRouter>
  );
}
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProductForm } from "./components/products/ProductForm";
import { ProductList } from "./components/products/ProductList";
import { CategoryCreatePage } from "./components/categories/CategoryCreatePage";
import { CMSConfigPage } from "./components/cms/CMSConfigPage";
import { LoginPage } from "./components/auth/LoginPage";
import { useAuthStore } from "./store/auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="categories/new" element={<CategoryCreatePage />} />
        <Route path="cms" element={<CMSConfigPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

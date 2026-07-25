import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth/context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

// Pages
import { LoginPage } from "@/pages/login";
import { DashboardLayout } from "@/pages/layout";
import { DashboardPage } from "@/pages/dashboard";

// Master
import { BarangPage } from "@/pages/master/barang";
import { KategoriPage } from "@/pages/master/kategori";
import { SatuanPage } from "@/pages/master/satuan";
import { SupplierPage } from "@/pages/master/supplier";

// Transaksi
import { MasukPage } from "@/pages/transaksi/masuk";
import { KeluarPage } from "@/pages/transaksi/keluar";
import { ProduksiPage } from "@/pages/transaksi/produksi";
import { PenjualanPage } from "@/pages/transaksi/penjualan";
import { RiwayatPage } from "@/pages/transaksi/riwayat";

// Analisis
import { PenggunaanPage } from "@/pages/analisis/penggunaan";
import { ForecastPage } from "@/pages/analisis/forecast";
import { AnalisisSupplierPage } from "@/pages/analisis/supplier";

// Laporan
import { LaporanMasukPage } from "@/pages/laporan/masuk";
import { LaporanKeluarPage } from "@/pages/laporan/keluar";
import { LaporanStokPage } from "@/pages/laporan/stok";
import { LaporanSupplierPage } from "@/pages/laporan/supplier";
import { LaporanPenggunaanPage } from "@/pages/laporan/penggunaan";

// Pengaturan
import { UserPage } from "@/pages/pengaturan/user";
import { ProfilPage } from "@/pages/pengaturan/profil";
import { DataPage } from "@/pages/pengaturan/data";
import { AuditPage } from "@/pages/pengaturan/audit";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function LoadingScreen() {
  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid #e5e7eb",
          borderTopColor: "#7c3aed",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="master/barang" element={<BarangPage />} />
                  <Route path="master/kategori" element={<KategoriPage />} />
                  <Route path="master/satuan" element={<SatuanPage />} />
                  <Route path="master/supplier" element={<SupplierPage />} />
                  <Route path="transaksi/masuk" element={<MasukPage />} />
                  <Route path="transaksi/keluar" element={<KeluarPage />} />
                  <Route path="transaksi/produksi" element={<ProduksiPage />} />
                  <Route path="transaksi/penjualan" element={<PenjualanPage />} />
                  <Route path="transaksi/riwayat" element={<RiwayatPage />} />
                  <Route path="analisis/penggunaan" element={<PenggunaanPage />} />
                  <Route path="analisis/forecast" element={<ForecastPage />} />
                  <Route path="analisis/supplier" element={<AnalisisSupplierPage />} />
                  <Route path="laporan/masuk" element={<LaporanMasukPage />} />
                  <Route path="laporan/keluar" element={<LaporanKeluarPage />} />
                  <Route path="laporan/stok" element={<LaporanStokPage />} />
                  <Route path="laporan/supplier" element={<LaporanSupplierPage />} />
                  <Route path="laporan/penggunaan" element={<LaporanPenggunaanPage />} />
                  <Route path="pengaturan/user" element={<UserPage />} />
                  <Route path="pengaturan/profil" element={<ProfilPage />} />
                  <Route path="pengaturan/data" element={<DataPage />} />
                  <Route path="pengaturan/audit" element={<AuditPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

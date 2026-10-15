import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ExecutiveOverview from './components/ExecutiveOverview';
import GeographicAnalytics from './components/GeographicAnalytics';
import ProductCatalog from './components/ProductCatalog';
import CustomerRiskCRM from './components/CustomerRiskCRM';
import AiForecastSimulator from './components/AiForecastSimulator';
import TransactionExplorer from './components/TransactionExplorer';
import ExcelUploaderModal from './components/ExcelUploaderModal';
import B2BPlatform from './components/B2BPlatform';
import LoginPage from './components/LoginPage';
import { apiFetch, clearAuthSession, getAuthToken, getStoredUser, saveAuthSession } from './api';

// Dictionary Translations (FR / EN)
const i18n = {
  FR: {
    subtitle: "Tableau de Bord Stratégique — Vente de Ciment & Matériaux de Construction",
    uploadBtn: "Importer Excel (.xlsx)",
    celebrateBtn: "Présentation / Démo",
    navHeader: "NAVIGATION STRATÉGIQUE",
    tabOverview: "Vue d'Ensemble & Carte",
    tabGeographic: "Analyse Géographique",
    tabProducts: "Catalogue Produits",
    tabCustomers: "Risque Client & Crédit",
    tabAiForecast: "Prédictions IA & Simulateur",
    tabTransactions: "Tableau Transactions",
    tabUpload: "Importer Fichier Excel",
    kpiRevenue: "Chiffre d'Affaires Total",
    kpiVolume: "Volume Total Livré",
    kpiAov: "Panier Moyen (AOV)",
    kpiPriceTon: "Prix Moyen / Tonne",
    chartMonthlyTitle: "Évolution Mensuelle du Chiffre d'Affaires & Tonnage",
    chartPaymentTitle: "Modes de Règlement (Comptant vs Crédit)",
    chartProductsTitle: "Top Produits par Chiffre d'Affaires"
  },
  EN: {
    subtitle: "Strategic Sales Analytics Dashboard — Cement & Building Materials",
    uploadBtn: "Upload Excel (.xlsx)",
    celebrateBtn: "Presentation Mode",
    navHeader: "STRATEGIC NAVIGATION",
    tabOverview: "Executive Overview & Map",
    tabGeographic: "Geographic Analytics",
    tabProducts: "Product Catalog & Pricing",
    tabCustomers: "Customer Risk & Credit CRM",
    tabAiForecast: "AI Forecast & Simulator",
    tabTransactions: "Transaction Explorer",
    tabUpload: "Upload Excel File",
    kpiRevenue: "Total Revenue (TND)",
    kpiVolume: "Total Volume Delivered",
    kpiAov: "Average Order Value (AOV)",
    kpiPriceTon: "Average Price per Ton",
    chartMonthlyTitle: "Monthly Revenue & Volume Trend",
    chartPaymentTitle: "Payment Terms Breakdown (Cash vs Credit)",
    chartProductsTitle: "Top Products by Revenue"
  }
};

export default function App() {
  const [lang, setLang] = useState('FR');
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [products, setProducts] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dbStatus, setDbStatus] = useState('MemoryEngine');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(getStoredUser);
  const [authReady, setAuthReady] = useState(false);

  const t = i18n[lang];
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = [
        `${API_BASE}/api/kpis`,
        `${API_BASE}/api/monthly`,
        `${API_BASE}/api/products`,
        `${API_BASE}/api/governorates`,
        `${API_BASE}/api/customers`
      ];

      const results = await Promise.all(endpoints.map(ep => apiFetch(ep).then(r => r.json()).catch(e => ({ status: 'error', message: e.message }))));

      const [resKpis, resMonthly, resProducts, resGouv, resCust] = results;

      if (resKpis && resKpis.status === 'success') {
        setSummary(resKpis.data);
        setDbStatus(resKpis.database || 'MemoryEngine');
      } else {
        setError(resKpis?.message || 'Failed to load KPIs');
      }

      if (resMonthly && resMonthly.status === 'success') setMonthly(resMonthly.data || []);
      if (resProducts && resProducts.status === 'success') setProducts(resProducts.data || []);
      if (resGouv && resGouv.status === 'success') setGovernorates(resGouv.data || []);
      if (resCust && resCust.status === 'success') setCustomers(resCust.data || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics from backend:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Unable to sign in.');
    saveAuthSession(payload.token, payload.user);
    setUser(payload.user);
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setSummary(null);
  };

  useEffect(() => {
    if (!getAuthToken()) {
      setAuthReady(true);
      return;
    }

    apiFetch(`${API_BASE}/api/auth/me`)
      .then((response) => {
        if (!response.ok) throw new Error('Session expired.');
        return response.json();
      })
      .then((payload) => setUser(payload.user))
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (authReady && user) fetchDashboardData();
  }, [authReady, user]);

  if (!authReady) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        dbStatus={dbStatus}
        onOpenUpload={() => setIsUploadOpen(true)}
        user={user}
        onLogout={logout}
        t={t}
      />

      {error && (
        <div className="max-w-[1700px] w-full mx-auto mt-3 p-3 rounded-md bg-rose-900 text-rose-100 text-sm">
          Erreur: {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row p-4 lg:p-6 gap-6 max-w-[1700px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'upload') {
              if (user.role === 'admin' || user.role === 'manager') setIsUploadOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          t={t}
          canUpload={user.role === 'admin' || user.role === 'manager'}
        />

        {/* Dynamic Tab Container */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="h-96 glass-card rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-mono">Chargement du MERN Sales Engine (48,804 livraisons)...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ExecutiveOverview
                  summary={summary}
                  monthly={monthly}
                  products={products}
                  governorates={governorates}
                  t={t}
                />
              )}

              {activeTab === 'products' && (
                <ProductCatalog
                  products={products}
                  t={t}
                />
              )}

              {activeTab === 'geographic' && (
                <GeographicAnalytics
                  governorates={governorates}
                  t={t}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerRiskCRM
                  customers={customers}
                  t={t}
                />
              )}

              {activeTab === 'ai_forecast' && (
                <AiForecastSimulator
                  apiBase={API_BASE}
                  t={t}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionExplorer
                  apiBase={API_BASE}
                  products={products}
                  governorates={governorates}
                  t={t}
                />
              )}

              {activeTab === 'b2b' && (
                <B2BPlatform t={t} />
              )}

            </>
          )}
        </main>
      </div>

      {/* Excel Upload Modal */}
      <ExcelUploaderModal
        isOpen={isUploadOpen}
        apiBase={API_BASE}
        canUpload={user.role === 'admin' || user.role === 'manager'}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchDashboardData();
          setIsUploadOpen(false);
        }}
        t={t}
      />
    </div>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import PracticePage from "./pages/PracticePage";
import BaselinePage from "./pages/BaselinePage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
        404
      </h1>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        页面未找到
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        你访问的页面不存在，可能已被移动或删除。
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors font-medium"
      >
        <Home className="w-4 h-4 mr-2" />
        返回首页
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PracticePage />} />
            <Route path="baseline" element={<BaselinePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

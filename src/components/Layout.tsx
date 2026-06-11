import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Keyboard, BarChart2, Settings, Activity, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from './ui/ThemeToggle';
import ErrorBoundary from './ErrorBoundary';
import OnboardingGuide from './OnboardingGuide';

const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '练习', icon: Keyboard },
    { path: '/baseline', label: '基线', icon: Activity },
    { path: '/stats', label: '统计', icon: BarChart2 },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className={clsx(
          'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2',
          'z-50 px-4 py-2 bg-emerald-600 text-white rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500',
        )}
      >
        跳转到主要内容
      </a>

      <OnboardingGuide />

      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                aria-label="五笔86特训营 - 首页"
              >
                五笔86特训营
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="主导航">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={clsx(
                      'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                    )}
                  >
                    <Icon className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right section: theme toggle + mobile menu button */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden rounded-md p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
            aria-label="移动端导航"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 h-full min-h-[500px] p-6">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} 五笔86特训营 - 30天从双拼到五笔
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

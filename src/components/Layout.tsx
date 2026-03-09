import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Keyboard, BarChart2, Settings, Activity } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '练习', icon: Keyboard },
    { path: '/baseline', label: '基线', icon: Activity },
    { path: '/stats', label: '统计', icon: BarChart2 },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-emerald-600">五笔86特训营</span>
              </div>
            </div>
            <div className="flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg h-full min-h-[500px] p-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 五笔86特训营 - 30天从双拼到五笔
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, WalletCards, ListFilter, Tags, Menu, X, LogOut, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NewMovement from './pages/NewMovement';
import Categories from './pages/Categories';
import Extract from './pages/Extract';
import MovementDetail from './pages/MovementDetail';
import EditMovement from './pages/EditMovement';

const NavBar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Novo Lançamento', path: '/movement/new', icon: PlusCircle },
    { name: 'Extrato', path: '/extract', icon: ListFilter },
    { name: 'Categorias', path: '/categories', icon: Tags },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <WalletCards className="text-emerald-600 mr-2" size={28} />
            <span className="text-xl font-bold text-slate-900">FundSmart</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon size={18} className="mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center">
            <button
              onClick={logout}
              className="flex items-center text-slate-500 hover:text-rose-600 transition-colors px-3 py-2 text-sm font-medium"
            >
              <LogOut size={18} className="mr-2" /> Sair
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-900 p-2 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-md text-base font-medium',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-100"
            >
              <LogOut size={20} className="mr-3" /> Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  ) : (
    <Navigate to="/auth" />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/movement/new" element={<PrivateRoute><NewMovement /></PrivateRoute>} />
          <Route path="/movement/:id" element={<PrivateRoute><MovementDetail /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/extract" element={<PrivateRoute><Extract /></PrivateRoute>} />
          <Route path="/fundsmart/movement/edit/:id" element={<PrivateRoute><EditMovement /></PrivateRoute>} />
          <Route path="/fundsmart/movement/show/:id" element={<PrivateRoute><MovementDetail /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
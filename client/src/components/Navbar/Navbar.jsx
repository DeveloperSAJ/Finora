import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import Button from '../Buttons/Button';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Finora</h1>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-emerald-600" />
        </div>
        
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate hidden xs:inline">
          {user?.username}
        </span>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
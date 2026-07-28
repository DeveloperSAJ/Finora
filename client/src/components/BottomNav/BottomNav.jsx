import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank,
  BarChart3, 
  User,
  Settings
} from 'lucide-react';

const navItems = [
  { path: "/", label: "Home", icon: LayoutDashboard },
  { path: "/transactions", label: "Txns", icon: CreditCard },
  { path: "/savings", label: "Save", icon: PiggyBank },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all min-w-[48px] ${
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
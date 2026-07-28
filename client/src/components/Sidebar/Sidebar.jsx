import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  PiggyBank,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: CreditCard },
  { path: "/savings", label: "Savings", icon: PiggyBank },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

const Sidebar = () => {
  return (
    <div className="hidden md:flex w-20 lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-2xl">F</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Finora
          </h1>
          <p className="text-xs text-emerald-600 font-medium">
            Finance Manager
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              isActive
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </NavLink>
        <p className="hidden lg:block text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4">
          © {new Date().getFullYear()} · Dev by SAJ
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

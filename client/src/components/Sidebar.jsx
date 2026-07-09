import { assets, menuItemsData } from "../assets/assets";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-stretch max-sm:fixed max-sm:top-0 max-sm:bottom-0 max-sm:left-0 z-20 ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex flex-col flex-1">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <img
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            src={assets.logo1}
            className="w-28 cursor-pointer hover:opacity-90 transition-opacity"
            alt="Smedia Logo"
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItemsData.map((item) => {
            const Icon = item.Icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user?.profilePicture || assets.sample_profile}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            alt={user?.username}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {user?.username}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Sign Out"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

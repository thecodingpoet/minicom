import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { isAgent } from "../constants/roles";
import Avatar from "./Avatar";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    setOpen(false);
    navigate("/settings");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
      >
        <Avatar name={user.fullName} size="sm" />
        <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">
          {user.fullName}
        </span>
        <svg
          className={`w-2 h-2 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 8"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className={`px-4 pb-4 border-b border-gray-100 pt-3`}>
            <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
            <div className="text-xs text-gray-500 mt-1">{user.email}</div>
          </div>

          {isAgent(user) && (
            <div className="py-1">
              <button
                onClick={handleSettings}
                className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer border-none bg-transparent"
              >
                Settings
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navItem =
  "flex items-center gap-3 px-3 py-2.5 text-[#c7c4d7] font-medium hover:bg-[#35343a]/60 hover:text-[#e4e1e9] transition-all duration-300 rounded-lg group active:scale-[0.97] ease-out";
const activeNav =
  "bg-[#35343a]/40 text-[#c0c1ff] font-semibold";

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const workflowsActive = location.pathname.startsWith("/dashboard/workflows/");
  // Close the mobile drawer after navigating
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#131318]">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed top-4 left-4 z-[45] w-10 h-10 flex items-center justify-center rounded-xl bg-[#1b1b20] text-[#e4e1e9] border border-[#464554]/20"
      >
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] bg-[#1b1b20] sidebar-border z-50 font-syne antialiased tracking-tight transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col justify-between h-full p-6">
          <div>
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl primary-gradient text-[#1000a9] shadow-lg shadow-[#c0c1ff]/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tighter text-[#e4e1e9]">FlowAI</span>
                <span className="text-[10px] uppercase tracking-widest text-[#c7c4d7] font-bold opacity-70">
                  Synthetic Intelligence
                </span>
              </div>
            </div>

            <nav className="space-y-1" onClick={closeSidebar}>
              <NavLink to="/dashboard" end className={({ isActive }) => `${navItem} ${isActive ? activeNav : ""}`}>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  dashboard
                </span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/dashboard/workflows/new" className={`${navItem} ${workflowsActive ? activeNav : ""}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_tree
                </span>
                <span>Workflows</span>
              </NavLink>
              <NavLink to="/dashboard/logs" className={({ isActive }) => `${navItem} ${isActive ? activeNav : ""}`}>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  list_alt
                </span>
                <span>Logs</span>
              </NavLink>
              <NavLink to="/dashboard/integrations" className={({ isActive }) => `${navItem} ${isActive ? activeNav : ""}`}>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  extension
                </span>
                <span>Integrations</span>
              </NavLink>
              <NavLink to="/dashboard/settings" className={({ isActive }) => `${navItem} ${isActive ? activeNav : ""}`}>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  settings
                </span>
                <span>Settings</span>
              </NavLink>
            </nav>
          </div>

          <div>
            <Link className={`${navItem}`} to="/dashboard/settings" onClick={closeSidebar}>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#35343a]">
                <img
                  alt="Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3-YfR7PrATdLQQi0p0slJ1dv0Ozzj0jPwFSvmGmdpLAite016hdSiV421VWX5tCbScUiX2ljNtuke4ajjxqPQ28b2e5HWWoOm8RprNjYdjfpnoSJM_6bOPCYfnwZFCGGSjVMO8PDM7CQ9s_2EdnSLYzbTo2frTaZ0OKWh3f5jVm4HhzINHmuKO4ajhl8hiVgb3g_vFiZsbwzuh38yVJTSBFGubDM3AXzpbEvRHeCCETXR982ZtLW2s26GPiqGIdiBNPWFaH_IkjE"
                />
              </div>
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </aside>

      <main className="pt-16 md:pt-0 md:ml-[240px] flex-1 h-screen overflow-y-auto bg-[#131318] relative">
        <Outlet />
      </main>
    </div>
  );
};

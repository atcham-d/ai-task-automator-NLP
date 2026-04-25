import React, { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface WorkflowResponse {
  id: string;
  name: string;
  description: string | null;
  status: string;
  definition: { trigger?: { type?: string } };
  last_run_at: string | null;
}

const statusChip = (status: string) => {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  return "Draft";
};

export const DashboardHome: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<WorkflowResponse[]>("/api/workflows/")
      .then(setWorkflows)
      .finally(() => setLoading(false));
  }, []);

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c0c1ff]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="flex items-center justify-between px-10 py-8 sticky top-0 bg-[#131318]/80 backdrop-blur-md z-40">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#e4e1e9]">Your Workflows</h1>
          <p className="text-[#c7c4d7] mt-1 text-sm">Automate your logic with {filtered.length} active processes.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 primary-gradient text-[#1000a9] font-semibold rounded-xl glow-effect transition-all active:scale-95">
          <span className="material-symbols-outlined">add</span>
          New Workflow
        </button>
      </header>

      <section className="px-10 pb-6">
        <div className="flex items-center gap-4 bg-[#1b1b20] rounded-xl p-2 border border-[#464554]/10">
          <div className="flex items-center flex-1 px-3">
            <span className="material-symbols-outlined text-[#c7c4d7]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[#e4e1e9] placeholder:text-[#c7c4d7]/50 w-full text-sm ml-2"
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="h-6 w-[1px] bg-[#464554]/20"></div>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#35343a]/50 rounded-lg text-[#c7c4d7] text-sm transition-colors">
            <span className="material-symbols-outlined text-sm">tune</span>
            Filter
          </button>
        </div>
      </section>

      <section className="px-10 pb-20">
        {loading ? (
          <div className="text-[#c7c4d7]">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((w) => (
              <div
                key={w.id}
                className="group bg-[#1b1b20] rounded-xl p-6 border border-[#464554]/10 hover:border-[#c0c1ff]/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#c0c1ff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[#2f3aa3]/30 rounded-lg text-[#c0c1ff]">
                    <span className="material-symbols-outlined">api</span>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-green-500/10 text-green-400 rounded-md">
                    {statusChip(w.status)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#e4e1e9] mb-2">{w.name}</h3>
                <p className="text-sm text-[#c7c4d7] line-clamp-2 mb-6">
                  {w.description || "No description provided."}
                </p>
              </div>
            ))}

            <div className="group bg-transparent border-2 border-dashed border-[#464554]/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#c0c1ff]/40 hover:bg-[#c0c1ff]/5 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#35343a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#c0c1ff]">add</span>
              </div>
              <span className="text-[#e4e1e9] font-semibold">Create New</span>
              <span className="text-xs text-[#c7c4d7] mt-1">Start from a blank canvas</span>
            </div>
          </div>
        )}
      </section>

      <div className="fixed bottom-6 right-6 flex items-center gap-3 glass-card border border-[#464554]/20 rounded-full py-2 px-4 shadow-2xl z-50">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c0c1ff] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c0c1ff]"></span>
        </div>
        <span className="text-xs font-medium text-[#c7c4d7]">
          System Status: <span className="text-[#c0c1ff] font-bold">Optimal</span>
        </span>
      </div>
    </>
  );
};

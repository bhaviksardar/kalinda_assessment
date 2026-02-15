import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import RestaurantData from "./components/RestaurantData";
import Stats from "./components/Stats";
import Phone from "./components/Phone";
import { SparklesIcon, ChartBarIcon, TableCellsIcon } from "@heroicons/react/24/outline";

function App() {
  const tabs = [
    { name: "Dashboard", icon: TableCellsIcon, key: "table", path: "/" },
    { name: "Voice Agent", icon: SparklesIcon, key: "call", path: "/call" },
    { name: "Statistics", icon: ChartBarIcon, key: "dashboard", path: "/dashboard" },
  ];

  return (
    <Router>
      <div className="flex h-screen w-screen">
        <Sidebar tabs={tabs} />
        <main className="flex-1 p-10 flex flex-col h-screen overflow-auto">
          <Routes>
            <Route path="/" element={<RestaurantData />} />
            <Route path="/call" element={<Phone />} />
            <Route path="/dashboard" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Sidebar({ tabs }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col w-64 border-r border-gray-200 px-4 py-6 bg-gray-50">
      <div className="flex flex-col h-full justify-center space-y-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-3 px-4 py-3 w-full hover:text-blue-600 transition-colors
              ${location.pathname === tab.path ? "font-bold text-blue-600" : "text-gray-700"}`}
          >
            <tab.icon className="h-6 w-6 flex-shrink-0" />
            <span className="whitespace-nowrap">{tab.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default App;


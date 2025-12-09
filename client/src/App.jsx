import Sidebar from "./components/layout/SideBar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <div>
              <div className="font-semibold text-sm">Vault</div>
              <div className="text-xs text-gray-500">Shiva Raghav</div>
            </div>
          </div>
        </header>
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
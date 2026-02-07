import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Header } from "./components/Header"; 
import { ProjectInput } from "./components/ProjectInput";
import { Workspace } from "../src/components/Workspace"; // Ensure this path matches where you saved Workspace.tsx
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="h-screen flex flex-col overflow-hidden">
          <Routes>
            {/* 1. Home Page */}
            <Route path="/" element={
              <>
                <Header />
                <div className="flex-1 overflow-auto bg-gray-50">
                  <ProjectInputWrapper />
                </div>
              </>
            } />
            
            {/* 2. Workspace Routes */}
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/workspace/:projectId" element={<Workspace />} />

            {/* 3. Dashboard Route */}
            <Route path="/dashboard" element={
              <>
                <Header />
                <div className="flex-1 overflow-auto bg-gray-50">
                  <Dashboard />
                </div>
              </>
            } />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function ProjectInputWrapper() {
  const navigate = useNavigate();
  return (
    <ProjectInput 
      prompt="" // <--- FIXED: Added empty prompt prop here
      onGenerate={(idea) => {
        navigate(`/workspace?prompt=${encodeURIComponent(idea)}`);
      }} 
    />
  );
}

export default App;
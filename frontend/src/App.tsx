import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Added useNavigate here
import { Header } from "./components/Header";
import { ProjectInput } from "./components/ProjectInput";
import { Workspace } from "./components/WorkspaceModern";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Dashboard } from "./pages/Dashboard"; // <--- IMPORT DASHBOARD

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            {/* 1. Home Page */}
            <Route path="/" element={<ProjectInputWrapper />} />
            
            {/* 2. Workspace Routes */}
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/workspace/:projectId" element={<Workspace />} />

            {/* 3. Dashboard Route (ADDED) */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// Wrapper to handle navigation logic nicely
function ProjectInputWrapper() {
  const navigate = useNavigate();
  
  return (
    <ProjectInput 
      onGenerate={(idea) => {
        navigate(`/workspace?prompt=${encodeURIComponent(idea)}`);
      }} 
    />
  );
}

export default App;
import { useState } from 'react';
import { Header } from './components/Header';
import { ProjectInput } from './components/ProjectInput';
import { Workspace } from './components/Workspace';

function App() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = (idea: string) => {
    // In a real app, this would process the idea and generate project files
    setPrompt(idea);
    setShowWorkspace(true);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {!showWorkspace ? (
        <ProjectInput onGenerate={handleGenerate} />
      ) : (
        <Workspace prompt={prompt} />
      )}
      
    </div>
  );
}

export default App;

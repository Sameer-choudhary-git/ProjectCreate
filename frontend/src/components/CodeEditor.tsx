interface CodeEditorProps {
  content: string;
  language: string;
}

export function CodeEditor({ content, language }: CodeEditorProps) {
  return (
    <div className="flex-1 bg-gray-900 text-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-gray-400">{language}</span>
        </div>
        {/* Apply overflow-y-auto for scrolling and set a max height */}
        <pre className="font-mono text-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

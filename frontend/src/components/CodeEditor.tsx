import { useRef, useEffect, useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  content: string;
  language: string;
}

// ULTRA-SIMPLE syntax highlighting that actually works
const syntaxHighlight = (code: string, language: string): string => {
  const keywords: { [key: string]: string[] } = {
    typescript: ['import', 'export', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break', 'continue', 'new', 'this', 'extends', 'implements', 'public', 'private', 'protected', 'readonly', 'static', 'from', 'as'],
    javascript: ['import', 'export', 'const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break', 'continue', 'new', 'this', 'extends', 'from', 'as'],
    jsx: ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'from'],
    tsx: ['import', 'export', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'from', 'as'],
    html: ['DOCTYPE', 'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style', 'div', 'span', 'p', 'a'],
    css: [],
    json: []
  };

  const lang = language.toLowerCase();
  const langKeywords = keywords[lang] || [];
  
  // Escape HTML first
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Highlight strings (must be first to protect content)
  result = result.replace(/(["'`])((?:\\.|(?!\1).)*?)\1/g, '<span class="string">$&</span>');
  
  // 2. Highlight comments
  result = result.replace(/\/\/(.*?)$/gm, '<span class="comment">$&</span>');
  result = result.replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">$&</span>');
  
  // 3. Highlight HTML/JSX tags (only tag names)
  result = result.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9:-]*)/g, '$1<span class="tag">$2</span>');
  
  // 4. Highlight keywords - BUT only outside of spans
  langKeywords.forEach(keyword => {
    // This regex matches keywords NOT inside existing span tags
    const regex = new RegExp(`(?<!<[^>]*)\\b(${keyword})\\b(?![^<]*<\/span>)`, 'g');
    result = result.replace(regex, (match) => {
      // Double-check we're not inside a span already
      return `<span class="keyword">${match}</span>`;
    });
  });

  // 5. Highlight numbers (simple)
  result = result.replace(/(?<!<[^>]*)\b(\d+\.?\d*)(?=\D|$)(?![^<]*<\/span>)/g, '<span class="number">$1</span>');

  return result;
};

export function CodeEditor({ content, language }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  // Clean any artifacts
  const cleanContent = useMemo(() => {
    return content.replace(/___HIGHLIGHT___\d+___/g, '').replace(/\u0000\d+\u0000/g, '');
  }, [content]);
  
  const lineCount = useMemo(() => cleanContent.split('\n').length, [cleanContent]);
  
  const highlightedCode = useMemo(() => {
    return syntaxHighlight(cleanContent, language);
  }, [cleanContent, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const codeContainer = codeContainerRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (!codeContainer || !lineNumbers) return;

    const handleScroll = () => {
      lineNumbers.scrollTop = codeContainer.scrollTop;
    };

    codeContainer.addEventListener('scroll', handleScroll);
    return () => codeContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 font-mono text-sm overflow-hidden rounded-b-lg">
      
      <style>{`
        .string { color: #98c379; }
        .comment { color: #5c6370; font-style: italic; }
        .keyword { color: #c678dd; font-weight: 600; }
        .tag { color: #e06c75; }
        .number { color: #d19a66; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-800 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-gray-500 ml-2">{language}</span>
        </div>
        
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative group">
        
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="bg-[#1e1e1e] border-r border-gray-800 text-gray-600 text-right py-4 px-3 select-none overflow-hidden shrink-0 w-[3.5rem]"
          style={{ fontFamily: 'monospace' }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content */}
        <div
          ref={codeContainerRef}
          className="flex-1 overflow-auto py-4 px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          <pre 
            className="font-mono text-sm leading-6 whitespace-pre min-w-max"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#007acc] text-white text-[10px] px-3 py-1 flex justify-between shrink-0 select-none">
        <span>Ln {lineCount}, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
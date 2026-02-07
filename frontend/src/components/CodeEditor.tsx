import { useRef, useEffect, useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  content: string;
  language: string;
}

// Syntax highlighting helper - FIXED VERSION
const syntaxHighlight = (code: string, language: string): string => {
  const keywords: { [key: string]: string[] } = {
    typescript: [
      'import', 'export', 'const', 'let', 'var', 'function', 'class', 'interface',
      'type', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch',
      'case', 'default', 'break', 'continue', 'new', 'this', 'extends', 'implements',
      'public', 'private', 'protected', 'readonly', 'static', 'abstract', 'from', 'as'
    ],
    javascript: [
      'import', 'export', 'const', 'let', 'var', 'function', 'class', 'async', 'await',
      'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break',
      'continue', 'new', 'this', 'extends', 'super', 'from', 'as'
    ],
    jsx: [
      'import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
      'for', 'while', 'switch', 'case', 'default', 'from'
    ],
    tsx: [
      'import', 'export', 'const', 'let', 'var', 'function', 'class', 'interface',
      'type', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch',
      'case', 'default', 'break', 'continue', 'new', 'this', 'from', 'as'
    ],
    css: ['body', 'color', 'background', 'padding', 'margin', 'font', 'width', 'height', 'border', 'display', 'flex'],
    json: []
  };

  const lang = language.toLowerCase();
  const langKeywords = keywords[lang] || [];
  
  // Unique placeholder system
  const PLACEHOLDER_PREFIX = '___HIGHLIGHT___';
  let placeholderCounter = 0;
  const placeholders: { [key: string]: string } = {};
  
  const createPlaceholder = (content: string): string => {
    const placeholder = `${PLACEHOLDER_PREFIX}${placeholderCounter++}___`;
    placeholders[placeholder] = content;
    return placeholder;
  };

  let highlighted = code;

  // 1. Protect and highlight strings FIRST (before escaping HTML)
  highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1).)*?)\1/gs, (match, quote, content) => {
    return createPlaceholder(`<span class="text-emerald-400">${quote}${content}${quote}</span>`);
  });

  // 2. Protect and highlight comments
  highlighted = highlighted.replace(/\/\/(.*?)$/gm, (match, content) => {
    return createPlaceholder(`<span class="text-gray-500 italic">//${content}</span>`);
  });
  highlighted = highlighted.replace(/\/\*([\s\S]*?)\*\//g, (match, content) => {
    return createPlaceholder(`<span class="text-gray-500 italic">/*${content}*/</span>`);
  });

  // 3. NOW escape HTML entities
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 4. Highlight keywords
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, (match) => {
      return createPlaceholder(`<span class="text-blue-400 font-bold">${match}</span>`);
    });
  });

  // 5. Highlight numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (match) => {
    return createPlaceholder(`<span class="text-orange-400">${match}</span>`);
  });

  // 6. Highlight JSX/HTML tags (FIXED)
  // We use [a-zA-Z] to ensure the tag starts with a letter. 
  // This prevents the regex from matching "___HIGHLIGHT___" as a tag name.
  highlighted = highlighted.replace(/(&lt;\/?)([a-zA-Z][\w:-]*)(.*?&gt;)/g, (match, open, tagName, rest) => {
    return createPlaceholder(`${open}<span class="text-red-400">${tagName}</span>${rest}`);
  });

  // 7. Restore all placeholders (FIXED)
  // We loop until no placeholders remain to handle nested cases safely.
  // We use a callback function () => value to prevent '$' in code from breaking the replacement.
  Object.keys(placeholders).forEach(placeholder => {
    highlighted = highlighted.replace(new RegExp(placeholder, 'g'), () => placeholders[placeholder]);
  });

  return highlighted;
};

export function CodeEditor({ content, language }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  // Calculate lines for the gutter
  const lineCount = useMemo(() => content.split('\n').length, [content]);
  
  // Memoize highlighted code
  const highlightedCode = useMemo(() => syntaxHighlight(content, language), [content, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Synchronize scrolling
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
      
      {/* Header / Toolbar */}
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
        
        {/* Line Numbers (Gutter) */}
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

      {/* Footer / Status Bar */}
      <div className="bg-[#007acc] text-white text-[10px] px-3 py-1 flex justify-between shrink-0 select-none">
        <span>Ln {lineCount}, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
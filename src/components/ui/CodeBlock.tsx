'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download, Maximize2 } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    let extension = 'txt';
    if (language === 'cpp' || language === 'arduino') extension = 'ino';
    else if (language === 'swift') extension = 'swift';
    else if (language === 'javascript' || language === 'js') extension = 'js';
    else if (language === 'python') extension = 'py';
    else if (language === 'json') extension = 'json';

    const element = document.createElement('a');
    const file = new Blob([value], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `botcasso_snippet.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 my-4 bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-zinc-400 uppercase">{language}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
            title="Copy Code"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button
            onClick={downloadFile}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
            title="Download Snippet"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="p-0 text-sm">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

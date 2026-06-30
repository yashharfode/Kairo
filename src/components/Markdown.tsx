import React from 'react';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  // Split content into blocks by code segments to handle blocks correctly
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-text-primary">
      {parts.map((part, index) => {
        // Code block match
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          // Optional language header line
          const hasLang = lines[0] && !lines[0].includes(' ') && lines[0].length < 15;
          const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
          return (
            <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-800 my-2">
              <code>{codeContent}</code>
            </pre>
          );
        }

        // Standard text block split by newlines
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-2" />;

              // 1. Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="font-heading font-black text-xs sm:text-sm text-text-primary pt-2 uppercase tracking-wide">
                    {renderInline(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lineIdx} className="font-heading font-black text-sm sm:text-base text-text-primary pt-3">
                    {renderInline(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lineIdx} className="font-heading font-black text-base sm:text-lg text-text-primary pt-4">
                    {renderInline(trimmed.slice(2))}
                  </h2>
                );
              }

              // 2. Unordered lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={lineIdx} className="list-disc pl-5 space-y-1">
                    <li className="text-text-secondary">
                      {renderInline(trimmed.slice(2))}
                    </li>
                  </ul>
                );
              }

              // 3. Numbered lists
              const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <ol key={lineIdx} className="list-decimal pl-5 space-y-1">
                    <li className="text-text-secondary">
                      {renderInline(numMatch[2])}
                    </li>
                  </ol>
                );
              }

              // 4. Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-4 border-primary/40 bg-gray-50/50 pl-3 py-1 my-2 text-text-secondary italic">
                    {renderInline(trimmed.slice(2))}
                  </blockquote>
                );
              }

              // 5. Standard paragraph line
              return (
                <p key={lineIdx} className="text-text-secondary">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Simple helper to parse inline markdown tags (**bold**, `code`)
function renderInline(text: string): React.ReactNode[] {
  // Regex split by bold and inline code markers
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    // Bold match
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-text-primary">{token.slice(2, -2)}</strong>;
    }
    // Inline code match
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="bg-gray-100 text-primary px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border border-gray-200/50">
          {token.slice(1, -1)}
        </code>
      );
    }
    // Regular text token
    return <span key={i}>{token}</span>;
  });
}

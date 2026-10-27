import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * FormattedMessage:
 * Parses chat messages with rich formatting:
 * - Bold: **text** -> <strong>
 * - Italic: *text* -> <em>
 * - Tracking IDs: #REP-XXXX -> interactive copyable badge
 * - Lists: 1️⃣, 2️⃣, •, - -> structured styled rows
 * - Links / Tel: tel:110 -> clickable action
 */
export default function FormattedMessage({ text = '', className = '' }) {
  if (!text) return null;

  // Split into lines/paragraphs
  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed text-sm ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Check if line is a numbered option or bullet
        const isNumbered = /^[1-6]️⃣|^\d+\./.test(trimmed);
        const isBullet = /^[•\-*]\s/.test(trimmed);

        return (
          <div
            key={lineIdx}
            className={`${isNumbered || isBullet ? 'pl-2 py-0.5 border-l-2 border-teal-500/30' : ''}`}
          >
            <InlineFormatted text={trimmed} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Formats inline segments (bold, italics, report IDs)
 */
function InlineFormatted({ text }) {
  // Regex to find **bold**, *italic*, or #REP-XXXX
  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  // Pattern matches **bold**, *italic*, and #REP-...
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|#(?:REP-)?[A-Z0-9_-]+)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={keyIndex++}>{text.substring(lastIndex, match.index)}</span>
      );
    }

    const matchedStr = match[0];

    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      // Bold
      const content = matchedStr.slice(2, -2);
      parts.push(
        <strong
          key={keyIndex++}
          className="font-bold text-teal-800 dark:text-teal-200"
        >
          {content}
        </strong>
      );
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      // Italic
      const content = matchedStr.slice(1, -1);
      parts.push(
        <em key={keyIndex++} className="italic opacity-85">
          {content}
        </em>
      );
    } else if (matchedStr.startsWith('#')) {
      // Tracking ID
      parts.push(<ReportIdBadge key={keyIndex++} id={matchedStr} />);
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining tail
  if (lastIndex < text.length) {
    parts.push(<span key={keyIndex++}>{text.substring(lastIndex)}</span>);
  }

  return <>{parts.length > 0 ? parts : text}</>;
}

/**
 * Copyable Report ID badge
 */
function ReportIdBadge({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id.replace('#', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar código de reporte"
      className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md font-mono text-xs font-bold bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300/60 dark:border-teal-700/60 hover:bg-teal-200 transition"
    >
      <span>{id}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 opacity-60" />}
    </button>
  );
}

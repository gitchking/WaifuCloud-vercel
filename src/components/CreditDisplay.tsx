import React from "react";

interface CreditDisplayProps {
  credit: string;
}

export const CreditDisplay = ({ credit }: CreditDisplayProps) => {
  // Parse markdown-style links: [text](url)
  const parseCredit = (text: string): React.ReactNode[] => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the clickable link
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    // If no markdown links found, check for plain URLs
    if (parts.length === 0) {
      return text.split(/(\bhttps?:\/\/[^\s]+)/gi).map((part, index) => {
        if (part.match(/^https?:\/\//i)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }

    return parts;
  };

  return (
    <div className="text-sm break-words">
      {parseCredit(credit)}
    </div>
  );
};

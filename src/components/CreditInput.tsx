import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, X } from "lucide-react";

interface CreditInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const CreditInput = ({ value, onChange, id = "credit" }: CreditInputProps) => {
  const [displayText, setDisplayText] = useState("");
  const [url, setUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Parse existing markdown link on mount or when value changes externally
  useEffect(() => {
    if (value) {
      const markdownMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (markdownMatch) {
        setDisplayText(markdownMatch[1]);
        setUrl(markdownMatch[2]);
        setShowUrlInput(true);
      } else {
        setDisplayText(value);
        setUrl("");
        setShowUrlInput(false);
      }
    }
  }, []);

  // Update parent when either field changes
  const updateCredit = (text: string, link: string) => {
    if (link && text) {
      // Create markdown link
      onChange(`[${text}](${link})`);
    } else if (text) {
      // Just text
      onChange(text);
    } else {
      onChange("");
    }
  };

  const handleTextChange = (newText: string) => {
    setDisplayText(newText);
    updateCredit(newText, url);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    updateCredit(displayText, newUrl);
  };

  const toggleUrlInput = () => {
    if (showUrlInput) {
      // Removing URL, keep just text
      setUrl("");
      updateCredit(displayText, "");
    }
    setShowUrlInput(!showUrlInput);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>Credit / Source (Optional)</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleUrlInput}
          className="h-8 text-xs"
        >
          {showUrlInput ? (
            <>
              <X className="h-3 w-3 mr-1" />
              Remove Link
            </>
          ) : (
            <>
              <LinkIcon className="h-3 w-3 mr-1" />
              Add Link
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          id={id}
          type="text"
          placeholder="Artist name or credit text"
          value={displayText}
          onChange={(e) => handleTextChange(e.target.value)}
        />

        {showUrlInput && (
          <Input
            type="url"
            placeholder="https://pixiv.net/artworks/12345"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="border-primary/50"
          />
        )}
      </div>

      {showUrlInput && displayText && url && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border">
          <span className="font-medium">Preview: </span>
          <span className="text-primary">{displayText}</span>
          <span className="text-muted-foreground"> → {url}</span>
        </div>
      )}

      {!showUrlInput && (
        <p className="text-xs text-muted-foreground">
          Click "Add Link" to make the text clickable
        </p>
      )}
    </div>
  );
};

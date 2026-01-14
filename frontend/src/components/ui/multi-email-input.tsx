import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MultiEmailInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiEmailInput({
  value,
  onChange,
  placeholder = "Enter emails...",
  className,
}: MultiEmailInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === "," || e.key === " ") &&
      inputValue.trim()
    ) {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeEmail(value[value.length - 1]);
    }
  };

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().replace(/,/g, "");
    if (!trimmedEmail) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      // Optional: Handle invalid email UI feedback, for now just ignoring or could shake/red border
      return;
    }

    if (!value.includes(trimmedEmail)) {
      onChange([...value, trimmedEmail]);
    }
    setInputValue("");
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter((email) => email !== emailToRemove));
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((email) => (
        <Badge key={email} variant="secondary" className="gap-1 pr-1">
          {email}
          <button
            type="button"
            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              removeEmail(email);
            }}
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        className="flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[150px] h-8"
        placeholder={value.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) {
            addEmail(inputValue);
          }
        }}
      />
    </div>
  );
}

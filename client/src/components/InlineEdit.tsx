import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export default function InlineEdit({
  value,
  onSave,
  type = "text",
  options = [],
  className = "",
  placeholder = "Click to edit",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (!isEditing) {
    return (
      <span
        className={`cursor-pointer hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors inline-block min-w-[40px] ${className}`}
        onClick={() => setIsEditing(true)}
        title="Click to edit"
      >
        {value || <span className="text-muted-foreground italic text-xs">{placeholder}</span>}
      </span>
    );
  }

  if (type === "select") {
    return (
      <Select
        value={editValue}
        onValueChange={(val) => {
          setEditValue(val);
          onSave(val);
          setIsEditing(false);
        }}
      >
        <SelectTrigger className="h-7 text-xs w-auto min-w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-7 text-xs px-2 w-auto min-w-[100px]"
      />
    </div>
  );
}

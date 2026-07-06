"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  disabled = false,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-md border bg-background",
        disabled && "opacity-60",
        className
      )}
    >
      {!disabled && (
        <div className="flex flex-wrap gap-1 border-b p-2">
          <ToolbarButton
            label="B"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="H2"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            label="• List"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
        </div>
      )}
      <EditorContent editor={editor} />
      {placeholder && !value && !editor?.getText() && (
        <p className="pointer-events-none -mt-16 px-3 text-sm text-muted-foreground">
          {placeholder}
        </p>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
    </button>
  );
}

import { useState, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Paragraph from "@tiptap/extension-paragraph";

const lowlight = createLowlight();
lowlight.register({ javascript });

export function useBlogEditor() {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Paragraph,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg shadow max-w-full h-auto my-4",
        },
      }),
      TiptapLink,
      Underline,
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] bg-white dark:bg-zinc-900/90 text-gray-900 dark:text-gray-100 rounded border border-gray-200 dark:border-zinc-700 focus:outline-none p-4 shadow-sm transition-all duration-150 placeholder:text-gray-400 dark:placeholder:text-gray-400",
        style: "caret-color: #3b82f6;",
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when editingId changes
  useEffect(() => {
    if (editor && editingId !== null) {
      editor.commands.setContent(content || "", false);
      editor.commands.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, editor]);

  return {
    editor,
    content,
    setContent,
    editingId,
    setEditingId,
  };
}

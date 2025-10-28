export function TiptapMenuBar({ editor }: { editor: any }) {
  if (!editor) return null;
  
  const btnBase =
    "flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-100 text-lg hover:bg-primary/10 dark:hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40";
  const btnActive =
    "bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground";
  const btnGroup = "flex items-center gap-1";
  const divider = (
    <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-zinc-700" />
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 mb-2 bg-muted/40 dark:bg-zinc-800/60 shadow-sm">
      {/* Formatting */}
      <div className={btnGroup}>
        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnBase + (editor.isActive("bold") ? ` ${btnActive}` : "")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 1 1 0 8H6z"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            btnBase + (editor.isActive("italic") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 4h-9M15 20H6m6-16l-6 16"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            btnBase + (editor.isActive("underline") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            btnBase + (editor.isActive("strike") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12h12M6 19a6 6 0 0 0 12 0M6 5a6 6 0 0 1 12 0"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={
            btnBase + (editor.isActive("highlight") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M4 15h16" />
          </svg>
        </button>
      </div>
      {divider}
      {/* Paragraph/Headings */}
      <div className={btnGroup}>
        <button
          type="button"
          title="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={
            btnBase + (editor.isActive("paragraph") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 17V7a4 4 0 0 0-8 0v10"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            btnBase +
            (editor.isActive("heading", { level: 1 }) ? ` ${btnActive}` : "")
          }
        >
          H1
        </button>
        <button
          type="button"
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            btnBase +
            (editor.isActive("heading", { level: 2 }) ? ` ${btnActive}` : "")
          }
        >
          H2
        </button>
        <button
          type="button"
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            btnBase +
            (editor.isActive("heading", { level: 3 }) ? ` ${btnActive}` : "")
          }
        >
          H3
        </button>
      </div>
      {divider}
      {/* Lists */}
      <div className={btnGroup}>
        <button
          type="button"
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            btnBase + (editor.isActive("bulletList") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="6" cy="12" r="1.5" />
            <path d="M9 12h9" />
          </svg>
        </button>
        <button
          type="button"
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            btnBase + (editor.isActive("orderedList") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <text x="4" y="16" fontSize="10" fill="currentColor">
              1.
            </text>
            <path d="M9 12h9" />
          </svg>
        </button>
      </div>
      {divider}
      {/* Code, rule, clear */}
      <div className={btnGroup}>
        <button
          type="button"
          title="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={
            btnBase + (editor.isActive("codeBlock") ? ` ${btnActive}` : "")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 18l6-6-6-6M8 6l-6 6 6 6"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnBase}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          title="Clear Formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className={btnBase}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {divider}
      {/* Insert */}
      <div className={btnGroup}>
        <button
          type="button"
          title="Insert Image from Link"
          onClick={() => {
            const url = window.prompt("Paste image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className={btnBase}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M4 20l4-4a3 3 0 0 1 4 0l4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

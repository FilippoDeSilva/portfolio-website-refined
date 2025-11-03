"use client";
// @ts-nocheck - TipTap types are complex and don't affect functionality

import { EditorContent, useEditor, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import TextStyle from "@tiptap/extension-text-style";
import { Node } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Highlighter,
  ChevronDown,
  Video as VideoIcon,
  X,
  Sparkles,
} from "lucide-react";
import { renderToString } from 'react-dom/server';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";

const lowlight = createLowlight();
lowlight.register({ javascript, typescript, python });

// Custom Video extension with delete button
const Video = Node.create({
  name: 'video',
  
  group: 'block',
  
  draggable: true,
  
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (element) => ({
          src: (element as HTMLElement).getAttribute('src'),
        }),
      },
      {
        tag: 'div[data-video-wrapper]',
        getAttrs: (element) => {
          const video = (element as HTMLElement).querySelector('video');
          return video ? { src: video.getAttribute('src') } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        'data-video-wrapper': '',
        class: 'relative group my-4',
      },
      [
        'video',
        {
          src: node.attrs.src,
          controls: 'controls',
          class: 'rounded-lg shadow-lg max-w-full h-auto w-full',
          style: 'max-height: 500px;',
        },
      ],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative group my-4 inline-block w-full';
      
      const video = document.createElement('video');
      video.src = node.attrs.src;
      video.controls = true;
      video.className = 'rounded-lg shadow-lg max-w-full h-auto w-full';
      video.style.maxHeight = '500px';
      
      // Prevent video from opening in new tab
      video.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = renderToString(<X size={16} strokeWidth={2} />);
      deleteButton.className = 'absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-tr-lg rounded-bl-md w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/90 shadow-md cursor-pointer z-20';
      deleteButton.contentEditable = 'false';
      deleteButton.title = 'Delete video';
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
        }
      });
      
      wrapper.appendChild(video);
      wrapper.appendChild(deleteButton);
      
      return {
        dom: wrapper,
        contentDOM: null,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'video') return false;
          video.src = updatedNode.attrs.src;
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      setVideo: (options: { src: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    } as any;
  },
});

// Custom Image extension with delete button
const CustomImage = Image.extend({
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative group my-4 inline-block';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'rounded-lg shadow-lg max-w-full h-auto cursor-pointer hover:shadow-xl transition-shadow';
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = renderToString(<X size={16} strokeWidth={2} />);
      deleteButton.className = 'absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-tr-lg rounded-bl-md w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/90 shadow-md cursor-pointer z-20';
      deleteButton.contentEditable = 'false';
      deleteButton.title = 'Delete image';
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
        }
      });
      
      wrapper.appendChild(img);
      wrapper.appendChild(deleteButton);
      
      return {
        dom: wrapper,
        contentDOM: null,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';
          return true;
        },
      };
    };
  },
});

// Custom Highlight extension with text color support
const CustomHighlight = Highlight.extend({
  addAttributes() {
    const parentAttrs = this.parent?.() || {};
    
    return {
      ...parentAttrs,
      textColor: {
        default: null,
        parseHTML: element => {
          return element.getAttribute('data-text-color') || element.style.color;
        },
        renderHTML: attributes => {
          if (!attributes.textColor) {
            return {};
          }
          return {
            'data-text-color': attributes.textColor,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            color: el.getAttribute('data-color') || el.style.backgroundColor || null,
            textColor: el.getAttribute('data-text-color') || null,
          };
        },
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    const { color, textColor } = mark.attrs;
    
    const styles = [];
    if (color) {
      styles.push(`background-color: ${color}`);
    }
    if (textColor) {
      styles.push(`color: ${textColor}`);
    }
    styles.push('padding: 0.125rem 0.25rem');
    styles.push('border-radius: 0.25rem');

    return [
      'mark',
      {
        'data-color': color || '',
        'data-text-color': textColor || '',
        style: styles.join('; '),
        class: HTMLAttributes.class || '',
      },
      0,
    ] as any;
  },
});

interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  onOpenAI?: () => void;
}

export interface AdvancedEditorRef {
  insertContent: (html: string) => void;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#fef08a", textColor: "#854d0e", class: "bg-yellow-200" },
  { name: "Green", color: "#bbf7d0", textColor: "#14532d", class: "bg-green-200" },
  { name: "Blue", color: "#bfdbfe", textColor: "#1e3a8a", class: "bg-blue-200" },
  { name: "Pink", color: "#fbcfe8", textColor: "#831843", class: "bg-pink-200" },
  { name: "Purple", color: "#e9d5ff", textColor: "#581c87", class: "bg-purple-200" },
  { name: "Orange", color: "#fed7aa", textColor: "#7c2d12", class: "bg-orange-200" },
  { name: "Red", color: "#fecaca", textColor: "#7f1d1d", class: "bg-red-200" },
  { name: "Gray", color: "#e5e7eb", textColor: "#1f2937", class: "bg-gray-200" },
  { name: "Teal", color: "#99f6e4", textColor: "#134e4a", class: "bg-teal-200" },
  { name: "Indigo", color: "#c7d2fe", textColor: "#312e81", class: "bg-indigo-200" },
];

export const AdvancedEditor = forwardRef<AdvancedEditorRef, AdvancedEditorProps>(function AdvancedEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Start writing your blog post... Type '/' for commands",
  onOpenAI,
}, ref) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState<'image' | 'video' | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const isInitialMount = useRef(true);
  const lastUsedColor = useRef({ color: '#fef08a', textColor: '#854d0e' }); // Default: Yellow
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Disable default codeBlock to use CodeBlockLowlight
      }),
      TextStyle,
      CustomImage.configure({
        allowBase64: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 cursor-pointer",
        },
      }),
      Underline,
      Video,
      CustomHighlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted rounded-lg p-4 my-4 overflow-x-auto",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
        spellcheck: "false",
      },
      handleDOMEvents: {
        // Ensure text selection works properly
        mousedown: (view, event) => {
          return false; // Let default behavior handle it
        },
      },
    },
    immediatelyRender: false,
  });

  // Mark that initial mount is complete
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  // Close modals on ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMediaModal) {
          setShowMediaModal(null);
          setMediaUrl('');
        } else if (showShortcutsModal) {
          setShowShortcutsModal(false);
        }
      }
    };

    if (showMediaModal || showShortcutsModal) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [showMediaModal, showShortcutsModal]);

  // Expose insertContent method via ref - MUST be before early return
  useImperativeHandle(ref, () => ({
    insertContent: (html: string) => {
      if (editor) {
        editor.chain().focus().insertContent(html).run();
      }
    }
  }), [editor]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        editor.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        (editor.chain().focus() as any).setVideo({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const addImage = () => {
    setShowMediaModal('image');
  };

  const addVideo = () => {
    setShowMediaModal('video');
  };

  const handleMediaUpload = () => {
    if (showMediaModal === 'image') {
      imageInputRef.current?.click();
    } else if (showMediaModal === 'video') {
      videoInputRef.current?.click();
    }
    setShowMediaModal(null);
  };

  const handleMediaUrl = () => {
    if (mediaUrl.trim()) {
      if (showMediaModal === 'image') {
        editor.chain().focus().setImage({ src: mediaUrl }).run();
      } else if (showMediaModal === 'video') {
        (editor.chain().focus() as any).setVideo({ src: mediaUrl }).run();
      }
      setMediaUrl('');
      setShowMediaModal(null);
    }
  };

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-border rounded-xl bg-background shadow-sm">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      
      {/* Floating Bubble Menu - Appears on text selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => {
            // Only show when there's a text selection
            const { from, to } = state.selection;
            const isTextSelected = from !== to;
            
            // Check if selection is within the editor
            const isInEditor = editor.view.hasFocus();
            
            return isTextSelected && isInEditor;
          }}
          tippyOptions={{
            duration: 100,
            placement: 'top',
            maxWidth: 'none',
            popperOptions: {
              strategy: 'absolute',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    boundary: 'clippingAncestors',
                    padding: 8,
                    altAxis: true,
                  },
                },
                {
                  name: 'flip',
                  options: {
                    fallbackPlacements: ['bottom', 'top'],
                    padding: 8,
                  },
                },
              ],
            },
          }}
          className="bg-popover border border-border rounded-lg shadow-xl p-1 xs:p-1.5 flex flex-wrap gap-0.5 xs:gap-1 items-center z-[9999] max-w-[calc(100vw-16px)] xs:max-w-[600px] overflow-hidden"
        >
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={<Bold className="w-4 h-4" />}
            tooltip="Bold"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={<Italic className="w-4 h-4" />}
            tooltip="Italic"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={<UnderlineIcon className="w-4 h-4" />}
            tooltip="Underline"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            icon={<Strikethrough className="w-4 h-4" />}
            tooltip="Strikethrough"
            size="sm"
          />
          
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            icon={<Heading1 className="w-4 h-4" />}
            tooltip="H1"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            icon={<Heading2 className="w-4 h-4" />}
            tooltip="H2"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            icon={<Heading3 className="w-4 h-4" />}
            tooltip="H3"
            size="sm"
          />
          
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Highlight */}
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("highlight")) {
                editor.chain().focus().unsetMark('highlight').run();
              } else {
                editor.chain().focus().toggleMark('highlight', lastUsedColor.current).run();
              }
            }}
            isActive={editor.isActive("highlight")}
            icon={<Highlighter className="w-4 h-4" />}
            tooltip="Highlight"
            size="sm"
          />
          
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Code & Link */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            icon={<Code className="w-4 h-4" />}
            tooltip="Code"
            size="sm"
          />
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            icon={<Link2 className="w-4 h-4" />}
            tooltip="Link"
            size="sm"
          />
          
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Lists & Quote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={<List className="w-4 h-4" />}
            tooltip="Bullet List"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={<ListOrdered className="w-4 h-4" />}
            tooltip="Numbered List"
            size="sm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={<Quote className="w-4 h-4" />}
            tooltip="Quote"
            size="sm"
          />
        </BubbleMenu>
      )}
      
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30 sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={<Bold className="w-4 h-4" />}
            tooltip="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={<Italic className="w-4 h-4" />}
            tooltip="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={<UnderlineIcon className="w-4 h-4" />}
            tooltip="Underline"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            icon={<Strikethrough className="w-4 h-4" />}
            tooltip="Strikethrough"
          />
          {/* Color Picker Dropdown */}
          <div className="relative color-picker-container flex gap-0">
            <ToolbarButton
              onClick={() => {
                // If text is already highlighted, remove it
                if (editor.isActive("highlight")) {
                  editor.chain().focus().unsetMark('highlight').run();
                } else {
                  // Otherwise, apply last used color
                  editor.chain().focus().toggleMark('highlight', lastUsedColor.current).run();
                }
              }}
              isActive={editor.isActive("highlight")}
              icon={<Highlighter className="w-4 h-4" />}
              tooltip="Highlight (Click to toggle)"
            />
            {/* Dropdown arrow for color picker */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-2 rounded-md transition-colors hover:bg-muted border-l border-border ml-0.5"
              title="Choose color"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-3 z-50 min-w-[240px] color-picker-container">
                <div className="text-xs font-medium mb-3 px-1 text-muted-foreground">
                  Highlight Colors
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.name}
                      onClick={() => {
                        if (editor) {
                          // Save as last used color
                          lastUsedColor.current = {
                            color: color.color,
                            textColor: color.textColor
                          };
                          // Apply the color
                          editor.chain().focus().toggleMark('highlight', { 
                            color: color.color,
                            textColor: color.textColor 
                          }).run();
                        }
                        setShowColorPicker(false);
                      }}
                      className="group relative flex flex-col items-center"
                      title={color.name}
                    >
                      <div
                        className="w-8 h-8 rounded-md border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-md hover:scale-110"
                        style={{ 
                          backgroundColor: color.color,
                        }}
                      />
                      <span className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground transition-colors">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            icon={<Heading1 className="w-4 h-4" />}
            tooltip="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            icon={<Heading2 className="w-4 h-4" />}
            tooltip="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            icon={<Heading3 className="w-4 h-4" />}
            tooltip="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={<List className="w-4 h-4" />}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={<ListOrdered className="w-4 h-4" />}
            tooltip="Numbered List"
          />
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            icon={<Link2 className="w-4 h-4" />}
            tooltip="Insert Link"
          />
          <ToolbarButton
            onClick={addImage}
            icon={<ImageIcon className="w-4 h-4" />}
            tooltip="Insert Image"
          />
          <ToolbarButton
            onClick={addVideo}
            icon={<VideoIcon className="w-4 h-4" />}
            tooltip="Insert Video"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            icon={<Code className="w-4 h-4" />}
            tooltip="Code Block"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            icon={<Code className="w-4 h-4" />}
            tooltip="Inline Code"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={<Quote className="w-4 h-4" />}
            tooltip="Block Quote (Tip: Press Enter twice to exit)"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={<Undo className="w-4 h-4" />}
            tooltip="Undo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={<Redo className="w-4 h-4" />}
            tooltip="Redo"
          />
        </div>

        {/* AI Assistant & Help */}
        <div className="flex gap-1 ml-auto">
          {onOpenAI && (
            <button
              type="button"
              onClick={onOpenAI}
              className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary hover:text-primary flex items-center gap-1.5 px-3"
              title="AI Writing Assistant"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-medium hidden sm:inline">AI Assistant</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Keyboard Shortcuts"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="overflow-auto max-h-[600px] relative">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex justify-between items-center bg-muted/20 rounded-b-xl">
        <span>{editor.getText().length} characters</span>
        <span>{editor.getText().split(/\s+/).filter(word => word.length > 0).length} words</span>
      </div>

      {/* Media Upload/URL Modal */}
      {showMediaModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
          onClick={() => {
            setShowMediaModal(null);
            setMediaUrl('');
          }}
        >
          <div 
            className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {showMediaModal === 'image' ? (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Insert Image
                    </>
                  ) : (
                    <>
                      <VideoIcon className="w-5 h-5" />
                      Insert Video
                    </>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how you want to add your {showMediaModal}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMediaModal(null);
                  setMediaUrl('');
                }}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Upload Option */}
              <button
                type="button"
                onClick={handleMediaUpload}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Upload from Computer</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a {showMediaModal} file from your device
                    </p>
                  </div>
                </div>
              </button>

              {/* URL Option */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border-2 border-border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Insert from URL</h3>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleMediaUrl();
                        }
                      }}
                      placeholder={`https://example.com/${showMediaModal}.${showMediaModal === 'image' ? 'jpg' : 'mp4'}`}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMediaUrl}
                  disabled={!mediaUrl.trim()}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Insert {showMediaModal === 'image' ? 'Image' : 'Video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">⌨️ Keyboard Shortcuts & Tips</h2>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Text Formatting */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>✏️</span> Text Formatting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Bold</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+B</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Italic</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+I</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Underline</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+U</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Strikethrough</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+X</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Code</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+E</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Link</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+K</kbd>
                  </div>
                </div>
              </div>

              {/* Headings */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>📐</span> Headings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Heading 1</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Alt+1</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Heading 2</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Alt+2</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Heading 3</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Alt+3</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Paragraph</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Alt+0</kbd>
                  </div>
                </div>
              </div>

              {/* Lists & Blocks */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>📋</span> Lists & Blocks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Bullet List</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+8</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Numbered List</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+7</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Blockquote</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+B</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Code Block</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Alt+C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Horizontal Rule</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+-</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Hard Break</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Shift+Enter</kbd>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>⚡</span> Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Undo</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Z</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Redo</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Y</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Select All</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+A</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Find</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+F</kbd>
                  </div>
                </div>
              </div>

              {/* Selection */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>🎯</span> Text Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Select Word</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Double Click</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Select Line</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Triple Click</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Extend Selection</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Shift+Arrow</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Select by Word</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Shift+Arrow</kbd>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                  <span>💡</span> Pro Tips
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">⏎</span>
                    <div>
                      <strong className="text-foreground">Press Enter twice</strong>
                      <p className="text-muted-foreground mt-0.5">Exit quotes, lists, or code blocks quickly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">/</span>
                    <div>
                      <strong className="text-foreground">Type / for slash commands</strong>
                      <p className="text-muted-foreground mt-0.5">Quick access to insert headings, lists, and more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">✨</span>
                    <div>
                      <strong className="text-foreground">Floating toolbar on selection</strong>
                      <p className="text-muted-foreground mt-0.5">Select text to see quick formatting options appear above</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">🎨</span>
                    <div>
                      <strong className="text-foreground">Smart highlighter</strong>
                      <p className="text-muted-foreground mt-0.5">Remembers your last color for one-click highlighting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">⌨️</span>
                    <div>
                      <strong className="text-foreground">Markdown shortcuts</strong>
                      <p className="text-muted-foreground mt-0.5">Type ** for bold, * for italic, ` for code, &gt; for quote</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xl">⎋</span>
                    <div>
                      <strong className="text-foreground">Press ESC to close modals</strong>
                      <p className="text-muted-foreground mt-0.5">Quickly dismiss any open modal or dialog</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
  size?: "sm" | "md";
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  icon,
  tooltip,
  size = "md",
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        ${size === "sm" ? "p-1.5" : "p-2"}
        rounded-md transition-colors
        ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {icon}
    </button>
  );
}

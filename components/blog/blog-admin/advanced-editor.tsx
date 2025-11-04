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
import { Color } from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import { Node } from "@tiptap/core";

// Custom FontFamily extension
const FontFamily = Extension.create({
  name: 'fontFamily',
  
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },
  
  addCommands() {
    return {
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

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
  Type,
  Plus,
  Minus,
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

const TEXT_COLORS = [
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#374151" },
  { name: "Gray", color: "#6b7280" },
  { name: "Red", color: "#dc2626" },
  { name: "Orange", color: "#ea580c" },
  { name: "Yellow", color: "#ca8a04" },
  { name: "Green", color: "#16a34a" },
  { name: "Teal", color: "#0d9488" },
  { name: "Blue", color: "#2563eb" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Purple", color: "#9333ea" },
  { name: "Pink", color: "#db2777" },
];

const BLOG_FONTS = [
  { name: 'Default', value: '', category: '' },
  
  // Professional & Clean
  { name: 'Oxygen', value: 'Oxygen, sans-serif', category: 'Professional' },
  { name: 'Space Grotesk', value: '"Space Grotesk", sans-serif', category: 'Professional' },
  { name: 'Fira Sans Condensed', value: '"Fira Sans Condensed", sans-serif', category: 'Professional' },
  { name: 'Unbounded', value: 'Unbounded, sans-serif', category: 'Professional' },
  { name: 'Philosopher', value: 'Philosopher, sans-serif', category: 'Professional' },
  
  // Classic & Elegant
  { name: 'Noto Serif', value: '"Noto Serif", serif', category: 'Classic' },
  { name: 'Old Standard TT', value: '"Old Standard TT", serif', category: 'Classic' },
  { name: 'Almendra', value: 'Almendra, serif', category: 'Classic' },
  
  // Modern & Stylish
  { name: 'Momo Trust Display', value: '"Momo Trust Display", sans-serif', category: 'Modern' },
  { name: 'Bitcount Grid Single', value: '"Bitcount Grid Single", monospace', category: 'Modern' },
  { name: 'Sixtyfour', value: 'Sixtyfour, sans-serif', category: 'Modern' },
  { name: 'Rubik 80s Fade', value: '"Rubik 80s Fade", sans-serif', category: 'Modern' },
  { name: 'Tourney', value: 'Tourney, sans-serif', category: 'Modern' },
  { name: 'Monoton', value: 'Monoton, cursive', category: 'Modern' },
  
  // Handwriting & Script
  { name: 'Momo Signature', value: '"Momo Signature", cursive', category: 'Handwriting' },
  { name: 'Dancing Script', value: '"Dancing Script", cursive', category: 'Handwriting' },
  { name: 'Caveat', value: 'Caveat, cursive', category: 'Handwriting' },
  { name: 'Pacifico', value: 'Pacifico, cursive', category: 'Handwriting' },
  { name: 'Shadows Into Light', value: '"Shadows Into Light", cursive', category: 'Handwriting' },
  { name: 'Indie Flower', value: '"Indie Flower", cursive', category: 'Handwriting' },
  { name: 'Permanent Marker', value: '"Permanent Marker", cursive', category: 'Handwriting' },
  { name: 'Architects Daughter', value: '"Architects Daughter", cursive', category: 'Handwriting' },
  { name: 'Cabin Sketch', value: '"Cabin Sketch", cursive', category: 'Handwriting' },
  
  // Decorative & Fancy
  { name: 'Lobster Two', value: '"Lobster Two", cursive', category: 'Decorative' },
  { name: 'Great Vibes', value: '"Great Vibes", cursive', category: 'Decorative' },
  { name: 'Oleo Script', value: '"Oleo Script", cursive', category: 'Decorative' },
  { name: 'Kaushan Script', value: '"Kaushan Script", cursive', category: 'Decorative' },
  { name: 'WindSong', value: 'WindSong, cursive', category: 'Decorative' },
  { name: 'Aguafina Script', value: '"Aguafina Script", cursive', category: 'Decorative' },
  { name: 'Vujahday Script', value: '"Vujahday Script", cursive', category: 'Decorative' },
  { name: 'Homemade Apple', value: '"Homemade Apple", cursive', category: 'Decorative' },
  
  // Fun & Playful
  { name: 'Jersey 10', value: '"Jersey 10", sans-serif', category: 'Fun' },
  { name: 'Gravitas One', value: '"Gravitas One", cursive', category: 'Fun' },
  { name: 'Are You Serious', value: '"Are You Serious", cursive', category: 'Fun' },
  { name: 'Freckle Face', value: '"Freckle Face", cursive', category: 'Fun' },
  { name: 'Trade Winds', value: '"Trade Winds", cursive', category: 'Fun' },
  { name: 'Aladin', value: 'Aladin, cursive', category: 'Fun' },
  { name: 'Sancreek', value: 'Sancreek, cursive', category: 'Fun' },
  
  // Technical & Code
  { name: 'Google Sans Code', value: '"Google Sans Code", monospace', category: 'Technical' },
  { name: 'Kode Mono', value: '"Kode Mono", monospace', category: 'Technical' },
  { name: 'Special Elite', value: '"Special Elite", cursive', category: 'Technical' },
  { name: 'Libertinus Keyboard', value: '"Libertinus Keyboard", monospace', category: 'Technical' },
  
  // Bold & Impactful
  { name: 'Bungee Tint', value: '"Bungee Tint", cursive', category: 'Bold' },
  { name: 'Bungee Spice', value: '"Bungee Spice", cursive', category: 'Bold' },
  { name: 'Faster One', value: '"Faster One", cursive', category: 'Bold' },
  { name: 'New Rocker', value: '"New Rocker", cursive', category: 'Bold' },
  { name: 'Metal Mania', value: '"Metal Mania", cursive', category: 'Bold' },
  { name: 'Rubik Glitch', value: '"Rubik Glitch", cursive', category: 'Bold' },
  
  // Horror & Spooky
  { name: 'Creepster', value: 'Creepster, cursive', category: 'Horror' },
  { name: 'Butcherman', value: 'Butcherman, cursive', category: 'Horror' },
  { name: 'Eater', value: 'Eater, cursive', category: 'Horror' },
  { name: 'Nosifer', value: 'Nosifer, cursive', category: 'Horror' },
  { name: 'Londrina Sketch', value: '"Londrina Sketch", cursive', category: 'Horror' },
  
  // Artistic & Unique
  { name: 'Manufacturing Consent', value: '"Manufacturing Consent", sans-serif', category: 'Artistic' },
  { name: 'Menbere', value: 'Menbere, sans-serif', category: 'Artistic' },
  { name: 'Codystar', value: 'Codystar, cursive', category: 'Artistic' },
  { name: 'Nova Script', value: '"Nova Script", cursive', category: 'Artistic' },
  { name: 'Water Brush', value: '"Water Brush", cursive', category: 'Artistic' },
  { name: 'Neonderthaw', value: 'Neonderthaw, cursive', category: 'Artistic' },
  { name: 'Love Light', value: '"Love Light", cursive', category: 'Artistic' },
  { name: 'Cherish', value: 'Cherish, cursive', category: 'Artistic' },
  { name: 'Splash', value: 'Splash, cursive', category: 'Artistic' },
  { name: 'Matemasie', value: 'Matemasie, sans-serif', category: 'Artistic' },
  { name: 'Nabla', value: 'Nabla, system-ui', category: 'Artistic' },
  
  // Vintage & Retro
  { name: 'Road Rage', value: '"Road Rage", cursive', category: 'Vintage' },
  { name: 'Jolly Lodger', value: '"Jolly Lodger", cursive', category: 'Vintage' },
  { name: 'Germania One', value: '"Germania One", cursive', category: 'Vintage' },
  { name: 'Lemon', value: 'Lemon, cursive', category: 'Vintage' },
  { name: 'Akronim', value: 'Akronim, cursive', category: 'Vintage' },
  { name: 'Astloch', value: 'Astloch, cursive', category: 'Vintage' },
  { name: 'Piedra', value: 'Piedra, cursive', category: 'Vintage' },
  { name: 'Miltonian', value: 'Miltonian, cursive', category: 'Vintage' },
  { name: 'Arbutus', value: 'Arbutus, cursive', category: 'Vintage' },
  { name: 'Plaster', value: 'Plaster, cursive', category: 'Vintage' },
  { name: 'New Amsterdam', value: '"New Amsterdam", sans-serif', category: 'Vintage' },
  { name: 'Griffy', value: 'Griffy, cursive', category: 'Vintage' },
  { name: 'Tulpen One', value: '"Tulpen One", cursive', category: 'Vintage' },
  { name: 'Jim Nightshade', value: '"Jim Nightshade", cursive', category: 'Vintage' },
  { name: 'Oldenburg', value: 'Oldenburg, cursive', category: 'Vintage' },
  
  // Experimental & Glitch
  { name: 'Rubik Moonrocks', value: '"Rubik Moonrocks", cursive', category: 'Experimental' },
  { name: 'Rubik Scribble', value: '"Rubik Scribble", cursive', category: 'Experimental' },
  { name: 'Londrina Shadow', value: '"Londrina Shadow", cursive', category: 'Experimental' },
  { name: 'Zen Tokyo Zoo', value: '"Zen Tokyo Zoo", cursive', category: 'Experimental' },
  { name: 'Almendra Display', value: '"Almendra Display", cursive', category: 'Experimental' },
  { name: 'Alumni Sans Pinstripe', value: '"Alumni Sans Pinstripe", sans-serif', category: 'Experimental' },
  { name: 'Jacquard 12', value: '"Jacquard 12", system-ui', category: 'Experimental' },
  { name: 'Bitcount Prop Double', value: '"Bitcount Prop Double", monospace', category: 'Experimental' },
  { name: 'Lugrasimo', value: 'Lugrasimo, cursive', category: 'Experimental' },
  { name: 'Bungee Outline', value: '"Bungee Outline", cursive', category: 'Experimental' },
  { name: 'Jersey 20', value: '"Jersey 20", sans-serif', category: 'Experimental' },
  { name: 'Rubik Distressed', value: '"Rubik Distressed", cursive', category: 'Experimental' },
  { name: 'Kumar One Outline', value: '"Kumar One Outline", cursive', category: 'Experimental' },
  { name: 'Flavors', value: 'Flavors, cursive', category: 'Experimental' },
  { name: 'Rubik Vinyl', value: '"Rubik Vinyl", cursive', category: 'Experimental' },
  { name: 'Bonbon', value: 'Bonbon, cursive', category: 'Experimental' },
  { name: 'Trochut', value: 'Trochut, cursive', category: 'Experimental' },
  { name: 'Rubik Gemstones', value: '"Rubik Gemstones", cursive', category: 'Experimental' },
  { name: 'Hanalei Fill', value: '"Hanalei Fill", cursive', category: 'Experimental' },
  { name: 'Purple Purse', value: '"Purple Purse", cursive', category: 'Experimental' },
  { name: 'Bruno Ace SC', value: '"Bruno Ace SC", sans-serif', category: 'Experimental' },
  { name: 'Foldit', value: 'Foldit, cursive', category: 'Experimental' },
  { name: 'Alumni Sans Inline One', value: '"Alumni Sans Inline One", sans-serif', category: 'Experimental' },
  { name: 'Emblema One', value: '"Emblema One", cursive', category: 'Experimental' },
  { name: 'Wittgenstein', value: 'Wittgenstein, serif', category: 'Experimental' },
  { name: 'Rubik Glitch Pop', value: '"Rubik Glitch Pop", system-ui', category: 'Experimental' },
  { name: 'GFS Neohellenic', value: '"GFS Neohellenic", sans-serif', category: 'Experimental' },
  { name: 'Jacquard 24', value: '"Jacquard 24", system-ui', category: 'Experimental' },
  { name: 'Rubik Beastly', value: '"Rubik Beastly", system-ui', category: 'Experimental' },
  { name: 'Rubik Microbe', value: '"Rubik Microbe", system-ui', category: 'Experimental' },
  { name: 'Ruge Boogie', value: '"Ruge Boogie", cursive', category: 'Experimental' },
  { name: 'Protest Guerrilla', value: '"Protest Guerrilla", sans-serif', category: 'Experimental' },
  { name: 'Rubik Puddles', value: '"Rubik Puddles", cursive', category: 'Experimental' },
  { name: 'Moo Lah Lah', value: '"Moo Lah Lah", cursive', category: 'Experimental' },
  { name: 'Rubik Marker Hatch', value: '"Rubik Marker Hatch", cursive', category: 'Experimental' },
  { name: 'Labrada', value: 'Labrada, serif', category: 'Experimental' },
  { name: 'Workbench', value: 'Workbench, system-ui', category: 'Experimental' },
  { name: 'Kalnia Glaze', value: '"Kalnia Glaze", serif', category: 'Experimental' },
  { name: 'Sixtyfour Convergence', value: '"Sixtyfour Convergence", sans-serif', category: 'Experimental' },
  { name: 'Hanalei', value: 'Hanalei, cursive', category: 'Experimental' },
  { name: 'Rubik Maps', value: '"Rubik Maps", system-ui', category: 'Experimental' },
  { name: 'Rubik Doodle Triangles', value: '"Rubik Doodle Triangles", system-ui', category: 'Experimental' },
  { name: 'Jacquard 12 Charted', value: '"Jacquard 12 Charted", system-ui', category: 'Experimental' },
  { name: 'Jersey 25 Charted', value: '"Jersey 25 Charted", system-ui', category: 'Experimental' },
  { name: 'Rubik Storm', value: '"Rubik Storm", system-ui', category: 'Experimental' },
  { name: 'Rubik Maze', value: '"Rubik Maze", system-ui', category: 'Experimental' },
  { name: 'Rubik Lines', value: '"Rubik Lines", system-ui', category: 'Experimental' },
  
  // Educational & Handwriting
  { name: 'Edu VIC WA NT Beginner', value: '"Edu VIC WA NT Beginner", cursive', category: 'Educational' },
  { name: 'Arsenal SC', value: '"Arsenal SC", sans-serif', category: 'Educational' },
  { name: 'Abyssinica SIL', value: '"Abyssinica SIL", serif', category: 'Educational' },
  
  // Emoji & Symbols
  { name: 'Noto Color Emoji', value: '"Noto Color Emoji", sans-serif', category: 'Emoji' },
];

export const AdvancedEditor = forwardRef<AdvancedEditorRef, AdvancedEditorProps>(function AdvancedEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Start writing your blog post... Type '/' for commands",
  onOpenAI,
}, ref) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
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
      Color,
      FontFamily,
      FontSize,
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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[540px] px-4 py-3",
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

  // Close font picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.font-picker-container')) {
        setShowFontPicker(false);
      }
    };

    if (showFontPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFontPicker]);

  // Close text color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.text-color-picker-container')) {
        setShowTextColorPicker(false);
      }
    };

    if (showTextColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTextColorPicker]);

  // Close shortcuts modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showShortcutsModal) {
        e.stopPropagation();
        e.preventDefault();
        setShowShortcutsModal(false);
      }
    };

    if (showShortcutsModal) {
      window.addEventListener('keydown', handleEscape, true); // Use capture phase
      return () => window.removeEventListener('keydown', handleEscape, true);
    }
  }, [showShortcutsModal]);

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
        </div>

        {/* Font Family */}
        <div className="relative border-r border-border pr-2 font-picker-container">
          <button
            type="button"
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium flex items-center gap-1 focus:outline-none"
            title="Font Family"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-3 z-50 w-[420px] font-picker-container">
              <div className="text-xs font-semibold mb-3 px-1 text-foreground">
                Choose Font Style
              </div>
              <div className="max-h-[450px] overflow-y-auto">
                {(() => {
                  const categories: { [key: string]: typeof BLOG_FONTS } = {};
                  BLOG_FONTS.forEach(font => {
                    const cat = font.category || 'Other';
                    if (!categories[cat]) categories[cat] = [];
                    categories[cat].push(font);
                  });
                  
                  return Object.entries(categories).map(([category, fonts]) => (
                    <div key={category} className="mb-4">
                      {category && (
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                          {category}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {fonts.map((font) => (
                          <button
                            key={font.name}
                            onClick={() => {
                              if (font.value) {
                                editor.chain().focus().setFontFamily(font.value).run();
                              } else {
                                editor.chain().focus().unsetFontFamily().run();
                              }
                              setShowFontPicker(false);
                            }}
                            className="text-left px-3 py-2.5 rounded hover:bg-muted transition-colors text-sm focus:outline-none border border-border/50 hover:border-border"
                            style={{ fontFamily: font.value || 'inherit' }}
                            title={font.name}
                          >
                            <div className="truncate">{font.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Text Formatting - Highlight Color */}
        <div className="flex gap-1 border-r border-border pr-2">
          {/* Color Picker Dropdown */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium flex items-center gap-1 focus:outline-none"
              title="Highlight Colors"
            >
              <Highlighter className="w-4 h-4" />
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
          {/* Text Color Picker */}
          <div className="relative text-color-picker-container">
            <button
              type="button"
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium flex items-center gap-1 focus:outline-none"
              title="Text Color"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTextColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-3 z-50 min-w-[240px] text-color-picker-container">
                <div className="text-xs font-medium mb-3 px-1 text-muted-foreground">
                  Text Colors
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {TEXT_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.name}
                      onClick={() => {
                        if (editor) {
                          editor.chain().focus().setColor(color.color).run();
                        }
                        setShowTextColorPicker(false);
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
                      <span className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (editor) {
                      editor.chain().focus().unsetColor().run();
                    }
                    setShowTextColorPicker(false);
                  }}
                  className="w-full px-3 py-2 text-xs rounded hover:bg-muted transition-colors border border-border"
                >
                  Reset Color
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Font Size */}
        <div className="flex gap-1 border-r border-border pr-2">
          <ToolbarButton
            onClick={() => {
              const { from, to } = editor.state.selection;
              const selectedText = editor.state.doc.textBetween(from, to);
              if (selectedText) {
                // Get current font size or default to 16px
                const currentSize = editor.getAttributes('textStyle').fontSize || '16px';
                const sizeValue = parseInt(currentSize);
                const newSize = Math.max(8, sizeValue - 2); // Decrease by 2px, minimum 8px
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }
            }}
            icon={
              <div className="flex items-center gap-0.5">
                <span className="text-sm">A</span>
                <Minus className="w-3 h-3" />
              </div>
            }
            tooltip="Decrease Font Size (A-)"
          />
          <ToolbarButton
            onClick={() => {
              const { from, to } = editor.state.selection;
              const selectedText = editor.state.doc.textBetween(from, to);
              if (selectedText) {
                // Get current font size or default to 16px
                const currentSize = editor.getAttributes('textStyle').fontSize || '16px';
                const sizeValue = parseInt(currentSize);
                const newSize = Math.min(72, sizeValue + 2); // Increase by 2px, maximum 72px
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }
            }}
            icon={
              <div className="flex items-center gap-0.5">
                <span className="text-base">A</span>
                <Plus className="w-3 h-3" />
              </div>
            }
            tooltip="Increase Font Size (A+)"
          />
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
        <div className="flex gap-1 pr-2">
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
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground focus:outline-none"
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
                      className="w-full px-3 py-2 bg-background border-2 border-border rounded-md focus:outline-none focus:border-primary transition-colors text-sm"
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
              <div>
                <h2 className="text-xl font-semibold">⌨️ Keyboard Shortcuts & Tips</h2>
                <p className="text-xs text-muted-foreground mt-1">Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Esc</kbd> to close</p>
              </div>
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
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Logout</span>
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">Ctrl+Q</kbd>
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
        rounded-md transition-colors focus:outline-none
        ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {icon}
    </button>
  );
}

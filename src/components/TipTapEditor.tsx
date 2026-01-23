import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

export interface TipTapEditorRef {
  editor: Editor | null;
}

interface TipTapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  ({ content, onChange, onBlur, editable = true, className = '', placeholder }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TextStyle,
        Color,
      ],
      content,
      editable,
      editorProps: {
        attributes: {
          class: `prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] ${className}`,
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      onBlur: () => {
        onBlur?.();
      },
    });

    // Expose editor instance via ref
    useImperativeHandle(ref, () => ({
      editor,
    }), [editor]);

    // Update content when it changes externally (initial load)
    useEffect(() => {
      if (editor && content && editor.isEmpty) {
        editor.commands.setContent(content);
      }
    }, [editor, content]);

    // Cleanup
    useEffect(() => {
      return () => {
        editor?.destroy();
      };
    }, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <EditorContent
        editor={editor}
        className="w-full"
      />
    );
  }
);

TipTapEditor.displayName = 'TipTapEditor';

// Toolbar helper functions to be used with the editor instance
export const editorCommands = {
  toggleBold: (editor: Editor | null) => editor?.chain().focus().toggleBold().run(),
  toggleItalic: (editor: Editor | null) => editor?.chain().focus().toggleItalic().run(),
  toggleUnderline: (editor: Editor | null) => editor?.chain().focus().toggleUnderline().run(),
  toggleStrike: (editor: Editor | null) => editor?.chain().focus().toggleStrike().run(),
  toggleCode: (editor: Editor | null) => editor?.chain().focus().toggleCode().run(),
  toggleCodeBlock: (editor: Editor | null) => editor?.chain().focus().toggleCodeBlock().run(),
  toggleBulletList: (editor: Editor | null) => editor?.chain().focus().toggleBulletList().run(),
  toggleOrderedList: (editor: Editor | null) => editor?.chain().focus().toggleOrderedList().run(),

  setHeading: (editor: Editor | null, level: 1 | 2 | 3) =>
    editor?.chain().focus().toggleHeading({ level }).run(),
  setParagraph: (editor: Editor | null) =>
    editor?.chain().focus().setParagraph().run(),

  setTextAlign: (editor: Editor | null, alignment: 'left' | 'center' | 'right' | 'justify') =>
    editor?.chain().focus().setTextAlign(alignment).run(),

  setLink: (editor: Editor | null, href: string) => {
    if (href) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
  },
  unsetLink: (editor: Editor | null) => editor?.chain().focus().unsetLink().run(),

  insertTable: (editor: Editor | null, rows = 3, cols = 3) =>
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run(),

  // Indent/Outdent for lists
  indent: (editor: Editor | null) => editor?.chain().focus().sinkListItem('listItem').run(),
  outdent: (editor: Editor | null) => editor?.chain().focus().liftListItem('listItem').run(),

  // Text color
  setColor: (editor: Editor | null, color: string) =>
    editor?.chain().focus().setColor(color).run(),
  unsetColor: (editor: Editor | null) =>
    editor?.chain().focus().unsetColor().run(),
};

// Check if a format is active
export const isFormatActive = {
  bold: (editor: Editor | null) => editor?.isActive('bold') ?? false,
  italic: (editor: Editor | null) => editor?.isActive('italic') ?? false,
  underline: (editor: Editor | null) => editor?.isActive('underline') ?? false,
  strike: (editor: Editor | null) => editor?.isActive('strike') ?? false,
  code: (editor: Editor | null) => editor?.isActive('code') ?? false,
  codeBlock: (editor: Editor | null) => editor?.isActive('codeBlock') ?? false,
  bulletList: (editor: Editor | null) => editor?.isActive('bulletList') ?? false,
  orderedList: (editor: Editor | null) => editor?.isActive('orderedList') ?? false,
  heading: (editor: Editor | null, level: number) => editor?.isActive('heading', { level }) ?? false,
  link: (editor: Editor | null) => editor?.isActive('link') ?? false,
  textAlign: (editor: Editor | null, alignment: string) => editor?.isActive({ textAlign: alignment }) ?? false,
  textColor: (editor: Editor | null) => editor?.getAttributes('textStyle').color ?? null,
};

// Color options for the color picker
export const TEXT_COLORS = [
  { name: 'Yellow', color: '#FCD34D' },
  { name: 'Orange', color: '#FB923C' },
  { name: 'Green', color: '#4ADE80' },
  { name: 'Blue', color: '#60A5FA' },
  { name: 'Purple', color: '#A78BFA' },
  { name: 'Red', color: '#F87171' },
  { name: 'Default', color: null },
] as const;

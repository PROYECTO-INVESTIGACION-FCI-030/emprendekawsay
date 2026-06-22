"use client"

import { Color } from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Strikethrough,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-56 px-4 py-3 text-sm leading-6 outline-none [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:ml-6 [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
      },
    },
  })

  if (!editor) return <div className="min-h-64 rounded-md border border-border bg-muted/20" />

  const tool = (active: boolean) => cn(active && "bg-muted text-foreground")

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2">
        <Button type="button" size="icon-sm" variant="ghost" title="Parrafo" className={tool(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Titulo" className={tool(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Subtitulo" className={tool(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></Button>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button type="button" size="icon-sm" variant="ghost" title="Negrita" className={tool(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Cursiva" className={tool(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Tachado" className={tool(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></Button>
        <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border" title="Color del texto">
          <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: editor.getAttributes("textStyle").color ?? "#111827" }} />
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={editor.getAttributes("textStyle").color ?? "#111827"}
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
          />
        </label>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button type="button" size="icon-sm" variant="ghost" title="Lista" className={tool(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Lista numerada" className={tool(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Cita" className={tool(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></Button>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button type="button" size="icon-sm" variant="ghost" title="Alinear a la izquierda" className={tool(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Centrar" className={tool(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Alinear a la derecha" className={tool(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight /></Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Justificar" className={tool(editor.isActive({ textAlign: "justify" }))} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify /></Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

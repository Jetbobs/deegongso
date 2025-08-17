"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
}

export default function RichTextEditor({
  content = "",
  placeholder = "텍스트를 입력하세요...",
  onChange,
  editable = true,
  className = "",
  minHeight = "200px",
  maxHeight = "400px"
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('이미지 URL을 입력하세요:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('링크 URL을 입력하세요:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="skeleton h-48 w-full" />;
  }

  return (
    <div className={`border border-base-300 rounded-lg ${className}`}>
      {editable && (
        <div className="border-b border-base-300 p-2 flex flex-wrap gap-1">
          {/* 텍스트 스타일 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('bold') ? 'btn-active' : ''}`}
            title="굵게"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('italic') ? 'btn-active' : ''}`}
            title="기울임"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('strike') ? 'btn-active' : ''}`}
            title="취소선"
          >
            <s>S</s>
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 제목 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`}
            title="제목 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('heading', { level: 3 }) ? 'btn-active' : ''}`}
            title="제목 3"
          >
            H3
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 목록 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('bulletList') ? 'btn-active' : ''}`}
            title="불릿 목록"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('orderedList') ? 'btn-active' : ''}`}
            title="번호 목록"
          >
            1.
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 인용문 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('blockquote') ? 'btn-active' : ''}`}
            title="인용문"
          >
            &quot;
          </button>

          {/* 코드 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('code') ? 'btn-active' : ''}`}
            title="코드"
          >
            &lt;/&gt;
          </button>

          {/* 하이라이트 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`btn btn-sm btn-ghost ${editor.isActive('highlight') ? 'btn-active' : ''}`}
            title="형광펜"
          >
            📝
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 정렬 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`btn btn-sm btn-ghost ${editor.isActive({ textAlign: 'left' }) ? 'btn-active' : ''}`}
            title="왼쪽 정렬"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`btn btn-sm btn-ghost ${editor.isActive({ textAlign: 'center' }) ? 'btn-active' : ''}`}
            title="가운데 정렬"
          >
            ↔️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`btn btn-sm btn-ghost ${editor.isActive({ textAlign: 'right' }) ? 'btn-active' : ''}`}
            title="오른쪽 정렬"
          >
            ➡️
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 링크 */}
          <button
            type="button"
            onClick={setLink}
            className={`btn btn-sm btn-ghost ${editor.isActive('link') ? 'btn-active' : ''}`}
            title="링크"
          >
            🔗
          </button>

          {/* 이미지 */}
          <button
            type="button"
            onClick={addImage}
            className="btn btn-sm btn-ghost"
            title="이미지"
          >
            🖼️
          </button>

          <div className="divider divider-horizontal mx-1" />

          {/* 실행 취소 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="btn btn-sm btn-ghost"
            title="실행 취소"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="btn btn-sm btn-ghost"
            title="다시 실행"
          >
            ↷
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4"
        style={{ 
          minHeight,
          maxHeight,
          overflowY: 'auto'
        }}
      />

      {editable && (
        <div className="border-t border-base-300 px-4 py-2 text-xs text-base-content/60">
          단어 수: {editor?.storage?.characterCount?.words?.() || 0} | 
          글자 수: {editor?.storage?.characterCount?.characters?.() || 0}
        </div>
      )}
    </div>
  );
}

// 스타일링을 위한 글로벌 CSS (globals.css에 추가 필요)
export const richTextEditorStyles = `
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.ProseMirror blockquote {
  padding-left: 1rem;
  border-left: 3px solid #cbd5e0;
  margin: 1rem 0;
}

.ProseMirror code {
  background-color: #f7fafc;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-family: 'Courier New', monospace;
}

.ProseMirror pre {
  background-color: #1a202c;
  color: #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
}

.ProseMirror mark {
  background-color: #fef08a;
  border-radius: 0.125rem;
  padding: 0.125rem 0.25rem;
}

.ProseMirror ul, .ProseMirror ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.ProseMirror li {
  margin: 0.25rem 0;
}

.ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.ProseMirror h1 {
  font-size: 1.875rem;
  font-weight: 700;
}

.ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.ProseMirror h3 {
  font-size: 1.25rem;
  font-weight: 600;
}
`;
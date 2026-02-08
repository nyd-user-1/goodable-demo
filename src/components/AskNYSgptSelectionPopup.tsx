import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface AskNYSgptSelectionPopupProps {
  onAsk: (selectedText: string) => void;
}

export function AskNYSgptSelectionPopup({ onAsk }: AskNYSgptSelectionPopupProps) {
  const [popup, setPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });

  const updateSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (selectedText.length > 0 && selection && selection.rangeCount > 0) {
      // Check if selection is inside an input, textarea, or contenteditable
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;

      const isInEditable = (node: Node | null): boolean => {
        if (!node) return false;
        const element = node.nodeType === Node.ELEMENT_NODE
          ? node as Element
          : node.parentElement;
        if (!element) return false;

        const tagName = element.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') return true;
        if (element.getAttribute('contenteditable') === 'true') return true;

        // Check parents
        const parent = element.parentElement;
        if (parent) {
          const parentTag = parent.tagName?.toLowerCase();
          if (parentTag === 'input' || parentTag === 'textarea') return true;
          if (parent.getAttribute('contenteditable') === 'true') return true;
        }

        return false;
      };

      if (isInEditable(anchorNode) || isInEditable(focusNode)) {
        setPopup(prev => ({ ...prev, visible: false }));
        return;
      }

      const range = selection.getRangeAt(0);
      // Use getClientRects for more accurate positioning, fallback to getBoundingClientRect
      const rects = range.getClientRects();
      const rect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        setPopup(prev => ({ ...prev, visible: false }));
        return;
      }

      setPopup({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text: selectedText,
      });
    } else {
      setPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    const handleSelectionEvent = () => {
      // Use requestAnimationFrame to let browser finalize selection (triple-click safe)
      requestAnimationFrame(() => {
        updateSelection();
      });
    };

    // Listen for selection events
    document.addEventListener('mouseup', handleSelectionEvent);
    document.addEventListener('keyup', handleSelectionEvent);
    document.addEventListener('selectionchange', handleSelectionEvent);

    return () => {
      document.removeEventListener('mouseup', handleSelectionEvent);
      document.removeEventListener('keyup', handleSelectionEvent);
      document.removeEventListener('selectionchange', handleSelectionEvent);
    };
  }, [updateSelection]);

  const handleAskClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (popup.text) {
      onAsk(popup.text);
      setPopup(prev => ({ ...prev, visible: false }));
    }
  };

  if (!popup.visible) return null;

  return createPortal(
    <div
      className="fixed z-[9999] transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto"
      style={{
        left: popup.x,
        top: popup.y,
      }}
    >
      <button
        onMouseDown={handleAskClick}
        tabIndex={-1}
        className="flex items-center gap-2 px-3 py-2 bg-white text-foreground rounded-full shadow-md border border-border/50 hover:bg-gray-100 transition-colors text-sm font-normal cursor-pointer select-none"
      >
        <span className="text-base">❤️</span>
        Ask NYSgpt
      </button>
    </div>,
    document.body
  );
}

export { AskNYSgptSelectionPopup };

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

function LightboxModal({ attachment, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const isImage = attachment.contentType?.startsWith("image/");

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && hasPrev) onPrev();
    if (e.key === "ArrowRight" && hasNext) onNext();
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="relative bg-white rounded-2xl shadow-lg max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate min-w-0" title={attachment.filename}>{attachment.filename}</span>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-accent hover:underline no-underline"
            >
              Open
            </a>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2">
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 min-h-[300px] min-w-[400px] overflow-auto">
          {isImage ? (
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="max-w-full max-h-[75vh] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <span className="text-5xl">📄</span>
              <span className="text-sm">{attachment.filename}</span>
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-accent hover:underline no-underline mt-1"
              >
                Download file
              </a>
            </div>
          )}
        </div>

        {(hasPrev || hasNext) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttachmentStrip({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400 mr-1">Attachments</span>
        {attachments.map((att, i) => {
          const isImage = att.contentType?.startsWith("image/");
          return (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              title={att.filename}
              className="relative w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-gray-400 transition cursor-pointer shrink-0"
            >
              {isImage ? (
                <img src={att.url} alt={att.filename} className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-sm">📄</span>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && createPortal(
        <LightboxModal
          attachment={attachments[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => i - 1)}
          onNext={() => setLightboxIndex((i) => i + 1)}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < attachments.length - 1}
        />,
        document.body
      )}
    </>
  );
}

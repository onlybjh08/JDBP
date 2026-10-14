import React, { useState } from 'react';
import { ApprovalDraft } from '../../types';

interface ApprovalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ApprovalDraft;
  onSave: (updated: Partial<ApprovalDraft>) => void;
}

export const ApprovalEditModal: React.FC<ApprovalEditModalProps> = ({
  isOpen,
  onClose,
  draft,
  onSave,
}) => {
  const [title, setTitle] = useState(draft.title);
  const [reason, setReason] = useState(draft.reason);
  const [finalRule, setFinalRule] = useState(draft.finalRule);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      reason,
      finalRule,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="font-extrabold text-white text-base">품의서 내용 직접 수정</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">품의 건명 (문서 제목)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">1. 변경 사유 (배경 및 목적)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">2. 최종 변경 심사 규칙 (Rule Formula)</label>
            <textarea
              rows={2}
              value={finalRule}
              onChange={(e) => setFinalRule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-blue-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            💡 <span className="text-slate-300 font-semibold">알림:</span> 수정한 내용은 전자결재 문서와 감사 로그에 실시간 반영되며, 수정 이력은 전자문서 결재선에 영구 기록됩니다.
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg shadow-lg shadow-blue-900/50 transition-colors"
            >
              수정 내용 저장 및 문서 갱신
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

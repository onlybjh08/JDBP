import React, { useState } from 'react';
import { DiscussionThreadItem } from '../../types';

interface DiscussionThreadProps {
  threads: DiscussionThreadItem[];
  onAddComment: (comment: {
    department: string;
    userName: string;
    userRole: string;
    message: string;
    queryType: 'filter_change' | 'drill_down' | 'agreement';
  }) => void;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({ threads, onAddComment }) => {
  const [department, setDepartment] = useState<string>('영업추진부');
  const [userName, setUserName] = useState<string>('김철수 팀장');
  const [message, setMessage] = useState<string>('');
  const [queryType, setQueryType] = useState<'filter_change' | 'drill_down' | 'agreement'>('filter_change');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    let role = '팀장';
    if (department === '상품개발부') role = '수석매니저';
    if (department === '리스크관리부') role = '부장';

    onAddComment({
      department,
      userName,
      userRole: role,
      message,
      queryType,
    });
    setMessage('');
  };

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case '영업추진부':
        return 'border-amber-700/60 bg-amber-950/40 text-amber-300';
      case '상품개발부':
        return 'border-blue-700/60 bg-blue-950/40 text-blue-300';
      case '리스크관리부':
        return 'border-purple-700/60 bg-purple-950/40 text-purple-300';
      case '젭대리 AI 엔진':
        return 'border-emerald-600/70 bg-emerald-950/50 text-emerald-300';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>부서간 실시간 협의 피드 (Cross-Dept Dialogue)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            영업추진부, 상품개발부, 리스크관리부 간의 실시간 조율 로그
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          총 {threads.length}건 논의
        </span>
      </div>

      {/* Message List */}
      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 flex-1">
        {threads.map((item) => {
          const isAI = item.department.includes('AI');
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all text-xs ${
                isAI
                  ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getDeptColor(
                      item.department
                    )}`}
                  >
                    {item.department}
                  </span>
                  <span className="font-bold text-slate-200">
                    {item.userName}
                  </span>
                  <span className="text-[10px] text-slate-400">({item.userRole})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans mt-1 whitespace-pre-line">
                {item.message}
              </p>

              {item.appliedChangeSummary && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-blue-400 font-medium">
                  <span className="text-blue-500 font-bold">↳ 반영된 분석:</span>
                  <span>{item.appliedChangeSummary}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">발언 부서</label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (e.target.value === '영업추진부') setUserName('김철수 팀장');
                if (e.target.value === '상품개발부') setUserName('박지영 수석');
                if (e.target.value === '리스크관리부') setUserName('이정민 부장');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="영업추진부">영업추진부 (김철수 팀장)</option>
              <option value="상품개발부">상품개발부 (박지영 수석)</option>
              <option value="리스크관리부">리스크관리부 (이정민 부장)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">질의 / 의견 유형</label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="filter_change">조건 변경 요청 (filter_change)</option>
              <option value="drill_down">심층 분석 질의 (drill_down)</option>
              <option value="agreement">부서 합의 코멘트 (agreement)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="부서간 협의 의견 또는 시뮬레이션 요청을 입력하세요..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-md"
          >
            발언 등록
          </button>
        </div>
      </form>
    </div>
  );
};

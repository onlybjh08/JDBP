import React from 'react';

export type TabType = 'discovery' | 'collaboration' | 'approval' | 'dictionary';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAgreed: boolean;
  isSubmitted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isAgreed,
  isSubmitted,
}) => {
  return (
    <header className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white font-black text-xl tracking-tighter">
              JB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  젭대리 (JB대리)
                </span>
                <span className="text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded-full">
                  Enterprise AI Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI 전략 탐색 및 부서간 협의·품의 통합 플랫폼
              </p>
            </div>
          </div>

          {/* 4-Tab Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {/* Tab 1: 전략 탐색 */}
            <button
              type="button"
              onClick={() => onTabChange('discovery')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'discovery'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>전략 탐색</span>
            </button>

            {/* Tab 2: 부서 협의 워크스페이스 */}
            <button
              type="button"
              onClick={() => onTabChange('collaboration')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                currentTab === 'collaboration'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>부서 협의 워크스페이스</span>
              {isAgreed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5"></span>
              )}
            </button>

            {/* Tab 3: 품의서 및 결재 */}
            <button
              type="button"
              onClick={() => onTabChange('approval')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                currentTab === 'approval'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>품의서 및 결재</span>
              {isSubmitted ? (
                <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700 px-1 rounded ml-1 font-mono">
                  상신완료
                </span>
              ) : isAgreed ? (
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1 rounded ml-1 font-mono animate-pulse">
                  작성가능
                </span>
              ) : null}
            </button>

            {/* Tab 4: 변수 사전 */}
            <button
              type="button"
              onClick={() => onTabChange('dictionary')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'dictionary'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>변수 사전</span>
            </button>
          </nav>

          {/* Right User Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-white block">김대리 (리스크관리부)</span>
              <span className="text-[10px] text-slate-400">심사전략기획팀 | 기안자</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

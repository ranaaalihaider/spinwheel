import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full border-t border-[#C4B5FD]/10 bg-[#090714]/80 backdrop-blur-md py-4 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A9A3BE]">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-white">AWS Student Builder Group</span>
          <span>•</span>
          <span>COMSATS University Islamabad</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#C4B5FD]/80">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>
            Cryptographically Fair Selection (<code className="font-mono">crypto.getRandomValues</code>) • Privacy-Protected Draw
          </span>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Brain, CornerDownLeft } from 'lucide-react';

interface QuickCaptureModalProps {
  onClose: () => void;
  onCapture: (text: string) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ onClose, onCapture }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on Escape
    const handleEsc = (e: KeyboardEvent) => {
        if(e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
        onCapture(text.trim());
        setText('');
        // Optional: Close after capture or keep open for multiple
        // onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-60 flex items-start justify-center pt-20 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="bg-indigo-600 p-1 h-1"></div>
        <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quick Capture</h3>
            </div>
            <div className="relative">
                <input 
                    ref={inputRef}
                    className="w-full text-lg p-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Unload your mind..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-gray-200 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                    <CornerDownLeft className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                <span>Enter to save. Esc to close.</span>
                <button type="button" onClick={onClose} className="hover:text-gray-600">Close</button>
            </div>
        </form>
      </div>
    </div>
  );
};

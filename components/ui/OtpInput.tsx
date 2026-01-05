import React, { useRef, useState, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length) onComplete(combinedOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.setSelectionRange(1, 1);
    if (index > 0 && !otp[index - 1]) {
        inputRefs.current[otp.indexOf("")]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
    
    if (pastedData.every(char => !isNaN(Number(char)))) {
        const newOtp = [...otp];
        pastedData.forEach((val, i) => {
            if (i < length) newOtp[i] = val;
        });
        setOtp(newOtp);
        
        const combinedOtp = newOtp.join('');
        if (combinedOtp.length === length) onComplete(combinedOtp);
        
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center my-6">
      {otp.map((value, index) => (
        <div key={index} className="relative group">
            {/* Input Field */}
            <input
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="text"
              value={value}
              onChange={(e) => handleChange(index, e)}
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`
                w-10 h-14 md:w-12 md:h-16 
                text-center font-mono text-xl md:text-2xl font-bold 
                bg-zinc-900/50 backdrop-blur-sm 
                border rounded-md
                text-white 
                outline-none transition-all duration-200 
                caret-red-500 selection:bg-red-500/30
                ${value 
                    ? 'border-white/40 shadow-[0_0_10px_-2px_rgba(255,255,255,0.1)]' // Filled State
                    : 'border-white/10 hover:border-white/20' // Empty State
                }
                focus:border-red-500 focus:shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] focus:bg-zinc-900
                focus:scale-105 z-0 focus:z-10
              `}
              maxLength={1}
            />
            
            {(value || document.activeElement === inputRefs.current[index]) && (
                <>
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-500/50 rounded-tr-sm pointer-events-none transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-red-500/50 rounded-bl-sm pointer-events-none transition-opacity duration-300" />
                </>
            )}
        </div>
      ))}
    </div>
  );
};

export default OtpInput;
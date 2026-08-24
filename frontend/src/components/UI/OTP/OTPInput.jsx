import React, { useRef, useEffect } from 'react';
import './OTPInput.css';
import { useTranslation } from 'react-i18next';

const OTPInput = ({ otp, setOtp, onComplete, disabled = false }) => {
  const { t } = useTranslation();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
      
      // Auto-submit when complete (but ensure at least 4 digits like mobile)
      if (index === 5 && value) {
        const otpString = newOtp.join('');
        if (otpString.length >= 4) {
          onComplete(otpString);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only process if pasted data contains 4-6 digits (mobile app accepts 4+ digits)
    if (/^\d{4,6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, idx) => {
        if (idx < 6) {
          newOtp[idx] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastFilledIndex = digits.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1].focus();
      } else {
        inputRefs.current[5].focus();
      }
      
      // Auto-submit if complete (at least 4 digits)
      if (digits.length >= 4) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="otp-input-container">
      <div className="otp-input-wrapper">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="otp-input-box"
            disabled={disabled}
            autoComplete="one-time-code"
          />
        ))}
      </div>
    </div>
  );
};

export default OTPInput;

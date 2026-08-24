import React, { useState, useEffect } from 'react';
import './ResendOTPTimer.css';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

const ResendOTPTimer = ({ onResend, initialTimer = 60 }) => {
  const { t } = useTranslation();
  const [timer, setTimer] = useState(initialTimer);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendClick = async () => {
    if (!canResend || loading) return;
    
    setLoading(true);
    
    try {
      await onResend();
      // Reset timer after successful resend
      setTimer(initialTimer);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="resend-otp-container">
      <span className="resend-text">
        {t("Didn't receive OTP?")}
      </span>
      
      {!canResend ? (
        <span className="timer-text">
          {t("Resend in")} <strong>{formatTime(timer)}</strong>
        </span>
      ) : (
        <button
          className="resend-button"
          onClick={handleResendClick}
          disabled={loading || !canResend}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {t("Sending...")}
            </>
          ) : (
            t("Resend OTP")
          )}
        </button>
      )}
    </div>
  );
};

export default ResendOTPTimer;

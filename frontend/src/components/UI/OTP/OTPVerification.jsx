import React, { useState } from 'react';
import OTPInput from './OTPInput';
import ResendOTPTimer from './ResendOTPTimer';
import './OTPVerification.css';
import { useTranslation } from 'react-i18next';
import { Spinner, Alert } from 'react-bootstrap';
import { notifyError, notifySuccess } from '../../../SharedComponent/notify';
import { simplePostCall } from '../../../config.js/SetUp';
import configWeb from '../../../config.js/configWeb';

const OTPVerification = ({ 
  phoneNumber, 
  phoneCode,
  email, // Added email prop
  verificationType = 'registration', // 'registration' or 'reset_password'
  onVerifySuccess,
  onClose,
  showPhoneNumber = true,
  autoSend = true
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(autoSend);

  // Format phone number for display (e.g., +971*****4567)
  const formatPhoneNumber = (code, number) => {
    if (!code || !number) return '';
    const maskedNumber = number.length > 4 
      ? `${number.slice(0, 2)}*****${number.slice(-4)}`
      : number;
    return `+${code}${maskedNumber}`;
  };

  const sendOTP = async () => {
    // OTP is already sent during registration, no need to send again
    setOtpSent(true);
    return true;
  };

  const verifyOTP = async (otpValue) => {
    setLoading(true);
    setError('');

    try {
      const body = {
        email: email, // Use the email passed from parent (tempEmail)
        register_otp: otpValue,
      };

      const response = await simplePostCall(configWeb.POST_REGISTER_OTP, JSON.stringify(body));
      
      if (!response?.error) {
        notifySuccess(t('OTP verified successfully'));
        if (onVerifySuccess) {
          onVerifySuccess(response);
        }
      } else {
        const errorMsg = Array.isArray(response?.message) 
          ? response.message[0] 
          : response.message || t('Invalid OTP');
        notifyError(errorMsg);
        setError(errorMsg);
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      notifyError(t('Something went wrong. Please try again.'));
      setError(t('Something went wrong. Please try again.'));
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError('');
    
    try {
      // For resending OTP during registration, we use the forgot password endpoint
      const body = {
        email: email // Use the tempEmail passed from parent
      };

      const response = await simplePostCall(configWeb.POST_FORGOT_PASSWORD, JSON.stringify(body));
      
      if (!response?.error) {
        notifySuccess(t('OTP resent successfully'));
        setOtp(['', '', '', '', '', '']);
      } else {
        const errorMsg = Array.isArray(response?.message) 
          ? response.message[0] 
          : response.message || t('Failed to resend OTP');
        notifyError(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      notifyError(t('Something went wrong. Please try again.'));
      setError(t('Something went wrong. Please try again.'));
    }
  };

  // Send OTP on component mount if autoSend is true
  React.useEffect(() => {
    if (autoSend && !otpSent) {
      sendOTP();
    }
  }, []);

  return (
    <div className="otp-verification-container">
      <div className="otp-header">
        <h4 className="otp-title">{t('Enter Verification Code')}</h4>
        {showPhoneNumber && (
          <p className="otp-subtitle">
            {t('We have sent a verification code to')} <strong>{formatPhoneNumber(phoneCode, phoneNumber)}</strong>
          </p>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="otp-error-alert">
          {error}
        </Alert>
      )}

      <OTPInput 
        otp={otp}
        setOtp={setOtp}
        onComplete={verifyOTP}
        disabled={loading}
      />

      <ResendOTPTimer 
        onResend={resendOTP}
        initialTimer={60}
      />

      {loading && (
        <div className="otp-loading-overlay">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">{t('Verifying...')}</span>
        </div>
      )}

      {onClose && (
        <button 
          className="otp-close-button"
          onClick={onClose}
          disabled={loading}
        >
          {t('Cancel')}
        </button>
      )}
    </div>
  );
};

export default OTPVerification;

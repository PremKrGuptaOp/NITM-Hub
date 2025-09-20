import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOTP, loading } = useAuth();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    const success = await verifyOTP(otpString);
    if (success) {
      toast.success('Email verified successfully!');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResend = () => {
    setTimer(60);
    toast.success('OTP sent again!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Verify Your Email</h2>
      <p className="text-gray-600 text-center mb-6">
        We've sent a verification code to<br />
        <span className="font-semibold">{email}</span>
      </p>

      <div className="flex justify-center space-x-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputs.current[index] = el}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Verifying...' : 'Verify Email'}
      </motion.button>

      <div className="text-center">
        <p className="text-gray-600 mb-2">Didn't receive the code?</p>
        {timer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in {timer}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Resend OTP
          </button>
        )}
      </div>
    </motion.div>
  );
};
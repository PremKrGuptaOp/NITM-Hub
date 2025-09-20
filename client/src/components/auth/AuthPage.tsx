import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { OTPVerification } from './OTPVerification';
// No longer need Heart or GraduationCap
import { Heart, GraduationCap } from 'lucide-react';

type AuthStep = 'login' | 'signup' | 'otp';

export const AuthPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');

  const handleSignupSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep('otp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* The old icons are replaced with the new logo image tag. */}
          <div className="flex items-center justify-center mb-4">
            <img src="/logo_nitm.png" alt="NITM Hub Logo" className="h-20 w-20" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NITM Hub</h1>
          <p className="text-blue-100">Connect • Learn • Grow</p>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-6"
        >
          <AnimatePresence mode="wait">
            {currentStep === 'login' && (
              <LoginForm
                key="login"
                onSwitchToSignup={() => setCurrentStep('signup')}
              />
            )}
            {currentStep === 'signup' && (
              <SignupForm
                key="signup"
                onSwitchToLogin={() => setCurrentStep('login')}
                onSignupSuccess={handleSignupSuccess}
              />
            )}
            {currentStep === 'otp' && (
              <OTPVerification
                key="otp"
                email={email}
                onBack={() => setCurrentStep('signup')}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-blue-100 text-sm mt-6"
        >
          For NIT Meghalaya students only
        </motion.p>
      </div>
    </div>
  );
};
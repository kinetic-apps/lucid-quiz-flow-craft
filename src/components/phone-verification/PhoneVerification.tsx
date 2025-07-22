import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';

interface PhoneVerificationProps {
  userId: string;
  onComplete: (phoneNumber: string) => void;
}

// Common country codes with flags
const COUNTRIES = [
  { code: 'US' as CountryCode, flag: '🇺🇸', dial: '+1', name: 'United States' },
  { code: 'GB' as CountryCode, flag: '🇬🇧', dial: '+44', name: 'United Kingdom' },
  { code: 'CA' as CountryCode, flag: '🇨🇦', dial: '+1', name: 'Canada' },
  { code: 'AU' as CountryCode, flag: '🇦🇺', dial: '+61', name: 'Australia' },
  { code: 'DE' as CountryCode, flag: '🇩🇪', dial: '+49', name: 'Germany' },
  { code: 'FR' as CountryCode, flag: '🇫🇷', dial: '+33', name: 'France' },
  { code: 'ES' as CountryCode, flag: '🇪🇸', dial: '+34', name: 'Spain' },
  { code: 'IT' as CountryCode, flag: '🇮🇹', dial: '+39', name: 'Italy' },
  { code: 'NL' as CountryCode, flag: '🇳🇱', dial: '+31', name: 'Netherlands' },
  { code: 'IN' as CountryCode, flag: '🇮🇳', dial: '+91', name: 'India' },
];

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  onComplete
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on US/CA phone number pattern
    if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleSendOTP = async () => {
    try {
      // Remove formatting for validation
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const fullNumber = `${selectedCountry.dial}${cleanedNumber}`;
      
      if (!isValidPhoneNumber(fullNumber)) {
        setError('Please enter a valid phone number');
        return;
      }

      setLoading(true);
      setError('');

      // First, check if we have a current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, we need to create one for the user
        // This can happen when payment completes before user auth
        console.log('No auth session found, creating one for phone verification');
      }
      
      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullNumber,
      });

      if (error) throw error;

      // Move to OTP verification step
      onComplete(fullNumber);
    } catch (err: any) {
      // Check if it's a Supabase auth configuration error
      if (err?.message?.includes('Unsupported phone provider') || err?.message?.includes('SMS')) {
        setError('SMS verification is not configured. Please contact support.');
        console.error('SMS provider not configured in Supabase:', err);
      } else {
        setError('Failed to send verification code. Please try again.');
        console.error('OTP send error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Verify Your Phone Number
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Enter your phone number to access your subscription in the Lucid app
        </p>
      </div>

      {/* Phone Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {/* Country Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-gray-700">{selectedCountry.dial}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Country Dropdown */}
            {showCountryPicker && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                      setPhoneNumber('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-gray-700">{country.name}</span>
                    <span className="text-gray-500 ml-auto">{country.dial}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={selectedCountry.code === 'US' ? '(555) 123-4567' : 'Phone number'}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Continue Button */}
        <button
          onClick={handleSendOTP}
          disabled={loading || !phoneNumber}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: '#8B7CF6' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Sending...
            </span>
          ) : (
            'Send Verification Code'
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to receive SMS messages. Message and data rates may apply.
        </p>
      </div>
    </motion.div>
  );
};
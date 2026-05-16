import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KycStepper from "../components/kyc/KycStepper";
import PanForm from "../components/kyc/PanForm";
import BankForm from "../components/kyc/BankForm";
import KycResultCard from "../components/kyc/KycResultCard";
import RoutePath from "../core/constants/routes.constant";

const KycPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get redirect path from location state (if user came from Earnings page)
  const redirectPath = location.state?.from || null;

  // Determine KYC type from route
  const kycType = location.pathname.includes('/bank') ? 'BANK' : 'PAN';
  const FormComponent = kycType === 'BANK' ? BankForm : PanForm;
  const title = kycType === 'BANK' ? 'Bank Account Verification' : 'Complete Your KYC';
  const subtitle = kycType === 'BANK' 
    ? 'Add your bank details to receive withdrawal payments' 
    : 'Verify your identity to unlock all features and start your journey';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${kycType === 'BANK' ? 'bg-green-600' : 'bg-blue-600'}`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {kycType === 'BANK' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              )}
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {subtitle}
          </p>
        </div>

        {/* Stepper - only show for PAN KYC */}
        {kycType === 'PAN' && <KycStepper currentStep={step} />}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Verifying your details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold text-sm">Verification Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Step 0: Form (PAN or Bank) */}
        {step === 0 && (
          <div style={{ display: loading ? 'none' : 'block' }}>
            <FormComponent
              onSuccess={(res) => {
                setData(res);
                setStep(1);
              }}
              setLoading={setLoading}
              setError={setError}
            />
          </div>
        )}

        {/* Step 1: Result + Continue */}
        {step === 1 && data && !loading && (
          <div className="space-y-6">
            <KycResultCard data={data} type={kycType} />
            
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                KYC Verified Successfully!
              </h3>
              <p className="text-green-600 text-sm">
                Your identity has been verified. You're all set!
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => {
                // If user came from Earnings page, redirect back there
                if (redirectPath) {
                  navigate(redirectPath);
                } else {
                  // Otherwise use default navigation
                  navigate(kycType === 'BANK' ? RoutePath.TRAVELLER_EARNINGS : RoutePath.TRAVELER_DASHBOARD);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {redirectPath ? 'Back to Earnings' : (kycType === 'BANK' ? 'Go to Earnings' : 'Go to Dashboard')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="/contact" className="text-blue-600 hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default KycPage;
// components/KycStepper.jsx

const KycStepper = ({ currentStep = 0 }) => {
  const steps = [
    { id: 0, label: "PAN Verification", icon: "📄" },
    { id: 1, label: "Verification Complete", icon: "✓" }
  ];

  return (
    <div className="w-full mb-10">
      {/* Stepper Container */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                  transition-all duration-300 shadow-md
                  ${currentStep >= step.id
                    ? 'bg-blue-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span
                className={`
                  mt-2 text-xs md:text-sm font-medium text-center max-w-[100px]
                  ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-16 md:w-32 h-1 mx-2 relative">
                <div className="absolute inset-0 bg-gray-200 rounded"></div>
                <div
                  className={`
                    absolute inset-0 bg-blue-600 rounded transition-all duration-500
                    ${currentStep > step.id ? 'w-full' : 'w-0'}
                  `}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Already completed text */}
      {currentStep === 0 && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already completed KYC?{" "}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline transition-colors"
            >
              Go to Login
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default KycStepper;
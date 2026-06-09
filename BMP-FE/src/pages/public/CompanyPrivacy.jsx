
import { FileText } from "lucide-react";
import { companyPrivacyPolicyData } from "../datafiles/PrivacyPolicyData"

export default function CompanyPrivacy() {
  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">
        
        {/* Header */}
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            Company Privacy Policy
          </h1>

          <p className="text-sm font-medium opacity-90 mt-2">
            Your privacy is important to us. This policy explains how we collect,
            use, protect, and manage your personal information.
          </p>
        </header>

        {/* Body */}
        <section className="px-6 sm:px-8 py-8 space-y-8 text-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
            {companyPrivacyPolicyData.pageTitle}
          </h2>
          {companyPrivacyPolicyData.sections.map((item, index) => {
            const Icon = item.icon;
            return (
              <Section
                key={index}
                icon={ <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
    <Icon size={22} className="text-white" />
  </div>}
                title={item.title}
                text={item.text}
                list={item.list}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Section({ icon, title, text, list }) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200">
      <div className="shrink-0 mt-1">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {text && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {text}
          </p>
        )}

        {list && (
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
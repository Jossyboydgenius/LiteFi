import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/images/logo.png" 
                alt="LiteFi Logo" 
                width={80}
                height={24}
                // style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <Link 
              href="/login" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header with centered title and right-aligned address */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">LiteFi Limited Terms of Use</h1>
            <div className="text-gray-600 text-right text-sm">
              <p><strong>LiteFi Limited</strong></p>
              <p>9A, Hospital Road, Gbagada, Lagos</p>
              <p>📞 07039439340, 07081040689</p>
              <p>🌐 <a href="http://litefi.ng" className="text-red-600 hover:underline">LiteFi.ng</a></p>
              <p>✉️ support@litefi.ng</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction and Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to LiteFi Limited. These Terms govern your access to and use of LiteFi Limited's digital lending, credit facilities, and related financial services ("Services") in Nigeria.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using our Services, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Do not use our Services if you disagree with any part of these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                LiteFi is licensed under the Lagos State Money Lenders Law. We may revise these Terms anytime, and updates are effective immediately upon posting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Our Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LiteFi provides lending and credit services, including:
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Personal Loans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For emergencies, education, medical expenses, etc., based on income and creditworthiness.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.2 Business / Corporate Loans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For working capital, asset acquisition, etc., based on business financial health.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.3 Auto Loan for Salary Earner</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For purchasing vehicles, based on salaried employment.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.4 Auto Loan for Corporate</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For companies needing vehicles for operations.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.5 Dealer Finance Loans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For vehicle dealerships to fund inventory or operations.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.6 On-Lending Arrangements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                LiteFi may act as an intermediary for third-party licensed Partner Banks.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Each loan will have a specific Loan Agreement outlining terms, interest, fees, and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Protection and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect, process, and protect your personal data in accordance with our Privacy Policy and the Nigeria Data Protection Act 2023.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our Services, you consent to our data processing practices as outlined in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Prohibited Uses and User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Provide false or misleading information</li>
                <li>Use our Services for illegal activities</li>
                <li>Attempt to circumvent our security measures</li>
                <li>Interfere with our systems or other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, trademarks, and intellectual property on our platform belong to LiteFi Limited or our licensors.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability and Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Services are provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability is limited to the amount of fees you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold LiteFi Limited harmless from any claims, damages, or expenses arising from your use of our Services or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account at any time for violation of these Terms or other reasons.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may close your account at any time, subject to outstanding obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by Nigerian law. Disputes will be resolved through arbitration in Lagos, Nigeria.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may also file complaints with relevant regulatory authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Amendments and Updates</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update these Terms at any time. Changes are effective immediately upon posting.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Continued use of our Services constitutes acceptance of updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found invalid, the remaining provisions will continue in full force.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy and any Loan Agreements, constitute the entire agreement between you and LiteFi Limited.
              </p>
            </section>


          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <Link 
                href="/privacy" 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/signup" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-none font-medium transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

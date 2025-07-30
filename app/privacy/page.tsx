import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">LiteFi Limited Privacy Policy</h1>
            <div className="text-gray-600 mb-8 text-right">
              <p><strong>LiteFi Limited</strong></p>
              <p>9A, Hospital Road, Gbagada, Lagos</p>
              <p>📞 <a href="tel:+2348108376447" className="text-red-600 hover:underline">+234 810 837 6447</a></p>
              <p>🌐 <a href="http://litefi.ng" className="text-red-600 hover:underline">LiteFi.ng</a></p>
              <p>✉️ <a href="mailto:dpo@litefi.ng" className="text-red-600 hover:underline">dpo@litefi.ng</a></p>
              <p className="mt-4">Effective Date: January 1, 2025</p>
            </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to LiteFi Limited. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our lending and credit services. Your privacy is important to us. We are committed to safeguarding your personal information and handling it with care and transparency.
              </p>
              <p className="text-gray-700 mb-4">
                This policy applies to all personal data collected through our website (litefi.ng), mobile applications, physical application forms, and any other means through which you interact with LiteFi Limited. We operate in Nigeria and are committed to complying with the Nigeria Data Protection Act (NDPA) 2023, the Lagos State Money Lenders Law, and other relevant Nigerian laws and regulations. As privacy expert Daniel J. Solove noted, "Privacy is not about having something to hide. It is about having something to protect." For LiteFi, that protection underpins our operations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Scope and Application</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This policy applies to all personal data processed by LiteFi Limited, regardless of the method or location of collection and storage. This includes, but is not limited to, data relating to our past, present, and prospective clients, employees, contractors, suppliers, and any other individuals whose personal data we handle. Every member of staff, contractor, and third party working with or on behalf of LiteFi Limited must strictly adhere to the provisions of this policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The NDPA 2023, as clarified by the GAID 2025, has an extraterritorial application, meaning it protects personal data of individuals within Nigeria, those whose data has been transferred to Nigeria, or data in transit through Nigeria, and even Nigerian citizens abroad under certain conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Data Protection Principles</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LiteFi Limited upholds the core principles for processing personal data as stipulated in the NDPA 2023. These principles guide all our data handling practices:
              </p>
              <div className="ml-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Lawfulness, Fairness, and Transparency</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We process personal data lawfully, fairly, and in a transparent manner. This involves clearly identifying a valid lawful basis for processing, such as the data subject's consent, contractual necessity, legal obligation, vital interests, public task, or our legitimate interests, ensuring the data subject is fully informed. We ensure consent is freely given, specific, informed, and unambiguous, without relying on silence or inactivity.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Purpose Limitation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Personal data is collected for specified, explicit, and legitimate purposes. We do not process data in a manner incompatible with the original stated purposes. For example, personal information gathered for a service agreement will not be used for unrelated marketing without explicit and separate consent.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.3 Data Minimisation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We only collect personal data that is adequate, relevant, and limited to what is necessary for the purposes for which it is processed. Our processes are designed to avoid the collection of excessive or irrelevant data.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.4 Accuracy</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We strive to ensure personal data is accurate, complete, non-misleading, and kept up-to-date. We implement mechanisms for individuals to correct or update their information and promptly rectify or erase inaccurate data upon discovery or notification.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.5 Storage Limitation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Personal data is not retained for longer than necessary to fulfill the purposes for which it was collected or as required by law. Our data retention schedules are regularly reviewed to ensure compliance with this principle. The GAID 2025 suggests a default deletion within six months after fulfilling the original purpose if no time-bound obligation exists.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.6 Integrity and Confidentiality (Security)</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We process personal data in a manner that ensures appropriate security against unauthorised or unlawful processing and against accidental loss, destruction, or damage. This is achieved through robust technical and organisational measures, protecting data availability, confidentiality, and integrity.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.7 Accountability</h3>
                <p className="text-gray-700 leading-relaxed">
                  LiteFi Limited is responsible for demonstrating compliance with the NDPA principles. We maintain records of our data processing activities, implement data protection by design and default, and conduct Data Protection Impact Assessments (DPIAs) where processing is likely to result in a high risk to data subjects' rights and freedoms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Individual Rights (Data Subject Rights)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under the NDPA 2023, individuals have enhanced rights regarding their personal data. LiteFi Limited fully supports and facilitates the exercise of these rights:
              </p>
              
              <div className="ml-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Right to be Informed</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right to be informed about the collection and use of their personal data. Our privacy notices are designed to be clear, concise, and easily accessible, providing all required information as per NDPA Section 27.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Right of Access (Subject Access Request - SAR)</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals can request confirmation of whether their personal data is being processed, and if so, access to that data and related information about the processing purposes, categories of data, recipients, retention periods, and source. We will respond to SARs promptly, typically within one month.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.3 Right to Rectification</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right to request the correction of inaccurate or incomplete personal data. We will rectify data without undue delay upon verification.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.4 Right to Erasure (Right to be Forgotten)</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals can request the deletion or removal of their personal data where there is no compelling reason for its continued processing. This applies in specific situations, such as when data is no longer necessary for its original purpose or consent is withdrawn.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.5 Right to Restrict Processing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right to request the restriction of processing of their personal data in certain circumstances, for example, if they contest the accuracy of the data or object to its processing. When restricted, data can only be stored, not actively processed.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.6 Right to Data Portability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right to receive their personal data in a structured, commonly used, and machine-readable format and to transmit that data to another data controller without hindrance. This right applies to data processed by automated means based on consent or a contract.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.7 Right to Object</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right to object to the processing of their personal data in certain situations, including processing based on legitimate interests or for direct marketing. We will cease processing unless we can demonstrate compelling legitimate grounds that override the individual's interests, rights, and freedoms, or for the establishment, exercise, or defence of legal claims.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.8 Rights in relation to Automated Decision Making and Profiling</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals have the right not to be subject to a decision based solely on automated processing, including profiling, that produces legal effects concerning them or significantly affects them. LiteFi Limited ensures appropriate safeguards, including human intervention and the right to express one's point of view.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.9 Special Protections for Vulnerable Data Subjects</h3>
                <p className="text-gray-700 leading-relaxed">
                  The GAID 2025 introduces a regime for vulnerable data subjects (e.g., children, elderly, persons with disabilities). Where a data subject is a child or lacks legal capacity, LiteFi Limited will obtain consent from a parent or legal guardian and implement appropriate age and consent verification mechanisms, utilising available technology. All processing involving children will be consistent with Nigeria's Child Rights Act 2003.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention and Disposal</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LiteFi Limited maintains a comprehensive data retention schedule, ensuring that personal data is kept only for as long as necessary to fulfil its original purpose or to meet legal and regulatory obligations. For instance, financial records are generally retained for six years. Employee records are retained for a period consistent with labour laws. When data is no longer required, it is securely disposed of using methods appropriate to its format (e.g., cross-shredding for physical documents, secure wiping or degaussing for digital media). The GAID 2025's guidance on deleting data within six months post-purpose, where no other time-bound obligation exists, is strictly observed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Information We Collect</h2>
              <div className="ml-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">6.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect personal information that you provide directly to us, including but not limited to: name, email address, phone number, postal address, date of birth, government-issued identification numbers, financial information (bank account details, transaction history), employment information, and any other information you choose to provide.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">6.2 Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We automatically collect certain information when you use our services, including: device information (IP address, browser type, operating system), usage data (pages visited, time spent, features used), location data (with your consent), and cookies and similar tracking technologies.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">6.3 Information from Third Parties</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may receive information about you from third parties, including: financial institutions and payment processors, credit bureaus and verification services, marketing partners, and publicly available sources.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Providing and maintaining our lending and credit services</li>
                <li>Processing loan applications and managing accounts</li>
                <li>Verifying your identity and preventing fraud</li>
                <li>Communicating with you about our services</li>
                <li>Improving our services and developing new features</li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Marketing our services (with your consent where required)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Legal Basis for Processing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We process your personal information based on the following legal grounds:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Consent:</strong> Where you have given clear consent for specific processing activities</li>
                <li><strong>Contract:</strong> Where processing is necessary for the performance of a contract with you</li>
                <li><strong>Legal obligation:</strong> Where we must process your data to comply with legal requirements</li>
                <li><strong>Legitimate interests:</strong> Where processing is necessary for our legitimate business interests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Data Protection Impact Assessments</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We conduct Data Protection Impact Assessments (DPIAs) for processing activities that are likely to result in high risk to individuals' rights and freedoms. This helps us identify and mitigate privacy risks before they occur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We work with carefully selected third-party service providers to deliver our services. These providers are contractually bound to protect your information and use it only for the purposes we specify. We conduct due diligence on all third parties and ensure they maintain appropriate security standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Cross-Border Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If we transfer your personal data outside Nigeria, we ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Adequacy decisions by the Nigeria Data Protection Commission</li>
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Binding corporate rules for intra-group transfers</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LiteFi Limited implements comprehensive security measures to protect personal data, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Encryption of data in transit and at rest using industry-standard protocols</li>
                <li>Multi-factor authentication and role-based access controls</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Secure development practices and code reviews</li>
                <li>Employee background checks and security training</li>
                <li>Incident response and business continuity plans</li>
                <li>Physical security measures for data centers and offices</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We continuously monitor and update our security measures to address emerging threats and maintain the confidentiality, integrity, and availability of personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Data Breach Response</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a data breach, LiteFi Limited follows a comprehensive incident response plan that includes immediate containment, assessment of the breach scope, notification to the Nigeria Data Protection Commission within 72 hours (where required), and communication with affected individuals without undue delay where there is high risk to their rights and freedoms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Training and Awareness</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All LiteFi Limited employees receive mandatory data protection training upon joining and regular refresher training thereafter. This includes understanding of data protection principles, proper handling procedures, incident reporting, and awareness of emerging threats and regulatory changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification (if you have provided your email address)</li>
                <li>Providing notice through our mobile application or services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy, to exercise your data protection rights, or to contact our Data Protection Officer, please use the following contact information:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">📧 <strong>Email:</strong> <a href="mailto:dpo@litefi.ng" className="text-red-600 hover:text-red-700 underline">dpo@litefi.ng</a></p>
                <p className="text-gray-700 mb-2">📍 <strong>Address:</strong> 9A, Hospital Road, Gbagada, Lagos, Nigeria</p>
                <p className="text-gray-700 mb-2">📞 <strong>Phone:</strong> <a href="tel:+2348108376447" className="text-red-600 hover:text-red-700 underline">+234 810 837 6447</a></p>
                <p className="text-gray-700">🌐 <strong>Website:</strong> <a href="https://www.litefi.ng" className="text-red-600 hover:text-red-700 underline">www.litefi.ng</a></p>
              </div>
              <p className="text-gray-700 mt-4 text-sm">
                <strong>Effective Date:</strong> January 1, 2025<br/>
                <strong>Last Updated:</strong> January 1, 2025
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <Link 
                href="/terms" 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Terms of Use
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

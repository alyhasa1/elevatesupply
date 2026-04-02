import SEO, { buildBreadcrumbSchema } from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="bg-[#faf9f8] py-8 sm:py-12">
      <SEO
        title="Privacy Policy"
        description="Learn how Elevate Supply collects, uses, and protects your personal data. Privacy policy for elevatesupply.uk, operated by Elevate Commerce Pvt Ltd."
        canonical="/privacy"
        jsonLd={buildBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ])}
      />
      <div className="container max-w-4xl mx-auto px-4 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="prose prose-stone max-w-none">
          <h1 className="text-3xl font-bold mb-8">PRIVACY POLICY</h1>
          
          <p><strong>Effective date:</strong> 31 March 2026<br/>
          <strong>Website:</strong> elevatesupply.uk<br/>
          <strong>Controller:</strong> Elevate Commerce Pvt Ltd<br/>
          <strong>Contact email:</strong> support@elevatesupply.uk<br/>
          <strong>Contact number:</strong> +44 7438 615194</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>This Privacy Policy explains how Elevate Commerce Pvt Ltd, trading as Elevate Supply, collects, uses, stores, shares, and protects personal data when you use elevatesupply.uk, contact us, create an account, place an order, sign up for marketing, or otherwise interact with us.</p>
          <p>Under UK data protection law, we are the data controller for the personal data described in this policy.</p>
          <p>UK privacy notices should explain key details such as identity, purposes, lawful basis, recipients, retention, rights, and complaint routes, and that is what this policy is designed to do.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Personal Data We Collect</h2>
          <p>Depending on how you interact with us, we may collect the following categories of personal data:</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2">2.1 Identity and contact data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>full name;</li>
            <li>billing address;</li>
            <li>delivery address;</li>
            <li>email address;</li>
            <li>telephone number.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Account data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>username;</li>
            <li>encrypted password or login credentials;</li>
            <li>account preferences;</li>
            <li>order history.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.3 Transaction data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>products purchased;</li>
            <li>order value;</li>
            <li>payment status;</li>
            <li>refund history;</li>
            <li>delivery information.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.4 Technical and usage data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address;</li>
            <li>browser type and version;</li>
            <li>device information;</li>
            <li>time zone setting;</li>
            <li>pages visited;</li>
            <li>referring website;</li>
            <li>clickstream and session data.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.5 Marketing and communications data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>email subscription preferences;</li>
            <li>consent choices;</li>
            <li>messages sent to us;</li>
            <li>customer service correspondence.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.6 Fraud prevention and verification data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>device signals;</li>
            <li>transaction risk indicators;</li>
            <li>delivery validation information;</li>
            <li>information relevant to chargeback or fraud investigations.</li>
          </ul>
          <p className="mt-4">We do not intentionally collect special category personal data unless it is voluntarily provided in support communications and genuinely needed to resolve an issue.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Collect Personal Data</h2>
          <p>We collect personal data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>directly from you when you place an order, contact us, or create an account;</li>
            <li>automatically through cookies and similar technologies when you use our site;</li>
            <li>from payment service providers in relation to payment status;</li>
            <li>from delivery and fulfilment partners in relation to shipment updates;</li>
            <li>from fraud prevention and security tools;</li>
            <li>from analytics and advertising platforms where used lawfully.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. How We Use Your Personal Data</h2>
          <p>We use personal data for the following purposes:</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2">4.1 To process and fulfil orders</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>taking payment;</li>
            <li>confirming your order;</li>
            <li>arranging dispatch;</li>
            <li>sharing delivery details with suppliers and couriers;</li>
            <li>handling refunds and returns.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.2 To provide customer support</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>responding to questions;</li>
            <li>resolving delivery issues;</li>
            <li>handling complaints;</li>
            <li>verifying account or order ownership.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.3 To manage your account</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>creating and maintaining login access;</li>
            <li>displaying order history;</li>
            <li>enabling saved preferences.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.4 To operate and improve our website</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>analytics;</li>
            <li>fixing bugs;</li>
            <li>improving navigation and performance;</li>
            <li>testing new features;</li>
            <li>understanding customer behaviour.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.5 To prevent fraud and protect our business</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>transaction monitoring;</li>
            <li>abuse prevention;</li>
            <li>chargeback defence;</li>
            <li>platform and account security.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.6 To send service communications</h3>
          <p>This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>order confirmations;</li>
            <li>dispatch notifications;</li>
            <li>customer service messages;</li>
            <li>important legal or policy updates.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.7 To send marketing</h3>
          <p>Where permitted by law, we may send promotional emails, offers, abandoned basket reminders, or related marketing. Where consent is required, we will only do so if you have given it. You can unsubscribe at any time.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Lawful Bases for Processing</h2>
          <p>Under UK GDPR, we must identify a lawful basis for processing personal data. Depending on the activity, we rely on one or more of the following:</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">5.1 Contract</h3>
          <p>We process data where necessary to perform a contract with you or to take steps at your request before entering into a contract, such as processing orders and arranging delivery.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">5.2 Legal obligation</h3>
          <p>We process data where necessary to comply with legal obligations, such as accounting, tax, fraud prevention, and consumer law compliance.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">5.3 Legitimate interests</h3>
          <p>We process data where necessary for our legitimate interests, provided those interests are not overridden by your rights and freedoms. This may include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>running and improving our website;</li>
            <li>fraud prevention and security;</li>
            <li>business administration;</li>
            <li>customer service;</li>
            <li>defending legal claims.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">5.4 Consent</h3>
          <p>Where required, such as certain email marketing or non-essential cookies, we rely on your consent. You can withdraw consent at any time.</p>
          <p className="mt-4">ICO guidance requires organisations to identify their lawful bases and explain rights and complaints routes in their privacy information.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Who We Share Your Data With</h2>
          <p>We may share relevant personal data with:</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.1 Suppliers and fulfilment partners</h3>
          <p>Because our business uses a dropshipping and distributed warehouse model, we may share order details necessary for sourcing, packing, and dispatching your goods.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.2 Delivery and logistics providers</h3>
          <p>Such as postal operators, courier companies, tracking platforms, and customs intermediaries.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.3 Payment providers</h3>
          <p>To process and verify payments, reduce fraud, and manage refunds or chargebacks.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.4 IT, hosting, and ecommerce service providers</h3>
          <p>Such as website hosting, customer support tools, fraud tools, analytics providers, and email systems.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.5 Professional advisers and authorities</h3>
          <p>Where required, we may share data with legal advisers, accountants, insurers, regulators, law enforcement, or courts.</p>
          <p className="mt-4">We do not sell your personal data.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. International Transfers</h2>
          <p>Because some suppliers, service providers, or fulfilment partners may be based outside the UK, your data may be transferred internationally.</p>
          <p>Where we transfer personal data outside the UK, we will take steps intended to ensure an appropriate level of protection, such as using recognised contractual safeguards or relying on permitted legal mechanisms where applicable.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Payment Information</h2>
          <p>We do not usually store full payment card details ourselves. Payments are typically processed through third-party payment processors. Those providers process your payment information in accordance with their own privacy and security policies.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Data Retention</h2>
          <p>We retain personal data only for as long as reasonably necessary for the purposes described above, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>to fulfil orders and provide support;</li>
            <li>to meet legal, accounting, tax, and regulatory obligations;</li>
            <li>to resolve disputes;</li>
            <li>to enforce agreements;</li>
            <li>to prevent fraud.</li>
          </ul>
          <p className="mt-4">If we do not use a single fixed retention period for all data, we apply criteria such as the type of data, the purpose collected, legal requirements, complaint windows, and fraud risks. ICO guidance specifically requires organisations to tell people either the retention period or the criteria used to determine it.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Your Rights</h2>
          <p>Depending on the circumstances, you may have the following rights under UK data protection law:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>the right to be informed;</li>
            <li>the right of access;</li>
            <li>the right to rectification;</li>
            <li>the right to erasure;</li>
            <li>the right to restrict processing;</li>
            <li>the right to data portability;</li>
            <li>the right to object;</li>
            <li>rights relating to automated decision-making, where applicable;</li>
            <li>the right to withdraw consent at any time where consent is the lawful basis.</li>
          </ul>
          <p className="mt-4">To exercise your rights, contact support@elevatesupply.uk.</p>
          <p>You also have the right to complain to the Information Commissioner’s Office (ICO) if you believe your data has been handled unlawfully. ICO guidance says privacy notices should tell people how they can complain.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Cookies and Similar Technologies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>keep the website functioning properly;</li>
            <li>remember preferences;</li>
            <li>understand traffic and site usage;</li>
            <li>improve performance;</li>
            <li>support advertising or remarketing where permitted.</li>
          </ul>
          <p className="mt-4">Some cookies are essential to the operation of the website. Others are non-essential and should only be used where you have been given appropriate choice.</p>
          <p>You can manage cookies through your browser settings and, where implemented, through our cookie banner or preference tool.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">12. Security</h2>
          <p>We use technical and organisational measures intended to protect personal data against accidental loss, unauthorised access, misuse, alteration, and disclosure.</p>
          <p>However, no website, transmission, or storage system can be guaranteed to be completely secure. You should also take steps to protect your own account credentials.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">13. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites, apps, or services. We are not responsible for the privacy practices or content of those third parties. You should review their policies separately.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">14. Children</h2>
          <p>Our website is not intended for children, and we do not knowingly collect personal data from children without appropriate authority.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">15. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. The latest version will be posted on our website with the updated effective date.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">16. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or your personal data, contact: Elevate Commerce Pvt Ltd<br/>
          Website: elevatesupply.uk<br/>
          Email: support@elevatesupply.uk<br/>
          Phone: +44 7438 615194</p>

        </div>
      </div>
    </div>
  );
}

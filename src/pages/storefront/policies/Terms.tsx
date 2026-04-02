import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="bg-[#faf9f8] py-8 sm:py-12">
      <div className="container max-w-4xl mx-auto px-4 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="prose prose-stone max-w-none">
          <h1 className="text-3xl font-bold mb-8">TERMS AND CONDITIONS</h1>
          
          <p><strong>Effective date:</strong> 31 March 2026<br/>
          <strong>Website:</strong> elevatesupply.uk<br/>
          <strong>Business name:</strong> Elevate Supply<br/>
          <strong>Company:</strong> Elevate Commerce Pvt Ltd<br/>
          <strong>Support email:</strong> support@elevatesupply.uk<br/>
          <strong>UK sales number:</strong> +44 7438 615194</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. About these Terms</h2>
          <p>These Terms and Conditions apply to your use of elevatesupply.uk and to all orders placed through our website.</p>
          <p>By accessing our website, creating an account, or placing an order with us, you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree to these Terms, you must not use our website or place an order.</p>
          <p>These Terms are intended to comply with applicable UK consumer and ecommerce laws. Nothing in these Terms removes or limits any rights you have under law, including your statutory rights in relation to goods that are faulty, not as described, or not fit for purpose.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Who We Are</h2>
          <p>This website is operated by Elevate Commerce Pvt Ltd, trading as Elevate Supply.</p>
          <p><strong>Business contact details:</strong><br/>
          Email: support@elevatesupply.uk<br/>
          Phone: +44 7438 615194<br/>
          Website: elevatesupply.uk</p>
          <p>Registered office: [INSERT REGISTERED OFFICE ADDRESS]<br/>
          Company registration number: [INSERT COMPANY NUMBER]<br/>
          VAT number: [INSERT VAT NUMBER IF APPLICABLE]</p>
          <p>If you have any questions about these Terms, your order, or our services, please contact us using the details above.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Our Business Model</h2>
          <p>Elevate Supply operates as an online ecommerce and fulfilment platform using a dropshipping / distributed sourcing model.</p>
          <p>This means:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>products offered on our website may be sourced from one or more third-party suppliers;</li>
            <li>stock may be held in our own warehouse, a supplier warehouse, or another fulfilment facility;</li>
            <li>dispatch location may vary by product, availability, and destination;</li>
            <li>packaging, branding, and shipping carrier may differ between items or orders;</li>
            <li>orders may arrive in separate packages and at different times.</li>
          </ul>
          <p className="mt-4">By placing an order, you acknowledge that fulfilment may be handled through multiple sourcing and warehouse partners.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Eligibility to Use the Website</h2>
          <p>You may only use this website and place orders if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>you are at least 18 years old;</li>
            <li>you are legally capable of entering into a binding contract;</li>
            <li>the information you provide is accurate and complete; and</li>
            <li>you are using the website only for lawful purposes.</li>
          </ul>
          <p className="mt-4">We reserve the right to refuse service, suspend accounts, or cancel orders where we reasonably believe a user has breached these Terms, provided false information, or misused the website.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Products and Product Information</h2>
          <p>We try to ensure that all product descriptions, photographs, specifications, pricing, and availability details on our website are accurate and up to date.</p>
          <p>However:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>product colours may vary slightly because of screen displays;</li>
            <li>product packaging may vary;</li>
            <li>dimensions and weights may be approximate;</li>
            <li>supplier updates may result in small specification changes;</li>
            <li>stock availability may change without notice.</li>
          </ul>
          <p className="mt-4">We do not guarantee that every product description is entirely free from typographical, technical, or pricing errors. Where an obvious error has occurred, we reserve the right to correct it and, if necessary, cancel or refuse the affected order. If payment has already been taken, we will notify you and refund the relevant amount.</p>
          <p>Under UK consumer law, goods must be as described, of satisfactory quality, and fit for purpose. Nothing in these Terms overrides those rights.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Ordering Process</h2>
          <p>When you place an order through our website, you are making an offer to purchase the goods selected.</p>
          <p>The order process usually works as follows:</p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>you select goods and add them to your basket;</li>
            <li>you provide delivery, billing, and payment details;</li>
            <li>you review and submit your order;</li>
            <li>you receive an order confirmation email acknowledging receipt.</li>
          </ul>
          <p className="mt-4">Your order is not accepted until we confirm dispatch or otherwise expressly accept the order. An automated order confirmation does not necessarily mean that a contract has been formed.</p>
          <p>We may refuse or cancel an order for reasons including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>the product is unavailable;</li>
            <li>there is an issue with payment authorisation;</li>
            <li>there is a pricing or listing error;</li>
            <li>there are reasonable fraud prevention concerns;</li>
            <li>shipping is unavailable to the address provided;</li>
            <li>the order breaches these Terms.</li>
          </ul>
          <p className="mt-4">If we cancel an order after payment has been received, we will refund the amount paid for the cancelled goods.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Prices and Payment</h2>
          <p>All prices displayed on the website are in GBP (£) unless otherwise stated.</p>
          <p>Prices may or may not include VAT depending on how products are listed. Any applicable taxes and delivery charges will be shown during checkout before you complete your order.</p>
          <p>Payment must be made in full at the time of ordering using one of the payment methods made available on the website.</p>
          <p>We reserve the right to update prices at any time, but price changes will not affect orders already accepted.</p>
          <p>If a payment is reversed, charged back, or declined after dispatch, we reserve the right to recover the sums due and any associated costs to the extent permitted by law.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Delivery</h2>
          <p>We deliver to the locations shown on our website at checkout.</p>
          <p>Estimated processing and delivery times are provided for guidance only and are not guaranteed unless expressly stated otherwise. Delays may occur due to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>customs clearance;</li>
            <li>weather;</li>
            <li>courier delays;</li>
            <li>supplier processing delays;</li>
            <li>peak demand periods;</li>
            <li>address verification issues;</li>
            <li>other circumstances outside our reasonable control.</li>
          </ul>
          <p className="mt-4">Because of our fulfilment model:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>items from one order may be shipped separately;</li>
            <li>tracking may become available after dispatch;</li>
            <li>different items may have different delivery windows.</li>
          </ul>
          <p className="mt-4">Risk in the goods passes to you when the goods are delivered to the address you provided, except where the law says otherwise.</p>
          <p>You are responsible for ensuring that the delivery address is accurate and complete. We are not responsible for losses arising from inaccurate delivery information supplied by you.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. International Fulfilment and Import Issues</h2>
          <p>Some orders may be fulfilled from outside the United Kingdom.</p>
          <p>Where goods are shipped internationally:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>delivery times may be longer;</li>
            <li>customs procedures may apply;</li>
            <li>local import restrictions may affect delivery;</li>
            <li>additional duties, import charges, or taxes may apply depending on destination.</li>
          </ul>
          <p className="mt-4">Where applicable, you are responsible for complying with local import laws and for paying any customs duties, import taxes, or related fees unless we expressly state otherwise at checkout.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Consumer Right to Cancel</h2>
          <p>If you are a consumer in the UK, you generally have the legal right to cancel your order for most goods bought online within 14 days after the day you receive the goods, without giving a reason. If your order contains multiple goods delivered on different days, the period usually runs from the day after the last item is received. If you were not properly informed of this right, the cancellation period can be extended under the Regulations.</p>
          <p>To exercise your cancellation right, you must clearly tell us of your decision to cancel by emailing support@elevatesupply.uk before the cancellation period expires.</p>
          <p>You may use wording such as:<br/>
          “I hereby give notice that I cancel my contract for the sale of the following goods: [insert order details].”</p>
          <p>If you cancel, you must send back the goods within 14 days of telling us that you wish to cancel, unless we tell you otherwise. We may withhold reimbursement until we receive the goods back or until you provide evidence that they have been sent back, whichever is earlier.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Returns Process</h2>
          <p>Because we use a distributed fulfilment and supplier model, we do not currently operate a general consumer-facing central UK returns warehouse for all products.</p>
          <p>Where a return is permitted or required, goods may need to be returned to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>the original supplier warehouse;</li>
            <li>the original fulfilment warehouse;</li>
            <li>another returns address we provide to you after you contact support.</li>
          </ul>
          <p className="mt-4">You must not return goods without first contacting us and receiving return instructions. An unauthorised return may delay or prevent refund processing.</p>
          <p>You are responsible for returning cancelled goods within the required period and for taking reasonable care of them while they are in your possession.</p>
          <p>We strongly recommend that all returns are sent using a tracked service and that proof of postage is retained.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">12. Return Costs</h2>
          <p>Unless the goods are faulty, not as described, damaged on arrival, or sent in error, you are responsible for the direct cost of returning goods.</p>
          <p>Because some products may need to be returned to overseas or supplier locations, return costs may be significantly higher than for a standard UK domestic return. By placing an order, you acknowledge that return routing may be international as part of our business model.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">13. Deductions from Refunds on Cancellation</h2>
          <p>If you exercise your cancellation right, we may reduce the refund to reflect any loss in value of the goods if that loss results from handling beyond what is necessary to establish the nature, characteristics, and functioning of the goods. This reflects the normal legal position for distance selling cancellations.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">14. Exclusions from the Right to Cancel</h2>
          <p>Your legal right to cancel may not apply, or may be lost, in certain situations permitted by law, including where applicable:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>sealed goods that are not suitable for return for health protection or hygiene reasons once unsealed;</li>
            <li>personalised or custom-made items;</li>
            <li>perishable goods;</li>
            <li>sealed audio, video, or software products once unsealed;</li>
            <li>other exceptions recognised by applicable consumer law.</li>
          </ul>
          <p className="mt-4">Where such exclusions apply, they will normally be stated on the product page or otherwise made clear before purchase.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">15. Faulty, Damaged, Incorrect, or Not-as-Described Goods</h2>
          <p>Nothing in our cancellation and returns process affects your legal rights if goods are:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>faulty;</li>
            <li>damaged on arrival;</li>
            <li>not as described;</li>
            <li>not fit for purpose.</li>
          </ul>
          <p className="mt-4">If you believe there is a problem with the goods, contact us at support@elevatesupply.uk as soon as possible and include:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>your order number;</li>
            <li>a description of the issue;</li>
            <li>photographs or video where relevant.</li>
          </ul>
          <p className="mt-4">Under UK consumer law, consumers have short-term rights in relation to faulty goods, including a right to reject within 30 days in certain cases, and further rights to repair or replacement, and potentially price reduction or final rejection if the issue is not resolved. Fault claims can also remain actionable for much longer periods, subject to legal rules and evidence.</p>
          <p>We may ask for evidence of the fault and may, where appropriate:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>offer a replacement;</li>
            <li>offer a repair where applicable;</li>
            <li>offer a partial refund;</li>
            <li>offer a full refund;</li>
            <li>request return of the goods before resolving the claim.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">16. Refund Timing</h2>
          <p>Where a refund is due following cancellation, we will process it without undue delay and within the time required by law.</p>
          <p>For cancelled goods, reimbursement is generally due within 14 days of:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>receiving the goods back; or</li>
            <li>receiving evidence that they have been sent back,</li>
          </ul>
          <p className="mt-4">whichever is earlier.</p>
          <p>Refunds will usually be made to the original payment method unless otherwise agreed.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">17. Accounts and Passwords</h2>
          <p>If you create an account on our website, you are responsible for:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>maintaining the confidentiality of your login details;</li>
            <li>all activity under your account;</li>
            <li>promptly notifying us of any unauthorised use.</li>
          </ul>
          <p className="mt-4">We may suspend or terminate accounts where we suspect misuse, fraud, or breaches of these Terms.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">18. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>use the website for any unlawful purpose;</li>
            <li>attempt to gain unauthorised access to the website or servers;</li>
            <li>interfere with website functionality or security;</li>
            <li>upload malicious code, bots, or scripts;</li>
            <li>scrape or harvest data without our permission;</li>
            <li>use the site in a way that harms our business, systems, or other users.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">19. Intellectual Property</h2>
          <p>All content on this website, including text, logos, graphics, product page layouts, branding, design, images, and software elements, is owned by us or licensed to us and is protected by intellectual property laws.</p>
          <p>You may view and use the website for personal, lawful shopping purposes only. You must not copy, reproduce, distribute, republish, modify, or commercially exploit website content without our prior written consent.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">20. Promotions and Discount Codes</h2>
          <p>We may issue discount codes, promotions, referral offers, or limited-time pricing from time to time.</p>
          <p>Unless expressly stated otherwise:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>promotions cannot be combined;</li>
            <li>codes cannot be exchanged for cash;</li>
            <li>promotions may be withdrawn at any time;</li>
            <li>misuse of promotional offers may result in cancellation of the order or suspension of the account.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">21. Events Outside Our Control</h2>
          <p>We are not liable for failure or delay in performing our obligations where this is caused by events outside our reasonable control, including but not limited to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>natural disasters;</li>
            <li>industrial disputes;</li>
            <li>pandemics;</li>
            <li>courier disruption;</li>
            <li>customs delays;</li>
            <li>cyber incidents;</li>
            <li>utility or systems failure;</li>
            <li>supplier disruption;</li>
            <li>government action.</li>
          </ul>
          <p className="mt-4">Where such events occur, we will try to minimise the impact and resume performance as soon as reasonably possible.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">22. Limitation of Liability</h2>
          <p>Nothing in these Terms excludes or limits liability where it would be unlawful to do so, including liability for death or personal injury caused by negligence, fraud, or for breach of statutory consumer rights that cannot legally be excluded.</p>
          <p>Subject to the above, to the fullest extent permitted by law:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>we are not liable for indirect or consequential losses;</li>
            <li>we are not liable for losses not reasonably foreseeable;</li>
            <li>our liability in connection with any order is limited to the amount paid by you for the relevant goods.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">23. Privacy and Data Protection</h2>
          <p>Our collection and use of personal data is governed by our <Link to="/privacy" className="text-orange-700 hover:underline">Privacy Policy</Link>.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">24. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. The version displayed on the website at the time of your order will apply to that order unless the law requires otherwise.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">25. Governing Law and Jurisdiction</h2>
          <p>These Terms are governed by the laws of England and Wales, unless mandatory consumer law in another part of the UK applies more favourably to you.</p>
          <p>Any disputes shall be subject to the courts of England and Wales, except that consumers living in Scotland or Northern Ireland may also have rights to bring claims in their home jurisdiction.</p>
        </div>
      </div>
    </div>
  );
}

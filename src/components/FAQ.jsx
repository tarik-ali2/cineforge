const FAQS = [
  {
    q: 'Payment ke baad prompts kaise milenge?',
    a: 'Payment success ke turant baad thank-you page par PDF download button dikhega. Email par bhi delivery hogi.',
  },
  {
    q: 'Ye prompts kis AI tool me use honge?',
    a: 'Ye text prompts hain. Gemini, Midjourney, Sora, DALL-E, Leonardo aur similar AI platforms me use kar sakte hain.',
  },
  {
    q: 'Kya beginner use kar sakta hai?',
    a: 'Haan. Prompts copy-paste format me hain, isliye beginner bhi directly result generate kar sakta hai.',
  },
  {
    q: 'Kya monthly charge hai?',
    a: 'Nahi. Ye one-time payment digital bundle hai. Ek baar kharido, lifetime use karo.',
  },
]

export default function FAQ({ content = {} }) {
  return (
    <section id="faq" className="py-20 px-4 sm:px-10 lg:px-20 bg-[#070707]">
      <div className="max-w-[1040px] mx-auto">
        <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
          Frequently Asked Questions
        </span>
        <h2 className="text-white font-black mb-8" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
          {content.faqHeading || 'Common questions'}
        </h2>

        <div>
          {FAQS.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

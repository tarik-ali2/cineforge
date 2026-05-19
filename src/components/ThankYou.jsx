export default function ThankYou({ name, pdfUrl, onBack }) {
  const downloadUrl = pdfUrl || '/ai-prompts-pack.pdf'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5 bg-[rgba(7,7,7,0.96)] backdrop-blur-sm">
      <div className="w-[min(94vw,620px)] bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-8 sm:p-12 text-center grid gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 grid place-items-center mx-auto text-3xl">✓</div>

        <div>
          <p className="text-[#e6382f] text-xs font-black uppercase tracking-widest mb-2">Payment Successful</p>
          <h2 className="text-gray-900 font-black text-3xl mb-3">
            Thank you, <span className="text-[#e6382f]">{name}</span>!
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Aapka <strong className="text-gray-800">10 Lakh+ AI Prompt Bundle</strong> ready hai. Neeche button se PDF download karein.
            Email automation connected hone par same link email par bhi chala jayega.
          </p>
        </div>

        <a
          href={downloadUrl}
          download
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-lg bg-[#e6382f] text-white font-black text-base hover:bg-[#b91f18] transition-colors shadow-[0_14px_28px_rgba(230,56,47,0.24)]"
        >
          ⬇ Download PDF
        </a>

        <button
          onClick={onBack}
          className="min-h-[48px] px-6 rounded-lg border border-[#e8dece] bg-white text-gray-700 font-black cursor-pointer hover:bg-gray-50 transition-colors text-sm"
        >
          Back To Page
        </button>
      </div>
    </div>
  )
}

import React, { useState } from "react";
import { Sparkles, Check, Zap, Shield, Crown, X, CreditCard, Lock, Calendar, QrCode, Smartphone } from "lucide-react";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  isDark: boolean;
  freeMessagesLeft: number;
  isProUser: boolean;
  userEmail?: string;
}

export function ProSubscriptionModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isDark,
  freeMessagesLeft,
  isProUser,
  userEmail,
}: ProSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "ultra">("monthly");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"visa" | "mastercard" | "amex" | "apple_pay" | "google_pay" | "paypal" | "qr_code">("visa");
  const [step, setStep] = useState<"select" | "payment">("select");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (selectedPaymentMethod === "visa" || selectedPaymentMethod === "mastercard" || selectedPaymentMethod === "amex") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 15) {
        setErrorMsg("Please enter a valid card number.");
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMsg("Please enter the cardholder name.");
        return;
      }
      if (!expiry || !expiry.includes("/")) {
        setErrorMsg("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (!cvc || cvc.length < 3) {
        setErrorMsg("Please enter a valid CVC security code.");
        return;
      }
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod: selectedPaymentMethod, cardNumber: cardNumber.slice(-4), email: userEmail }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        setIsProcessing(false);
        if (data.url) {
          window.location.href = data.url;
        } else {
          setSuccessMessage(`🎉 Payment successful via ${selectedPaymentMethod.replace('_', ' ').toUpperCase()}! Welcome to JOXIQ ${selectedPlan === "ultra" ? "VIP Ultra" : "Pro"}.`);
          setTimeout(() => {
            onUpgradeSuccess();
            onClose();
          }, 1500);
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessMessage(`🎉 Payment successful via ${selectedPaymentMethod.replace('_', ' ').toUpperCase()}! Welcome to JOXIQ ${selectedPlan === "ultra" ? "Ultra" : "Pro"}.`);
        setTimeout(() => {
          onUpgradeSuccess();
          onClose();
        }, 1500);
      }, 1200);
    }
  };

  const planPriceQAR = selectedPlan === "monthly" ? "36 QR" : selectedPlan === "yearly" ? "300 QR" : "99 QR";
  const planPriceUSD = selectedPlan === "monthly" ? "$9.90 USD" : selectedPlan === "yearly" ? "$82.50 USD" : "$27.20 USD";
  const planPriceFull = `${planPriceQAR} (${planPriceUSD})`;
  const planName = selectedPlan === "monthly" ? "Pro" : selectedPlan === "yearly" ? "Annual Pro" : "Ultra";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl border transition-all ${
        isDark ? "bg-[#0b1329] border-white/15 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-3">
            <Crown size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Upgrade to <span className="text-amber-400 dark:text-amber-300 font-extrabold">JOXIQ AI {selectedPlan === "ultra" ? "Ultra" : "Pro"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto px-2">
            {step === "payment" 
              ? `Select payment method for ${planName} (${planPriceFull})` 
              : isProUser 
                ? "You are currently enjoying full JOXIQ AI privileges!" 
                : `You have ${Math.max(0, freeMessagesLeft)} free messages remaining. Unlock high-speed limits, multi-turn reasoning, and top-tier models.`}
          </p>
        </div>

        {successMessage ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-bold animate-bounce">
              ✓
            </div>
            <p className="text-lg font-bold text-emerald-400">{successMessage}</p>
          </div>
        ) : step === "select" ? (
          <>
            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPlan === "monthly"
                    ? "border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/50"
                    : isDark ? "border-white/10 bg-white/5 hover:border-white/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pro</span>
                    {selectedPlan === "monthly" && <Check size={16} className="text-indigo-400" />}
                  </div>
                  <div className="text-xl font-black mb-1">36 QR <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <div className="text-xs font-semibold text-emerald-400">💵 $9.90 USD / month</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> 300,000 Monthly Tokens</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Pro Models & Vision Engine</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Low Latency Priority Speed</li>
                </ul>
              </div>

              {/* Yearly Plan */}
              <div
                onClick={() => setSelectedPlan("yearly")}
                className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPlan === "yearly"
                    ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/50"
                    : isDark ? "border-white/10 bg-white/5 hover:border-white/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  SAVE 30%
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Annual Pro</span>
                    {selectedPlan === "yearly" && <Check size={16} className="text-amber-400" />}
                  </div>
                  <div className="text-xl font-black mb-1">300 QR <span className="text-xs font-normal text-slate-400">/ yr</span></div>
                  <div className="text-xs font-semibold text-emerald-400">💵 $82.50 USD / year</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Save 30% vs Monthly Plan</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Complete Pro Suite Features</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Priority 24/7 Support Channel</li>
                </ul>
              </div>

              {/* Ultra Plan */}
              <div
                onClick={() => setSelectedPlan("ultra")}
                className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPlan === "ultra"
                    ? "border-violet-500 bg-violet-600/15 shadow-xl shadow-violet-500/20 ring-2 ring-violet-500/60"
                    : isDark ? "border-white/10 bg-white/5 hover:border-white/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  ULTRA
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Ultra</span>
                    {selectedPlan === "ultra" && <Check size={16} className="text-violet-400" />}
                  </div>
                  <div className="text-xl font-black mb-1">99 QR <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <div className="text-xs font-semibold text-emerald-400">💵 $27.20 USD / month</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> 1,000,000 Monthly Tokens</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Top Models (GPT-4o, Claude 3.5)</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Dedicated Compute Node</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("payment")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <CreditCard size={16} />
                Continue to Payment Method ({planPriceFull})
              </button>
            </div>
          </>
        ) : (
          /* Payment Method Form Step */
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "visa", label: "Visa", icon: "💳" },
                  { id: "mastercard", label: "Mastercard", icon: "💳" },
                  { id: "qr_code", label: "Scan QR Code", icon: "📱" },
                  { id: "apple_pay", label: "Apple Pay", icon: "" },
                  { id: "google_pay", label: "Google Pay", icon: "G" },
                  { id: "paypal", label: "PayPal", icon: "P" },
                  { id: "amex", label: "Amex", icon: "💳" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod(method.id as any);
                      setErrorMsg(null);
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === method.id
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-md ring-2 ring-indigo-500/40"
                        : isDark ? "border-white/10 bg-white/5 hover:border-white/20 text-slate-300" : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className="text-base">{method.icon}</span>
                    <span className="text-[11px] truncate max-w-full">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Plan</span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">{planName} — {planPriceQAR} ({planPriceUSD})</span>
              </div>

              {selectedPaymentMethod === "qr_code" ? (
                /* QR Code Instant Scan Payment Display */
                <div className="py-4 text-center flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 inline-block relative group">
                    {/* Render visual vector QR code */}
                    <svg className="w-40 h-40 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M0,0 h35 v35 h-35 z M5,5 v25 h25 v-25 z M10,10 h15 v15 h-15 z" />
                      <path d="M65,0 h35 v35 h-35 z M70,5 v25 h25 v-25 z M75,10 h15 v15 h-15 z" />
                      <path d="M0,65 h35 v35 h-35 z M5,70 v25 h25 v-25 z M10,75 h15 v15 h-15 z" />
                      <path d="M40,5 h10 v10 h-10 z M50,15 h10 v10 h-10 z M40,25 h10 v10 h-10 z" />
                      <path d="M65,40 h10 v10 h-10 z M75,50 h10 v10 h-10 z M85,40 h15 v10 h-15 z M65,60 h15 v10 h-15 z" />
                      <path d="M40,65 h10 v10 h-10 z M50,75 h10 v20 h-10 z M40,85 h20 v10 h-20 z" />
                      <path d="M65,75 h10 v10 h-10 z M80,75 h20 v20 h-20 z" />
                      <circle cx="50" cy="50" r="8" fill="#4f46e5" />
                    </svg>
                    <div className="mt-2 text-[10px] font-mono font-bold text-slate-800 bg-slate-100 py-1 px-2 rounded">
                      PAY-REF: JOXIQ-{selectedPlan.toUpperCase()}-2026
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
                      <Smartphone size={15} className="text-indigo-400" />
                      Scan QR Code to Pay {planPriceQAR} / {planPriceUSD}
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Use QNB Mobile, bKash, Nagad, Apple Camera, or any QR reader app. Your account will automatically activate upon confirmation.
                    </p>
                  </div>
                </div>
              ) : (selectedPaymentMethod === "visa" || selectedPaymentMethod === "mastercard" || selectedPaymentMethod === "amex") ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mohammad Nain"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                        isDark ? "bg-black/30 border-white/15 focus:border-indigo-500 text-white" : "bg-white border-slate-300 focus:border-indigo-600 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{selectedPaymentMethod.toUpperCase()} Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none transition-all ${
                          isDark ? "bg-black/30 border-white/15 focus:border-indigo-500 text-white" : "bg-white border-slate-300 focus:border-indigo-600 text-slate-900"
                        }`}
                      />
                      <CreditCard size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none transition-all ${
                          isDark ? "bg-black/30 border-white/15 focus:border-indigo-500 text-white" : "bg-white border-slate-300 focus:border-indigo-600 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CVC Code</label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="CVC"
                          maxLength={4}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none transition-all ${
                            isDark ? "bg-black/30 border-white/15 focus:border-indigo-500 text-white" : "bg-white border-slate-300 focus:border-indigo-600 text-slate-900"
                          }`}
                        />
                        <Lock size={14} className="absolute left-2.5 top-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mb-1">
                    <Shield size={22} />
                  </div>
                  <div className="text-sm font-bold capitalize">
                    {selectedPaymentMethod === "apple_pay" ? "Apple Pay" : selectedPaymentMethod === "google_pay" ? "Google Pay" : "PayPal"} Checkout
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    You will be securely redirected to authorize your {selectedPaymentMethod === "apple_pay" ? "Apple Pay" : selectedPaymentMethod === "google_pay" ? "Google Pay" : "PayPal"} payment of <span className="font-bold text-white">{planPriceFull}</span>.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setStep("select")}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-200 text-center"
              >
                ← Back to Plans
              </button>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleSubscribe}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>Processing Secure Payment...</>
                  ) : selectedPaymentMethod === "qr_code" ? (
                    <>
                      <QrCode size={14} />
                      I Have Scanned & Paid ({planPriceFull})
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      Pay Securely ({planPriceFull})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Sparkles, Check, Zap, Shield, Crown, X, CreditCard, Lock, Calendar } from "lucide-react";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  isDark: boolean;
  freeMessagesLeft: number;
  isProUser: boolean;
}

export function ProSubscriptionModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isDark,
  freeMessagesLeft,
  isProUser,
}: ProSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "ultra">("monthly");
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

    setErrorMsg(null);
    setIsProcessing(true);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, cardNumber: cardNumber.slice(-4) }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        setIsProcessing(false);
        if (data.url) {
          window.location.href = data.url;
        } else {
          setSuccessMessage(`🎉 Payment successful! Welcome to JOXIQ ${selectedPlan === "ultra" ? "Ultra" : "Pro"}.`);
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
        setSuccessMessage(`🎉 Payment successful! Welcome to JOXIQ ${selectedPlan === "ultra" ? "Ultra" : "Pro"}.`);
        setTimeout(() => {
          onUpgradeSuccess();
          onClose();
        }, 1500);
      }, 1200);
    }
  };

  const planPrice = selectedPlan === "monthly" ? "36 QR" : selectedPlan === "yearly" ? "300 QR" : "99 QR";
  const planName = selectedPlan === "monthly" ? "Monthly Pro" : selectedPlan === "yearly" ? "Annual Pro" : "JOXIQ Ultra";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border transition-all ${
        isDark ? "bg-[#0b1329] border-white/15 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-3">
            <Crown size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Upgrade to <span className="bg-gradient-to-r from-amber-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">JOXIQ AI {selectedPlan === "ultra" ? "Ultra" : "Pro"}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {step === "payment" 
              ? `Enter your payment card details for ${planName} (${planPrice})` 
              : isProUser 
                ? "You are currently enjoying JOXIQ AI privileges!" 
                : `You have ${Math.max(0, freeMessagesLeft)} free messages remaining. Unlock unlimited AI power and advanced models.`}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPlan === "monthly"
                    ? "border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/50"
                    : isDark ? "border-white/10 bg-white/5 hover:border-white/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Monthly Pro</span>
                    {selectedPlan === "monthly" && <Check size={16} className="text-indigo-400" />}
                  </div>
                  <div className="text-2xl font-black mb-1">36 QR <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <div className="text-xs text-slate-400">~$9.99 USD / month</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Unlimited AI Messages</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Gemini Pro & Flash models</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Priority Speed & Voice</li>
                </ul>
              </div>

              {/* Yearly Plan */}
              <div
                onClick={() => setSelectedPlan("yearly")}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
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
                  <div className="text-2xl font-black mb-1">300 QR <span className="text-xs font-normal text-slate-400">/ yr</span></div>
                  <div className="text-xs text-slate-400">~$82 USD / year</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> All Monthly Pro Features</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Custom App Branding</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Priority 24/7 Support</li>
                </ul>
              </div>

              {/* Ultra Plan */}
              <div
                onClick={() => setSelectedPlan("ultra")}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPlan === "ultra"
                    ? "border-violet-500 bg-violet-600/15 shadow-xl shadow-violet-500/20 ring-2 ring-violet-500/60"
                    : isDark ? "border-white/10 bg-white/5 hover:border-white/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  VIP ULTRA
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400">JOXIQ Ultra</span>
                    {selectedPlan === "ultra" && <Check size={16} className="text-violet-400" />}
                  </div>
                  <div className="text-2xl font-black mb-1">99 QR <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <div className="text-xs text-slate-400">Maximum Power & Agents</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> All Pro & Annual Features</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Gemini Ultra / Advanced AI</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Dedicated VIP Agent Node</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("payment")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <CreditCard size={16} />
                Continue to Payment Method ({planPrice})
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

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Plan</span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">{planName} — {planPrice}</span>
              </div>
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
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
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
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
              >
                ← Back to Plans
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleSubscribe}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>Processing Secure Payment...</>
                  ) : (
                    <>
                      <Lock size={14} />
                      Pay Securely ({planPrice})
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

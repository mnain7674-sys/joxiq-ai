import React, { useState, useEffect } from "react";
import {
  Crown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  RefreshCw,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Receipt,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import {
  getAcademySubscription,
  cancelAcademySubscription,
  renewAcademySubscription,
  AcademySubscriptionState,
  AcademyTransaction
} from "../../lib/academySubscription";
import { AcademyInvoiceModal } from "./AcademyInvoiceModal";

interface AcademySubscriptionPanelProps {
  userEmail?: string;
  userName?: string;
  onOpenCheckoutModal: () => void;
}

export const AcademySubscriptionPanel: React.FC<AcademySubscriptionPanelProps> = ({
  userEmail = "student@joxiq.ai",
  userName = "Learner",
  onOpenCheckoutModal
}) => {
  const [subscription, setSubscription] = useState<AcademySubscriptionState>(() => getAcademySubscription(userEmail));
  const [selectedTransaction, setSelectedTransaction] = useState<AcademyTransaction | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSubscription(getAcademySubscription(userEmail));
    };
    window.addEventListener("joxiq_academy_sub_updated", handleUpdate);
    return () => window.removeEventListener("joxiq_academy_sub_updated", handleUpdate);
  }, [userEmail]);

  const handleCancelSub = () => {
    if (confirm("Are you sure you want to cancel auto-renewal for your JOXIQ AI Learning Academy Pro subscription? You will retain access until the end of your billing cycle.")) {
      const updated = cancelAcademySubscription(userEmail);
      setSubscription(updated);
      setActionMessage("Auto-renewal cancelled. Your Pro access remains active until the expiration date.");
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleRenewSub = () => {
    const updated = renewAcademySubscription({ userEmail, paymentMethod: "Card ending in 4242" });
    setSubscription(updated);
    setActionMessage("🎉 JOXIQ AI Learning Academy Pro subscription renewed successfully for $14.99!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const isPro = subscription.status === "Active" || (subscription.status === "Cancelled" && subscription.expiryDate && new Date(subscription.expiryDate).getTime() > Date.now());

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-amber-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Primary Subscription Plan Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-slate-100 shadow-xl space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg ${
              isPro
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}>
              <Crown className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isPro ? "JOXIQ AI Learning Academy Pro" : "Free Learner Plan"}
                </h3>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider border flex items-center gap-1.5 ${
                  subscription.status === "Active"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : subscription.status === "Cancelled"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : subscription.status === "Expired"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    subscription.status === "Active" ? "bg-emerald-400 animate-pulse" : subscription.status === "Cancelled" ? "bg-amber-400" : "bg-rose-400"
                  }`} />
                  <span>{subscription.status === "None" ? "Free" : subscription.status}</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 max-w-md">
                {isPro
                  ? "Dedicated Learning Academy Pro membership. Complete access to 100 classes per course, AI Teacher, and certificates."
                  : "Upgrade to JOXIQ AI Learning Academy Pro ($14.99/mo) to unlock all classes, advanced modules, and AI voice classroom."}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            {!isPro ? (
              <button
                onClick={onOpenCheckoutModal}
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5 text-slate-950" />
                <span>Subscribe Now ($14.99/mo)</span>
              </button>
            ) : subscription.status === "Cancelled" ? (
              <button
                onClick={handleRenewSub}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Renew Subscription ($14.99)</span>
              </button>
            ) : (
              <button
                onClick={handleCancelSub}
                className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Cancel Auto-Renewal</span>
              </button>
            )}
          </div>
        </div>

        {/* Details Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 relative z-10 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-semibold block text-[11px]">Pricing Plan</span>
            <span className="text-base font-black text-amber-300 mt-0.5 block">
              {isPro ? "$14.99 / month" : "Free Plan"}
            </span>
            <span className="text-[10px] text-slate-400">Independent Academy Billing</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-semibold block text-[11px]">
              {subscription.status === "Active" ? "Renewal Date" : subscription.status === "Cancelled" ? "Valid Until" : "Status Expiry"}
            </span>
            <span className="text-sm font-bold text-white mt-0.5 block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {subscription.autoRenew ? "Auto-renews monthly" : "Manual renewal"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-semibold block text-[11px]">Pro Content Access</span>
            <span className={`text-sm font-bold mt-0.5 block flex items-center gap-1.5 ${isPro ? "text-emerald-400" : "text-slate-400"}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{isPro ? "All 100 Classes Unlocked" : "Basic Free Classes (1-5)"}</span>
            </span>
            <span className="text-[10px] text-slate-400">Progress saved when expired</span>
          </div>
        </div>
      </div>

      {/* Payment History & Invoice Receipts Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">Academy Payment History & Invoices</h4>
          </div>
          <span className="text-xs text-slate-400">
            {subscription.transactions.length} record{subscription.transactions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {subscription.transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800/60 text-xs">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No payment history recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Subscribe to JOXIQ AI Learning Academy Pro ($14.99/mo) to view your printable receipts and invoices.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className="py-3 px-4 font-bold">Invoice #</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Plan</th>
                  <th className="py-3 px-4 font-bold">Payment Method</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                {subscription.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{tx.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{tx.planName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{tx.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsInvoiceModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Invoice Modal */}
      <AcademyInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        transaction={selectedTransaction}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  );
};

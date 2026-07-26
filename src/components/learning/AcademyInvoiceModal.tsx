import React from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, GraduationCap, FileText } from "lucide-react";
import { AcademyTransaction } from "../../lib/academySubscription";

interface AcademyInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: AcademyTransaction | null;
  userEmail?: string;
  userName?: string;
}

export const AcademyInvoiceModal: React.FC<AcademyInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  userEmail = "student@joxiq.ai",
  userName = "Student"
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header Actions (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <FileText className="w-5 h-5" />
            <span>Official Receipt & Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <GraduationCap className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight print:text-black">JOXIQ AI</h3>
                  <p className="text-xs text-amber-400 font-bold">Learning Academy Pro</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 print:text-slate-600">
                JOXIQ AI Technologies Ltd.<br />
                Global Education & AI Pedagogy Division
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider print:border-emerald-600 print:text-emerald-700">
                {transaction.status}
              </span>
              <p className="text-xs font-mono text-slate-300 mt-2 font-bold print:text-black">
                {transaction.invoiceNumber}
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Date: {transaction.date}
              </p>
            </div>
          </div>

          <hr className="border-slate-800 print:border-slate-300" />

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] print:text-slate-600">Billed To</p>
              <p className="font-bold text-white text-sm mt-0.5 print:text-black">{userName}</p>
              <p className="text-slate-300 print:text-slate-700">{userEmail}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] print:text-slate-600">Payment Method</p>
              <p className="font-bold text-white text-sm mt-0.5 print:text-black">{transaction.paymentMethod}</p>
              <p className="text-slate-300 print:text-slate-700">Transaction ID: <span className="font-mono text-[10px]">{transaction.id}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden print:border-slate-300 print:bg-slate-50">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50 print:border-slate-300 print:bg-slate-200 print:text-black">
                  <th className="py-2.5 px-4 font-bold">Description</th>
                  <th className="py-2.5 px-4 font-bold text-center">Period</th>
                  <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-white print:text-black">{transaction.planName}</p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">Full Access to All 100 Classes per Course, AI Teacher Studio & Certificates</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300 print:text-slate-700">Monthly</td>
                  <td className="py-3 px-4 text-right font-bold text-white print:text-black">{transaction.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Total */}
          <div className="flex flex-col items-end gap-1 text-xs">
            <div className="flex justify-between w-48 text-slate-400 print:text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-200 print:text-black">{transaction.amount}</span>
            </div>
            <div className="flex justify-between w-48 text-slate-400 print:text-slate-600">
              <span>Tax (0%):</span>
              <span className="font-medium text-slate-200 print:text-black">$0.00</span>
            </div>
            <div className="flex justify-between w-48 text-sm font-black text-white pt-2 border-t border-slate-800 print:border-slate-400 print:text-black">
              <span>Total Paid:</span>
              <span className="text-amber-400 print:text-amber-700">{transaction.amount}</span>
            </div>
          </div>

          {/* Guarantee Footer */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-200 flex items-center justify-center gap-2 print:border-amber-400 print:bg-amber-50 print:text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Thank you for learning with JOXIQ AI Learning Academy Pro! Your subscription is active.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

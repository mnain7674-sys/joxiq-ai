import React, { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check } from "lucide-react";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown-body prose prose-slate max-w-none text-sm md:text-base leading-relaxed break-words space-y-1">
      <Markdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && language) {
              return <CodeBlock code={codeString} language={language} />;
            }

            // Fallback for multiline code blocks that have no language class, or single inline code blocks
            if (!inline && codeString.includes("\n")) {
              return <CodeBlock code={codeString} language="code" />;
            }

            return (
              <code
                className="bg-gray-100 dark:bg-gray-850 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded font-mono text-[13px] border border-gray-200 dark:border-gray-800 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }: any) => <h1 className="text-xl md:text-2xl font-bold mt-4 mb-2 tracking-tight text-gray-900 dark:text-white">{children}</h1>,
          h2: ({ children }: any) => <h2 className="text-lg md:text-xl font-semibold mt-3 mb-2 tracking-tight text-gray-800 dark:text-slate-100">{children}</h2>,
          h3: ({ children }: any) => <h3 className="text-md md:text-lg font-medium mt-2 mb-1 text-gray-800 dark:text-slate-100">{children}</h3>,
          p: ({ children }: any) => <p className="mb-2 text-gray-700 dark:text-slate-100 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-700 dark:text-slate-100">{children}</ul>,
          ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-700 dark:text-slate-100">{children}</ol>,
          li: ({ children }: any) => <li className="leading-relaxed text-gray-700 dark:text-slate-100">{children}</li>,
          a: ({ href, children }: any) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline font-medium break-all"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2 text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          table: ({ children }: any) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }: any) => <thead className="bg-gray-50 dark:bg-gray-900">{children}</thead>,
          tbody: ({ children }: any) => <tbody className="divide-y divide-gray-200 dark:divide-gray-800">{children}</tbody>,
          tr: ({ children }: any) => <tr>{children}</tr>,
          th: ({ children }: any) => <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">{children}</th>,
          td: ({ children }: any) => <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{children}</td>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-950 shadow-md font-mono text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-400 select-none">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-gray-800/60 hover:bg-gray-850 px-2.5 py-1 rounded border border-gray-800 text-[11px]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      {/* Code contents */}
      <div className="overflow-x-auto p-4 text-xs md:text-sm text-gray-100 font-mono leading-relaxed max-h-[450px]">
        <pre className="m-0 select-text">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

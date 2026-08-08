/**
 * Smart ChatGPT-style Topic Title Generator
 * Automatically extracts concise, meaningful, capitalized topic titles from user messages.
 */
export function generateSmartTopicTitle(userText?: string, aiResponseText?: string, docName?: string): string {
  if (docName) return `Doc: ${docName}`;
  if (!userText || !userText.trim()) return "New Chat";

  const raw = userText.trim();
  const lower = raw.toLowerCase();

  // Greetings check
  const greetings = [
    "hi", "hello", "hey", "hola", "helo", "hy", "hlo", "hihi", "hi hi", "hi!", "hello!",
    "kemon aso", "kemon achen", "ki obostha", "assalamu alaikum", "namaste", "good morning", "good evening", "how are you"
  ];

  const isGreetingOnly =
    greetings.includes(lower) ||
    /^h[ei]+l*o*[\s!.]*$/i.test(lower) ||
    /^(hi|hey|\bhello\b)[\s!.]*$/i.test(lower);

  if (isGreetingOnly) {
    if (aiResponseText && aiResponseText.length > 10) {
      const cleanAi = aiResponseText.replace(/[*_#`~]/g, "").trim();
      const firstSentence = cleanAi.split(/[.!?\n]/)[0].trim();
      if (
        firstSentence &&
        firstSentence.length > 5 &&
        !firstSentence.toLowerCase().includes("hello") &&
        !firstSentence.toLowerCase().includes("how can i help") &&
        !firstSentence.toLowerCase().includes("assist you")
      ) {
        return firstSentence.length > 32 ? firstSentence.substring(0, 30) + "..." : firstSentence;
      }
    }
    return "General Conversation";
  }

  // Strip common prompt/command prefixes
  let cleaned = raw
    .replace(/^(can you|please|could you|i want to|tell me|explain|what is|what are|how to|how do i|give me|write a|create a|generate a|help me solve|help me with|code for|search for|find me|kivabe|ai|bot|show me|solve|calculate)\s+/i, "")
    .replace(/^this\s+/i, "")
    .replace(/[*_#`~?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) cleaned = raw;

  // Title case words and limit to 5 words / max 30 chars
  const words = cleaned.split(/\s+/).slice(0, 5);
  let title = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  if (title.length > 30) {
    title = title.substring(0, 28) + "...";
  }

  return title || "New Chat";
}

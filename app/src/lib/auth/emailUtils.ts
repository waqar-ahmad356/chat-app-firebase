/** Domains that often never receive Firebase auth emails */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "sharklasers.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

export function getDisposableEmailWarning(email: string | null | undefined): string | null {
  if (!email || !isDisposableEmail(email)) return null;
  return "Disposable inboxes (like Mailinator) usually do not receive Firebase emails. Use Gmail, Outlook, or Yahoo to test.";
}

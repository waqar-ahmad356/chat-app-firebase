import { getDisposableEmailWarning } from "@/app/src/lib/auth/emailUtils";

interface EmailDeliveryTipsProps {
  email?: string | null;
}

export function EmailDeliveryTips({ email }: EmailDeliveryTipsProps) {
  const disposableWarning = getDisposableEmailWarning(email);

  return (
    <section className="rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
      <p className="font-medium text-slate-300">Did not get the email?</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>Check spam, junk, and promotions folders</li>
        <li>Wait 2 to 5 minutes for delivery</li>
        <li>Sender is usually noreply from Firebase</li>
        {disposableWarning ? (
          <li className="text-amber-300/90">{disposableWarning}</li>
        ) : (
          <li>Use Gmail, Outlook, or Yahoo instead of temporary email sites</li>
        )}
      </ul>
    </section>
  );
}

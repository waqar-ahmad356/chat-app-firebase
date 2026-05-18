export function AuthDivider() {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-1 border-t border-slate-700" />
      <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-500">
        or
      </span>
      <div className="flex-1 border-t border-slate-700" />
    </div>
  );
}

import { useEffect } from "react";
import { ui, useUi } from "../state/ui";

const NOTICE_MS = 3500;

export function Notice() {
  const notice = useUi((s) => s.notice);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => ui.notice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);
  if (!notice) return null;
  return (
    <div key={notice.title} className="notice" role="status">
      <span className="notice__title">{notice.title}</span>
      <span className="notice__hint">{notice.hint}</span>
    </div>
  );
}

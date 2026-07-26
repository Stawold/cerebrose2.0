// Small "3 / 40" style counter, shown wherever a game has a current
// item/question index. Renders nothing if there's no progress to show.
export default function ProgressBadge({ progress }) {
  if (!progress || progress.total == null) return null;
  const current = progress.index != null ? progress.index + 1 : null;
  return (
    <span className="pill-badge">
      {current != null ? `${current} / ${progress.total}` : `${progress.total} au total`}
    </span>
  );
}

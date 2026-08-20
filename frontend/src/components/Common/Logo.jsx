// The wordmark: "Cérébr'Ose" with a coral full stop, per the design system.
// `onInk` switches the base color for use on the dark projection column.
export default function Logo({ size = 24, onInk = false, style }) {
  return (
    <span className={`logo${onInk ? ' on-ink' : ''}`} style={{ fontSize: size, ...style }}>
      Cérébr&apos;Ose<span className="dot">.</span>
    </span>
  );
}

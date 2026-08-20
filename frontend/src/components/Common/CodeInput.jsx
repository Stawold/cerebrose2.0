import { useRef } from 'react';

// Six boxes showing a party code as it's typed. A native input sits
// invisibly on top to capture typing/paste/backspace — same `value` /
// `onChange` contract as a plain text input, just dressed up.
export default function CodeInput({ value, onChange, onSubmit, onInk = false, autoFocus = false }) {
  const inputRef = useRef(null);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <div
      style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="code-digits">
        {digits.map((d, i) => {
          const filled = d.trim() !== '';
          return (
            <div key={i} className={`code-digit${filled ? ' filled' : ''}${onInk ? ' on-ink' : ''}`}>
              {filled ? d : '0'}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          padding: 0,
          border: 'none',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

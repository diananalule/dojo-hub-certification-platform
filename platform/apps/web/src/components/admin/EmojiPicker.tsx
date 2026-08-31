'use client';

import { useState } from 'react';

/**
 * Picker for a course's launcher emoji.
 *
 * The field used to be a bare text input, which assumed the author knew how to summon
 * their operating system's emoji keyboard — on Windows that is Win+. , which most people
 * do not know. The grid makes the common choices one click, and the input stays so
 * anything not listed can still be pasted or typed.
 *
 * Grouped by the kind of course Dojo Hub actually runs, rather than by the standard
 * emoji categories, so the relevant symbol is where an author would look for it.
 */
const GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Software',
    emojis: ['💻', '⌨️', '🖥️', '🧑‍💻', '📱', '🌐', '⚙️', '🧩', '🪄', '🚀'],
  },
  {
    label: 'Hardware & IoT',
    emojis: ['🔌', '🔋', '📡', '🛰️', '🤖', '🔧', '🛠️', '⚡', '💡', '🕹️'],
  },
  {
    label: 'Data & AI',
    emojis: ['📊', '📈', '🧮', '🧠', '🔬', '🗃️', '🔎', '📉', '🧪', '♾️'],
  },
  {
    label: 'Learning',
    emojis: ['📘', '📚', '🎓', '✏️', '📝', '🏆', '🎯', '🧭', '🗂️', '🔑'],
  },
];

export function EmojiPicker({
  value,
  onChange,
  label = 'Launcher emoji',
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          placeholder="📘"
          className="input w-20 text-center text-xl"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="text-xs font-bold text-crimson-600 hover:underline shrink-0"
        >
          {open ? 'Close' : 'Choose an emoji'}
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-navy-200 bg-white p-3 space-y-3 max-h-64 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-navy-500 mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Use ${emoji}`}
                    onClick={() => {
                      onChange(emoji);
                      setOpen(false);
                    }}
                    className={
                      value === emoji
                        ? 'w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-crimson-50 ring-2 ring-crimson-500'
                        : 'w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-navy-50'
                    }
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-navy-400 pt-1 border-t border-navy-100">
            Not listed? Type or paste any emoji into the box above.
          </p>
        </div>
      )}
    </div>
  );
}

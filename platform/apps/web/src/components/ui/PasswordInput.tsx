'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from './cn';

/**
 * Password field with a show/hide toggle. Without it a typo is invisible, which is
 * the most common reason a correct password appears to be rejected.
 *
 * Forwards its ref so it drops straight into react-hook-form's `register()`.
 */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          // Right padding keeps the typed text clear of the toggle button.
          className={cn(className, 'pr-12')}
        />
        <button
          type="button"
          // tabIndex -1 keeps Tab going straight from password to submit.
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-black/[0.04] transition-colors"
        >
          {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </div>
    );
  },
);

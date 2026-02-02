import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            className="relative p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-300 group overflow-hidden"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Background glow effect */}
            <div className={`
        absolute inset-0 transition-opacity duration-300
        ${isDark
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/10'
                    : 'bg-gradient-to-br from-amber-500/20 to-orange-500/10'
                }
      `} />

            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                    strokeWidth={2}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-primary-400 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                        }`}
                    strokeWidth={2}
                />
            </div>
        </button>
    );
}

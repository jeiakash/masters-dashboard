import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';

export default function DeadlineCountdown({ applications }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const upcomingDeadlines = applications
        .filter(app => {
            const deadline = new Date(app.deadline);
            const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 30;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (upcomingDeadlines.length === 0) {
        return (
            <div className="glass-card p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                    </div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">
                        Upcoming Deadlines
                    </h3>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                        <CalendarClock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-surface-500 dark:text-surface-400 text-sm">
                        No deadlines in the next 30 days
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                        You're all caught up! 🎉
                    </p>
                </div>
            </div>
        );
    }

    const getCountdown = (deadline) => {
        const diff = new Date(deadline) - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days === 0) {
            return { days: 0, hours, text: `${hours}h`, urgent: true, critical: true };
        }
        if (days <= 7) {
            return { days, hours, text: `${days}d ${hours}h`, urgent: true, critical: false };
        }
        return { days, hours, text: `${days} days`, urgent: false, critical: false };
    };

    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                        <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />
                    </div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">
                        Upcoming Deadlines
                    </h3>
                </div>
                <span className="text-xs font-medium text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">
                    {upcomingDeadlines.length} due
                </span>
            </div>

            <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((app, index) => {
                    const countdown = getCountdown(app.deadline);
                    const isFirst = index === 0;

                    return (
                        <div
                            key={app.id}
                            className={`
                relative overflow-hidden rounded-xl p-4 transition-all duration-300
                ${isFirst && countdown.critical
                                    ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30 border border-red-200 dark:border-red-800/50'
                                    : isFirst
                                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/50'
                                        : 'bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50'
                                }
              `}
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeIn 0.4s ease-out forwards',
                                opacity: 0,
                            }}
                        >
                            {/* Urgent indicator */}
                            {isFirst && countdown.urgent && (
                                <div className="absolute top-3 right-3">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${countdown.critical ? 'bg-red-400' : 'bg-amber-400'} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${countdown.critical ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className={`font-semibold truncate ${isFirst
                                            ? countdown.critical
                                                ? 'text-red-700 dark:text-red-400'
                                                : 'text-amber-700 dark:text-amber-400'
                                            : 'text-surface-900 dark:text-white'
                                        }`}>
                                        {app.university_name}
                                    </p>
                                    <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-0.5">
                                        {app.program_name}
                                    </p>
                                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5 font-medium">
                                        {new Date(app.deadline).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className={`
                  flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-sm
                  ${isFirst && countdown.critical
                                        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                                        : isFirst
                                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                                            : countdown.urgent
                                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                                    }
                `}>
                                    {countdown.text}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {upcomingDeadlines.length > 5 && (
                    <p className="text-center text-xs text-surface-400 dark:text-surface-500 pt-2">
                        +{upcomingDeadlines.length - 5} more deadlines
                    </p>
                )}
            </div>
        </div>
    );
}

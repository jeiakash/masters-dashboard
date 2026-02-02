import { FileText, Calendar, TrendingUp, Target, Sparkles } from 'lucide-react';

export default function KPICards({ stats }) {
    const daysToDeadline = stats.nextDeadline
        ? Math.ceil((new Date(stats.nextDeadline.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const completionPercentage = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const cards = [
        {
            title: 'Total Applications',
            value: stats.total,
            icon: FileText,
            iconColor: 'text-primary-500',
            bgColor: 'bg-primary-50 dark:bg-primary-950/30',
            borderColor: 'border-primary-200 dark:border-primary-800/50',
        },
        {
            title: 'Days to Deadline',
            value: daysToDeadline !== null ? daysToDeadline : '—',
            subtitle: stats.nextDeadline?.university_name?.split(' ').slice(0, 2).join(' '),
            icon: Calendar,
            iconColor: daysToDeadline !== null && daysToDeadline <= 7
                ? 'text-red-500'
                : daysToDeadline !== null && daysToDeadline <= 30
                    ? 'text-amber-500'
                    : 'text-emerald-500',
            bgColor: daysToDeadline !== null && daysToDeadline <= 7
                ? 'bg-red-50 dark:bg-red-950/30'
                : daysToDeadline !== null && daysToDeadline <= 30
                    ? 'bg-amber-50 dark:bg-amber-950/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/30',
            borderColor: daysToDeadline !== null && daysToDeadline <= 7
                ? 'border-red-200 dark:border-red-800/50'
                : daysToDeadline !== null && daysToDeadline <= 30
                    ? 'border-amber-200 dark:border-amber-800/50'
                    : 'border-emerald-200 dark:border-emerald-800/50',
            urgent: daysToDeadline !== null && daysToDeadline <= 7,
        },
        {
            title: 'Completion Rate',
            value: `${completionPercentage}%`,
            icon: TrendingUp,
            iconColor: 'text-accent-500',
            bgColor: 'bg-accent-50 dark:bg-accent-950/30',
            borderColor: 'border-accent-200 dark:border-accent-800/50',
            showProgress: true,
            progress: completionPercentage,
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: Target,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-950/30',
            borderColor: 'border-purple-200 dark:border-purple-800/50',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className={`
            relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
            ${card.bgColor} ${card.borderColor}
            hover:shadow-lg hover:scale-[1.02] cursor-default
          `}
                    style={{
                        animationDelay: `${index * 80}ms`,
                        animation: 'fadeIn 0.5s ease-out forwards',
                        opacity: 0,
                    }}
                >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none">
                        <div className={`absolute inset-0 rounded-full blur-2xl ${card.iconColor.replace('text-', 'bg-')}`}
                            style={{ transform: 'translate(30%, -30%)' }}
                        />
                    </div>

                    {/* Urgent pulse indicator */}
                    {card.urgent && (
                        <div className="absolute top-4 right-4">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </div>
                    )}

                    <div className="relative">
                        <div className={`inline-flex p-3 rounded-xl ${card.bgColor} mb-4`}>
                            <card.icon className={`w-6 h-6 ${card.iconColor}`} strokeWidth={2} />
                        </div>

                        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">
                            {card.title}
                        </p>

                        <p className={`text-4xl font-bold tracking-tight ${card.iconColor.replace('text-', 'text-').replace('-500', '-700')} dark:${card.iconColor}`}>
                            {card.value}
                        </p>

                        {card.subtitle && (
                            <p className="text-xs text-surface-400 dark:text-surface-500 mt-2 truncate font-medium">
                                {card.subtitle}
                            </p>
                        )}

                        {card.showProgress && (
                            <div className="mt-4">
                                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-400 to-primary-500 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${card.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

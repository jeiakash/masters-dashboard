import { useState } from 'react';
import { Plus, Check, Circle, Trash2, BookOpen, Target, Languages, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { usePreparation } from '../hooks/usePreparation';

const PREP_TYPES = [
    { key: 'german', label: 'German Language', icon: Languages, color: 'amber', description: 'A1 → B2 courses' },
    { key: 'gre', label: 'GRE Preparation', icon: Target, color: 'blue', description: 'Target: 320+' },
    { key: 'ielts', label: 'IELTS Preparation', icon: BookOpen, color: 'emerald', description: 'Target: 7.0+' },
];

function PrepSection({ type, items, onToggle, onDelete, onAdd, color }) {
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [expanded, setExpanded] = useState(true);

    const completed = items.filter(i => i.completed).length;
    const total = items.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        await onAdd({
            type: type.key,
            title: newTitle,
            target_date: newDate || null,
        });
        setNewTitle('');
        setNewDate('');
        setShowForm(false);
    };

    const colorClasses = {
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800/50',
            text: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            progress: 'from-amber-400 to-amber-600',
        },
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800/50',
            text: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            progress: 'from-blue-400 to-blue-600',
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            border: 'border-emerald-200 dark:border-emerald-800/50',
            text: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            progress: 'from-emerald-400 to-emerald-600',
        },
    }[color];

    const Icon = type.icon;

    return (
        <div className={`rounded-2xl border overflow-hidden ${colorClasses.bg} ${colorClasses.border}`}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colorClasses.iconBg}`}>
                        <Icon className={`w-6 h-6 ${colorClasses.text}`} strokeWidth={2} />
                    </div>
                    <div className="text-left">
                        <h3 className={`font-bold text-lg ${colorClasses.text}`}>{type.label}</h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400">{type.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className={`text-2xl font-bold ${colorClasses.text}`}>
                            {completed}/{total}
                        </p>
                        <p className="text-xs text-surface-400">milestones</p>
                    </div>
                    {expanded
                        ? <ChevronUp className="w-5 h-5 text-surface-400" />
                        : <ChevronDown className="w-5 h-5 text-surface-400" />
                    }
                </div>
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-3">
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/50 dark:bg-surface-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${colorClasses.progress} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    {/* Items list */}
                    {items.length === 0 ? (
                        <p className="text-center text-sm text-surface-400 dark:text-surface-500 py-4">
                            No milestones yet. Add your first goal below.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className={`
                    flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-surface-800/60 
                    border border-surface-200/50 dark:border-surface-700/50
                    ${item.completed ? 'opacity-60' : ''}
                  `}
                                >
                                    <button
                                        onClick={() => onToggle(item.id)}
                                        className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all
                      ${item.completed
                                                ? `${colorClasses.iconBg} ${colorClasses.text}`
                                                : 'bg-surface-200 dark:bg-surface-700'
                                            }
                    `}
                                    >
                                        {item.completed
                                            ? <Check className="w-4 h-4" strokeWidth={3} />
                                            : <Circle className="w-4 h-4 text-surface-400" strokeWidth={2} />
                                        }
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium ${item.completed ? 'line-through text-surface-400' : 'text-surface-800 dark:text-surface-200'}`}>
                                            {item.title}
                                        </p>
                                        {item.target_date && (
                                            <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add form */}
                    {showForm ? (
                        <form onSubmit={handleAdd} className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Milestone title..."
                                className="flex-1 input-field py-2 text-sm"
                                autoFocus
                            />
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="input-field py-2 text-sm w-36"
                            />
                            <button type="submit" className="btn-primary py-2 px-4 text-sm">Add</button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-secondary py-2 px-3 text-sm"
                            >
                                ✕
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className={`w-full py-2.5 rounded-xl border-2 border-dashed ${colorClasses.border} ${colorClasses.text} font-medium text-sm hover:bg-white/50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2`}
                        >
                            <Plus className="w-4 h-4" />
                            Add Milestone
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PreparationTracker() {
    const { grouped, loading, error, addItem, toggleItem, deleteItem } = usePreparation();

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
                    <div className="h-24 bg-surface-200 dark:bg-surface-700 rounded-xl" />
                    <div className="h-24 bg-surface-200 dark:bg-surface-700 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6">
                <p className="text-red-500">Error loading preparation data: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                    Preparation Tracker
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                    Track your progress
                </p>
            </div>

            <div className="space-y-4">
                {PREP_TYPES.map(type => (
                    <PrepSection
                        key={type.key}
                        type={type}
                        items={grouped[type.key] || []}
                        color={type.color}
                        onToggle={toggleItem}
                        onDelete={deleteItem}
                        onAdd={addItem}
                    />
                ))}
            </div>
        </div>
    );
}

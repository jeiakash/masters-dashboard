import { Check, Circle } from 'lucide-react';

const DOCUMENTS = [
    { key: 'gre', label: 'GRE', description: 'Graduate Record Exam' },
    { key: 'toefl_ielts', label: 'TOEFL/IELTS', description: 'English Proficiency' },
    { key: 'lors', label: 'LORs', description: 'Letters of Recommendation' },
    { key: 'sop', label: 'SOP', description: 'Statement of Purpose' },
    { key: 'transcript', label: 'Transcript', description: 'Academic Records' },
];

export default function DocumentChecklist({ documents, onUpdate }) {
    const completedCount = documents
        ? Object.values(documents).filter(Boolean).length
        : 0;

    const handleToggle = (key) => {
        onUpdate({ [key]: !documents?.[key] });
    };

    const percentage = (completedCount / DOCUMENTS.length) * 100;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                        Required Documents
                    </h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                        Track your document preparation progress
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {completedCount}/{DOCUMENTS.length}
                        </p>
                        <p className="text-xs text-surface-400 dark:text-surface-500">complete</p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
                <div className="w-full h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {/* Progress milestones */}
                <div className="absolute inset-x-0 top-0 h-3 flex items-center justify-between px-0.5 pointer-events-none">
                    {DOCUMENTS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${i < completedCount
                                    ? 'bg-white shadow-sm'
                                    : 'bg-surface-300 dark:bg-surface-600'
                                }`}
                            style={{ marginLeft: i === 0 ? '' : 'auto', marginRight: i === DOCUMENTS.length - 1 ? '' : '' }}
                        />
                    ))}
                </div>
            </div>

            {/* Document items */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {DOCUMENTS.map(doc => {
                    const isComplete = documents?.[doc.key];
                    return (
                        <button
                            key={doc.key}
                            onClick={() => handleToggle(doc.key)}
                            className={`
                relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 group
                ${isComplete
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                                }
              `}
                        >
                            {/* Checkbox indicator */}
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-200
                ${isComplete
                                    ? 'bg-primary-500 shadow-lg shadow-primary-500/30'
                                    : 'bg-surface-200 dark:bg-surface-700 group-hover:bg-surface-300 dark:group-hover:bg-surface-600'
                                }
              `}>
                                {isComplete ? (
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                ) : (
                                    <Circle className="w-4 h-4 text-surface-400 dark:text-surface-500" strokeWidth={2} />
                                )}
                            </div>

                            <span className={`text-sm font-semibold text-center transition-colors ${isComplete
                                    ? 'text-primary-700 dark:text-primary-400'
                                    : 'text-surface-700 dark:text-surface-300'
                                }`}>
                                {doc.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

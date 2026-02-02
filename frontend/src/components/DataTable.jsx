import { useState } from 'react';
import { Search, Filter, Trash2, Edit2, ChevronDown, X, MoreHorizontal, ExternalLink } from 'lucide-react';
import DocumentChecklist from './DocumentChecklist';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Submitted', 'Interview', 'Result'];
const COUNTRY_OPTIONS = ['Germany', 'Switzerland'];

function StatusBadge({ status }) {
    const statusClass = {
        'Not Started': 'status-not-started',
        'In Progress': 'status-in-progress',
        'Submitted': 'status-submitted',
        'Interview': 'status-interview',
        'Result': 'status-result',
    }[status] || 'status-not-started';

    return (
        <span className={`status-badge ${statusClass}`}>
            {status}
        </span>
    );
}

function CountryFlag({ country }) {
    const flag = country === 'Germany' ? '🇩🇪' : '🇨🇭';
    return <span className="text-lg">{flag}</span>;
}

export default function DataTable({
    applications,
    filters,
    onFilterChange,
    onDelete,
    onEdit,
    onUpdateDocuments,
    onUpdateStatus
}) {
    const [expandedRow, setExpandedRow] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysUntil = (dateStr) => {
        const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: 'Passed', class: 'text-surface-400', badge: 'bg-surface-100 dark:bg-surface-800' };
        if (days === 0) return { text: 'Today!', class: 'text-red-600 dark:text-red-400 font-bold', badge: 'bg-red-100 dark:bg-red-900/40' };
        if (days <= 7) return { text: `${days}d`, class: 'text-red-600 dark:text-red-400', badge: 'bg-red-50 dark:bg-red-900/30' };
        if (days <= 30) return { text: `${days}d`, class: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 dark:bg-amber-900/30' };
        return { text: `${days}d`, class: 'text-surface-500 dark:text-surface-400', badge: '' };
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-surface-200 dark:border-surface-800">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search universities or programs..."
                            value={filters.search}
                            onChange={(e) => onFilterChange({ search: e.target.value })}
                            className="input-field pl-11 py-2.5"
                        />
                    </div>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 px-4 ${showFilters || filters.country || filters.status
                                ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950/30'
                                : ''
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        {(filters.country || filters.status) && (
                            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                                {[filters.country, filters.status].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter dropdowns */}
                {showFilters && (
                    <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
                        <select
                            value={filters.country}
                            onChange={(e) => onFilterChange({ country: e.target.value })}
                            className="input-field w-auto py-2 px-3 text-sm"
                        >
                            <option value="">All Countries</option>
                            {COUNTRY_OPTIONS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange({ status: e.target.value })}
                            className="input-field w-auto py-2 px-3 text-sm"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        {(filters.country || filters.status) && (
                            <button
                                onClick={() => onFilterChange({ country: '', status: '' })}
                                className="btn-secondary text-red-500 dark:text-red-400 py-2 px-3 text-sm flex items-center gap-1.5"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-surface-50 dark:bg-surface-900/50">
                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                University / Program
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                Country
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                Deadline
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                Documents
                            </th>
                            <th className="px-5 py-4 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-16 text-center">
                                    <p className="text-surface-400 dark:text-surface-500">No applications found</p>
                                    <p className="text-surface-300 dark:text-surface-600 text-sm mt-1">
                                        Add your first application to get started
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            applications.map((app, index) => {
                                const daysInfo = getDaysUntil(app.deadline);
                                const isExpanded = expandedRow === app.id;
                                const docCount = app.documents
                                    ? Object.values(app.documents).filter(Boolean).length
                                    : 0;

                                return (
                                    <>
                                        <tr
                                            key={app.id}
                                            className="group hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                                            onClick={() => setExpandedRow(isExpanded ? null : app.id)}
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                                animation: 'fadeIn 0.3s ease-out forwards',
                                                opacity: 0,
                                            }}
                                        >
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                        {app.university_name}
                                                    </p>
                                                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                                                        {app.program_name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <CountryFlag country={app.country} />
                                                    <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                                                        {app.country}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                                                        {formatDate(app.deadline)}
                                                    </p>
                                                    <span className={`inline-flex items-center text-xs font-semibold mt-1 px-2 py-0.5 rounded ${daysInfo.badge} ${daysInfo.class}`}>
                                                        {daysInfo.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(app.id, e.target.value);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-sm font-medium bg-transparent border-0 cursor-pointer focus:ring-0 p-0 pr-6 appearance-none text-surface-700 dark:text-surface-200"
                                                    style={{ backgroundImage: 'none' }}
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out rounded-full"
                                                            style={{ width: `${(docCount / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 w-8">
                                                        {docCount}/5
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(app);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete this application?')) {
                                                                onDelete(app.id);
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-surface-300 dark:text-surface-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${app.id}-expanded`}>
                                                <td colSpan={6} className="px-5 py-5 bg-surface-50 dark:bg-surface-900/30 border-t border-surface-100 dark:border-surface-800">
                                                    <DocumentChecklist
                                                        documents={app.documents}
                                                        onUpdate={(docs) => onUpdateDocuments(app.id, docs)}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

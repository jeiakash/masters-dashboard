import { useState } from 'react';
import { Plus, Star, StarOff, Trash2, ExternalLink, Edit2, X, MapPin, Trophy, DollarSign, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { useResearch } from '../hooks/useResearch';

const STATUS_COLORS = {
    Researching: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    Shortlisted: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    Applied: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    Rejected: { bg: 'bg-surface-100 dark:bg-surface-800', text: 'text-surface-500 dark:text-surface-400', border: 'border-surface-200 dark:border-surface-700' },
};

function ResearchCard({ item, onShortlist, onDelete, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    const isShortlisted = item.status === 'Shortlisted';
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.Researching;

    return (
        <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${colors.border} ${colors.bg}`}>
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.country === 'Germany' ? '🇩🇪' : '🇨🇭'}</span>
                            <h3 className="font-bold text-surface-900 dark:text-white truncate">
                                {item.university_name}
                            </h3>
                        </div>
                        <p className="text-sm text-surface-600 dark:text-surface-300 truncate">
                            {item.program_name}
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onShortlist(item.id, isShortlisted ? 'Researching' : 'Shortlisted')}
                            className={`p-2 rounded-lg transition-colors ${isShortlisted
                                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-500'
                                : 'hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400'
                                }`}
                            title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                            {isShortlisted ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 transition-colors"
                        >
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    {item.ranking && (
                        <span className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                            <Trophy className="w-3.5 h-3.5" />
                            Rank #{item.ranking}
                        </span>
                    )}
                    {item.tuition_fees && (
                        <span className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            {item.tuition_fees}
                        </span>
                    )}
                    {item.website && (
                        <a
                            href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Website
                        </a>
                    )}
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 pt-2 border-t border-surface-200/50 dark:border-surface-700/50 space-y-3">
                    {item.requirements && (
                        <div>
                            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1">Requirements</p>
                            <p className="text-sm text-surface-700 dark:text-surface-300">{item.requirements}</p>
                        </div>
                    )}
                    {item.notes && (
                        <div>
                            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-sm text-surface-700 dark:text-surface-300">{item.notes}</p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="flex-1 py-2 text-sm font-medium rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-600 dark:text-surface-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Delete this research item?')) onDelete(item.id);
                            }}
                            className="py-2 px-4 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddResearchForm({ onAdd, onClose }) {
    const [formData, setFormData] = useState({
        university_name: '',
        program_name: '',
        country: 'Germany',
        website: '',
        ranking: '',
        tuition_fees: '',
        requirements: '',
        notes: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onAdd({
            ...formData,
            ranking: formData.ranking ? parseInt(formData.ranking) : null,
        });
        onClose();
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-surface-900 dark:text-white">Add University/Program</h3>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                    <X className="w-5 h-5 text-surface-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="University Name *"
                        value={formData.university_name}
                        onChange={(e) => setFormData(d => ({ ...d, university_name: e.target.value }))}
                        className="input-field"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Program Name *"
                        value={formData.program_name}
                        onChange={(e) => setFormData(d => ({ ...d, program_name: e.target.value }))}
                        className="input-field"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select
                        value={formData.country}
                        onChange={(e) => setFormData(d => ({ ...d, country: e.target.value }))}
                        className="input-field"
                    >
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="Switzerland">🇨🇭 Switzerland</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Ranking"
                        value={formData.ranking}
                        onChange={(e) => setFormData(d => ({ ...d, ranking: e.target.value }))}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Tuition Fees"
                        value={formData.tuition_fees}
                        onChange={(e) => setFormData(d => ({ ...d, tuition_fees: e.target.value }))}
                        className="input-field"
                    />
                </div>

                <input
                    type="url"
                    placeholder="Program Website URL"
                    value={formData.website}
                    onChange={(e) => setFormData(d => ({ ...d, website: e.target.value }))}
                    className="input-field"
                />

                <textarea
                    placeholder="Requirements (GRE, IELTS, GPA, etc.)"
                    value={formData.requirements}
                    onChange={(e) => setFormData(d => ({ ...d, requirements: e.target.value }))}
                    className="input-field min-h-[80px]"
                />

                <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(d => ({ ...d, notes: e.target.value }))}
                    className="input-field min-h-[60px]"
                />

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1">
                        Add to Research
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ResearchTracker() {
    const { items, grouped, stats, loading, addItem, updateStatus, deleteItem } = useResearch();
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    // Filter items
    const filteredItems = items.filter(item => {
        if (filter !== 'all' && item.country !== filter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return item.university_name.toLowerCase().includes(q) ||
                item.program_name.toLowerCase().includes(q);
        }
        return true;
    });

    const shortlisted = filteredItems.filter(i => i.status === 'Shortlisted');
    const researching = filteredItems.filter(i => i.status === 'Researching');

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse h-12 bg-surface-200 dark:bg-surface-700 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-32 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                        Research Universities & Programs
                    </h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                        {stats.total} programs tracked • {stats.shortlisted} shortlisted
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Program
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <AddResearchForm onAdd={addItem} onClose={() => setShowForm(false)} />
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search universities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 py-2.5"
                    />
                </div>

                <div className="flex rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                    {['all', 'Germany', 'Switzerland'].map(c => (
                        <button
                            key={c}
                            onClick={() => setFilter(c)}
                            className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === c
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'
                                }`}
                        >
                            {c === 'all' ? 'All' : c === 'Germany' ? '🇩🇪 Germany' : '🇨🇭 Switzerland'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
                <div className="text-center py-16 glass-card">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                        <Search className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                        Start Your Research
                    </h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-md mx-auto">
                        Add universities and programs you're interested in. Track requirements, rankings, and shortlist your favorites.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Program
                    </button>
                </div>
            )}

            {/* Shortlisted */}
            {shortlisted.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 fill-current" />
                        Shortlisted ({shortlisted.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shortlisted.map(item => (
                            <ResearchCard
                                key={item.id}
                                item={item}
                                onShortlist={updateStatus}
                                onDelete={deleteItem}
                                onEdit={setEditingItem}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Researching */}
            {researching.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-surface-700 dark:text-surface-300 mb-3">
                        Researching ({researching.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {researching.map(item => (
                            <ResearchCard
                                key={item.id}
                                item={item}
                                onShortlist={updateStatus}
                                onDelete={deleteItem}
                                onEdit={setEditingItem}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

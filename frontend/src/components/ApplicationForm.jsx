import { useState } from 'react';
import { X, Calendar, Building2, GraduationCap, Globe, FileText } from 'lucide-react';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Submitted', 'Interview', 'Result'];
const COUNTRY_OPTIONS = ['Germany', 'Switzerland'];

export default function ApplicationForm({ isOpen, onClose, onSubmit, initialData }) {
    const isEdit = !!initialData?.id;

    const [formData, setFormData] = useState({
        university_name: initialData?.university_name || '',
        program_name: initialData?.program_name || '',
        country: initialData?.country || 'Germany',
        deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : '',
        status: initialData?.status || 'Not Started',
        notes: initialData?.notes || '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.university_name.trim()) {
            newErrors.university_name = 'Required';
        }
        if (!formData.program_name.trim()) {
            newErrors.program_name = 'Required';
        }
        if (!formData.deadline) {
            newErrors.deadline = 'Required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-surface-900/60 dark:bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800"
                style={{ animation: 'slideUp 0.3s ease-out forwards' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
                            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                                {isEdit ? 'Edit Application' : 'New Application'}
                            </h2>
                            <p className="text-xs text-surface-500 dark:text-surface-400">
                                {isEdit ? 'Update application details' : 'Add a new university application'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errors.submit && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* University Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            <Building2 className="w-4 h-4 text-surface-400" />
                            University Name
                            {errors.university_name && <span className="text-red-500 text-xs ml-auto">{errors.university_name}</span>}
                        </label>
                        <input
                            type="text"
                            value={formData.university_name}
                            onChange={(e) => handleChange('university_name', e.target.value)}
                            placeholder="e.g., Technical University of Munich"
                            className={`input-field ${errors.university_name ? 'border-red-400 dark:border-red-600' : ''}`}
                        />
                    </div>

                    {/* Program Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            <GraduationCap className="w-4 h-4 text-surface-400" />
                            Program Name
                            {errors.program_name && <span className="text-red-500 text-xs ml-auto">{errors.program_name}</span>}
                        </label>
                        <input
                            type="text"
                            value={formData.program_name}
                            onChange={(e) => handleChange('program_name', e.target.value)}
                            placeholder="e.g., M.Sc. Computer Science"
                            className={`input-field ${errors.program_name ? 'border-red-400 dark:border-red-600' : ''}`}
                        />
                    </div>

                    {/* Country & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                <Globe className="w-4 h-4 text-surface-400" />
                                Country
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="input-field cursor-pointer"
                            >
                                {COUNTRY_OPTIONS.map(c => (
                                    <option key={c} value={c}>{c === 'Germany' ? '🇩🇪 ' : '🇨🇭 '}{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                <Calendar className="w-4 h-4 text-surface-400" />
                                Deadline
                                {errors.deadline && <span className="text-red-500 text-xs ml-auto">{errors.deadline}</span>}
                            </label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                                className={`input-field ${errors.deadline ? 'border-red-400 dark:border-red-600' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 block">
                            Application Status
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {STATUS_OPTIONS.map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleChange('status', status)}
                                    className={`
                    px-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border
                    ${formData.status === status
                                            ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/25'
                                            : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-300 dark:hover:border-primary-700'
                                        }
                  `}
                                >
                                    {status.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            <FileText className="w-4 h-4 text-surface-400" />
                            Notes
                            <span className="text-surface-400 text-xs font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Any additional notes or reminders..."
                            rows={2}
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary py-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary py-3 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { Download, FileDown } from 'lucide-react';

export default function ExportButton({ applications }) {
    const handleExport = () => {
        const data = JSON.stringify(applications, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            disabled={applications.length === 0}
            className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
            title="Export as JSON"
        >
            <Download className="w-5 h-5 text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors" strokeWidth={2} />
        </button>
    );
}

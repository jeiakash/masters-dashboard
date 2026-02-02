import { useState } from 'react';
import { GraduationCap, RefreshCw, Plus, Search, BookOpen, FileText } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { useApplications } from './hooks/useApplications';
import ThemeToggle from './components/ThemeToggle';
import KPICards from './components/KPICards';
import DataTable from './components/DataTable';
import DeadlineCountdown from './components/DeadlineCountdown';
import ApplicationForm from './components/ApplicationForm';
import ExportButton from './components/ExportButton';
import PreparationTracker from './components/PreparationTracker';
import ResearchTracker from './components/ResearchTracker';

const TABS = [
  { key: 'research', label: 'Research', icon: Search, description: 'Find universities & programs' },
  { key: 'prepare', label: 'Prepare', icon: BookOpen, description: 'Track German, GRE & IELTS' },
  { key: 'apply', label: 'Apply', icon: FileText, description: 'Manage applications' },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('research');
  const {
    applications,
    loading,
    error,
    filters,
    stats,
    fetchApplications,
    addApplication,
    updateApplication,
    deleteApplication,
    updateDocuments,
    updateFilters,
  } = useApplications();

  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const handleFormSubmit = async (data) => {
    if (editingApp) {
      await updateApplication(editingApp.id, data);
    } else {
      await addApplication(data);
    }
    setEditingApp(null);
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingApp(null);
  };

  const handleUpdateStatus = async (id, status) => {
    await updateApplication(id, { status });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid-pattern">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/8 dark:bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-accent-500/8 dark:bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] bg-purple-500/6 dark:bg-purple-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-surface-950/80 border-b border-surface-200/60 dark:border-surface-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 py-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl blur-lg opacity-40" />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
                    <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-surface-900 dark:text-white tracking-tight">
                    Master's Journey
                  </h1>
                  <p className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Fall 2027 • Germany & Switzerland
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {activeTab === 'apply' && (
                  <>
                    <button
                      onClick={fetchApplications}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200 group"
                      title="Refresh data"
                    >
                      <RefreshCw className={`w-5 h-5 text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <ExportButton applications={applications} />
                  </>
                )}

                <ThemeToggle />

                {activeTab === 'apply' && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Add Application</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 pb-3">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Research Tab */}
          {activeTab === 'research' && (
            <div className="animate-fade-in">
              <ResearchTracker />
            </div>
          )}

          {/* Prepare Tab */}
          {activeTab === 'prepare' && (
            <div className="animate-fade-in">
              <PreparationTracker />
            </div>
          )}

          {/* Apply Tab */}
          {activeTab === 'apply' && (
            <div className="animate-fade-in">
              {/* Error state */}
              {error && (
                <div className="mb-8 p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                  <p className="font-semibold text-red-700 dark:text-red-400">Connection Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400/80 mt-1">{error}</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && applications.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                    Ready to Apply
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-md mx-auto">
                    Once you've done your research and preparation, add your first application here.
                  </p>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                  >
                    <Plus className="w-5 h-5" />
                    Add Application
                  </button>
                </div>
              )}

              {/* Dashboard content */}
              {(applications.length > 0 || loading) && (
                <>
                  <section className="mb-8">
                    <KPICards stats={stats} />
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DataTable
                        applications={applications}
                        filters={filters}
                        onFilterChange={updateFilters}
                        onDelete={deleteApplication}
                        onEdit={handleEdit}
                        onUpdateDocuments={updateDocuments}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <DeadlineCountdown applications={applications} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-surface-200/60 dark:border-surface-800/60 mt-16 bg-white/50 dark:bg-surface-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-surface-400 dark:text-surface-500">
              Master's Journey Tracker • Fall 2027 Intake
            </p>
          </div>
        </footer>
      </div>

      {/* Application Form Modal */}
      <ApplicationForm
        isOpen={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingApp}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

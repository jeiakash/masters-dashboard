import { useState, useEffect, useCallback } from 'react';
import { applicationsApi } from '../api';

export function useApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        status: '',
    });

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.country) params.country = filters.country;
            if (filters.status) params.status = filters.status;

            const data = await applicationsApi.getAll(params);
            setApplications(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch applications');
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const addApplication = async (data) => {
        try {
            const newApp = await applicationsApi.create(data);
            setApplications(prev => [...prev, newApp].sort((a, b) =>
                new Date(a.deadline) - new Date(b.deadline)
            ));
            return newApp;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to add application');
        }
    };

    const updateApplication = async (id, data) => {
        try {
            const updated = await applicationsApi.update(id, data);
            setApplications(prev => prev.map(app =>
                app.id === id ? updated : app
            ));
            return updated;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to update application');
        }
    };

    const deleteApplication = async (id) => {
        try {
            await applicationsApi.delete(id);
            setApplications(prev => prev.filter(app => app.id !== id));
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to delete application');
        }
    };

    const updateDocuments = async (id, documents) => {
        try {
            await applicationsApi.updateDocuments(id, documents);
            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, documents: { ...app.documents, ...documents } } : app
            ));
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to update documents');
        }
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Computed values
    const stats = {
        total: applications.length,
        completed: applications.filter(app =>
            ['Submitted', 'Interview', 'Result'].includes(app.status)
        ).length,
        inProgress: applications.filter(app => app.status === 'In Progress').length,
        nextDeadline: applications
            .filter(app => new Date(app.deadline) >= new Date())
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0],
    };

    return {
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
    };
}

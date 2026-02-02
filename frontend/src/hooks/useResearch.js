import { useState, useEffect, useCallback } from 'react';
import { researchApi } from '../api';

export function useResearch() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await researchApi.getAll(params);
            setItems(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (data) => {
        const newItem = await researchApi.create(data);
        setItems(prev => [newItem, ...prev]);
        return newItem;
    };

    const updateItem = async (id, data) => {
        const updated = await researchApi.update(id, data);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return updated;
    };

    const updateStatus = async (id, status) => {
        const updated = await researchApi.updateStatus(id, status);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return updated;
    };

    const deleteItem = async (id) => {
        await researchApi.delete(id);
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Group by status
    const grouped = {
        shortlisted: items.filter(i => i.status === 'Shortlisted'),
        researching: items.filter(i => i.status === 'Researching'),
        applied: items.filter(i => i.status === 'Applied'),
        rejected: items.filter(i => i.status === 'Rejected'),
    };

    // Stats
    const stats = {
        total: items.length,
        shortlisted: grouped.shortlisted.length,
        germany: items.filter(i => i.country === 'Germany').length,
        switzerland: items.filter(i => i.country === 'Switzerland').length,
    };

    return {
        items,
        grouped,
        stats,
        loading,
        error,
        fetchItems,
        addItem,
        updateItem,
        updateStatus,
        deleteItem,
    };
}

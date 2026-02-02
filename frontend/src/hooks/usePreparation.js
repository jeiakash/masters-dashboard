import { useState, useEffect, useCallback } from 'react';
import { preparationApi } from '../api';

export function usePreparation() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await preparationApi.getAll();
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
        const newItem = await preparationApi.create(data);
        setItems(prev => [...prev, newItem].sort((a, b) =>
            (a.target_date || '9999') > (b.target_date || '9999') ? 1 : -1
        ));
        return newItem;
    };

    const updateItem = async (id, data) => {
        const updated = await preparationApi.update(id, data);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return updated;
    };

    const toggleItem = async (id) => {
        const updated = await preparationApi.toggle(id);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return updated;
    };

    const deleteItem = async (id) => {
        await preparationApi.delete(id);
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Group items by type
    const grouped = items.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, { german: [], gre: [], ielts: [] });

    // Calculate stats per type
    const stats = Object.keys(grouped).reduce((acc, type) => {
        const typeItems = grouped[type];
        acc[type] = {
            total: typeItems.length,
            completed: typeItems.filter(i => i.completed).length,
            nextTarget: typeItems.find(i => !i.completed && i.target_date)?.target_date || null
        };
        return acc;
    }, {});

    return {
        items,
        grouped,
        stats,
        loading,
        error,
        fetchItems,
        addItem,
        updateItem,
        toggleItem,
        deleteItem,
    };
}

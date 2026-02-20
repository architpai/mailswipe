import { useState, useCallback, useEffect } from 'react';
import { fetchInboxMessages, archiveMessage, trashMessage, keepMessage, untrashMessage, unarchiveMessage, unkeepMessage, ensureMailSwipeLabel } from '../gmail/api';
import { parseEmailHeaders } from '../utils/parser';

export function useEmails(token) {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageToken, setPageToken] = useState(null);
    const [stats, setStats] = useState({ kept: 0, trashed: 0, archived: 0, total: 0 });
    const [keepLabelId, setKeepLabelId] = useState(null);

    // Initialize labels once
    useEffect(() => {
        if (token && !keepLabelId) {
            ensureMailSwipeLabel().then(id => setKeepLabelId(id)).catch(console.error);
        }
    }, [token, keepLabelId]);

    const loadMore = useCallback(async () => {
        if (!token || isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetchInboxMessages(pageToken);
            const parsed = response.messages.map(parseEmailHeaders);
            setEmails(prev => [...prev, ...parsed]);
            setPageToken(response.nextPageToken);
        } catch (err) {
            console.error('Failed to fetch emails', err);
        } finally {
            setIsLoading(false);
        }
    }, [token, pageToken, isLoading]);

    // Initial load
    useEffect(() => {
        if (token && emails.length === 0 && !isLoading && !pageToken) {
            loadMore();
        }
    }, [token, emails.length, isLoading, pageToken, loadMore]);

    // Fetch more if running low
    useEffect(() => {
        if (token && emails.length > 0 && emails.length <= 5 && pageToken && !isLoading) {
            loadMore();
        }
    }, [emails.length, pageToken, isLoading, token, loadMore]);

    const handleAction = async (email, action) => {
        // Optimistic UI update
        setEmails(prev => prev.filter(e => e.id !== email.id));

        setStats(prev => ({
            ...prev,
            [action + 'ed']: (prev[action + 'ed'] || 0) + 1,
            total: prev.total + 1
        }));

        try {
            if (action === 'keep') {
                if (!keepLabelId) throw new Error('Keep label ID not ready');
                await keepMessage(email.id, keepLabelId);
            } else if (action === 'trash') {
                await trashMessage(email.id);
            } else if (action === 'archive') {
                await archiveMessage(email.id);
            }
        } catch (error) {
            console.error(`Failed to ${action} message ${email.id}`, error);
            // Ideally show toast error & queue re-add
        }
    };

    const undoAction = async (email, action) => {
        setEmails(prev => [email, ...prev]);
        setStats(prev => ({
            ...prev,
            [action + 'ed']: Math.max(0, prev[action + 'ed'] - 1),
            total: Math.max(0, prev.total - 1)
        }));
        try {
            if (action === 'keep') {
                if (!keepLabelId) throw new Error('Keep label ID not ready');
                await unkeepMessage(email.id, keepLabelId);
            } else if (action === 'trash') {
                await untrashMessage(email.id);
            } else if (action === 'archive') {
                await unarchiveMessage(email.id);
            }
        } catch (err) {
            console.error('Undo failed:', err);
        }
    };

    return { emails, setEmails, isLoading, stats, loadMore, handleAction, undoAction };
}

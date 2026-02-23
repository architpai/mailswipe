import { useState, useCallback, useEffect } from 'react';
import {
    fetchInboxMessages,
    archiveMessage, trashMessage, keepMessage,
    untrashMessage, unarchiveMessage, unkeepMessage,
    starMessage, unstarMessage,
    markReadMessage, unmarkReadMessage,
    spamMessage, unspamMessage,
    ensureMailSwipeLabel,
} from '../gmail/api';
import { parseEmailHeaders } from '../utils/parser';

export function useEmails(token) {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageToken, setPageToken] = useState(null);
    const [stats, setStats] = useState({ left: 0, up: 0, right: 0, total: 0 });
    const [fetchError, setFetchError] = useState(null);

    // Reset all state when token changes (new login or logout)
    useEffect(() => {
        setEmails([]);
        setPageToken(null);
        setStats({ left: 0, up: 0, right: 0, total: 0 });
        setFetchError(null);
    }, [token]);

    const loadMore = useCallback(async () => {
        if (!token || isLoading) return;
        setIsLoading(true);
        try {
            setFetchError(null);
            const response = await fetchInboxMessages(pageToken);
            const parsed = response.messages.map(parseEmailHeaders);
            setEmails(prev => {
                const existingIds = new Set(prev.map(e => e.id));
                const newEmails = parsed.filter(e => e.id && !existingIds.has(e.id));
                return [...prev, ...newEmails];
            });
            setPageToken(response.nextPageToken);
        } catch (err) {
            console.error('Failed to fetch emails', err);
            setFetchError(err.message || 'Failed to fetch emails');
        } finally {
            setIsLoading(false);
        }
    }, [token, pageToken, isLoading]);

    // Initial load
    useEffect(() => {
        if (token && emails.length === 0 && !isLoading && pageToken === null) {
            loadMore();
        }
    }, [token, emails.length, isLoading, pageToken, loadMore]);

    // Fetch more if running low
    useEffect(() => {
        if (token && emails.length > 0 && emails.length <= 5 && pageToken && !isLoading) {
            loadMore();
        }
    }, [emails.length, pageToken, isLoading, token, loadMore]);

    const handleAction = async (email, direction, actionConfig) => {
        // Optimistic UI update — remove from triage list
        setEmails(prev => prev.filter(e => e.id !== email.id));

        setStats(prev => ({
            ...prev,
            [direction]: (prev[direction] || 0) + 1,
            total: prev.total + 1,
        }));

        try {
            switch (actionConfig.type) {
                case 'trash':
                    await trashMessage(email.id);
                    break;
                case 'archive':
                    await archiveMessage(email.id);
                    break;
                case 'label': {
                    const labelId = await ensureMailSwipeLabel(actionConfig.labelName || 'Kept');
                    await keepMessage(email.id, labelId);
                    break;
                }
                case 'star':
                    await starMessage(email.id);
                    break;
                case 'read':
                    await markReadMessage(email.id);
                    break;
                case 'spam':
                    await spamMessage(email.id);
                    break;
                default:
                    console.warn(`Unknown action type: ${actionConfig.type}`);
            }
        } catch (error) {
            console.error(`Failed to ${actionConfig.type} message ${email.id}`, error);
        }
    };

    const undoAction = async (email, direction, actionConfig) => {
        setEmails(prev => [email, ...prev]);
        setStats(prev => ({
            ...prev,
            [direction]: Math.max(0, (prev[direction] || 0) - 1),
            total: Math.max(0, prev.total - 1),
        }));

        try {
            switch (actionConfig.type) {
                case 'trash':
                    await untrashMessage(email.id);
                    break;
                case 'archive':
                    await unarchiveMessage(email.id);
                    break;
                case 'label': {
                    const labelId = await ensureMailSwipeLabel(actionConfig.labelName || 'Kept');
                    await unkeepMessage(email.id, labelId);
                    break;
                }
                case 'star':
                    await unstarMessage(email.id);
                    break;
                case 'read':
                    await unmarkReadMessage(email.id);
                    break;
                case 'spam':
                    await unspamMessage(email.id);
                    break;
                default:
                    console.warn(`Unknown undo action type: ${actionConfig.type}`);
            }
        } catch (err) {
            console.error('Undo failed:', err);
        }
    };

    return { emails, setEmails, isLoading, stats, loadMore, handleAction, undoAction, fetchError };
}

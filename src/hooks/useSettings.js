import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mailswipe_settings';

export const ACTION_PRESETS = {
    trash:   { label: 'Trash',        pastTense: 'TRASHED',         defaultColor: '#dc2626' },
    archive: { label: 'Archive',      pastTense: 'ARCHIVED',        defaultColor: '#2563eb' },
    label:   { label: 'Custom Label', pastTense: 'LABELED',         defaultColor: '#16a34a' },
    star:    { label: 'Star',         pastTense: 'STARRED',         defaultColor: '#d97706' },
    read:    { label: 'Mark Read',    pastTense: 'MARKED READ',     defaultColor: '#475569' },
    spam:    { label: 'Spam',         pastTense: 'MARKED AS SPAM',  defaultColor: '#ea580c' },
};

export const COLOR_PALETTE = [
    { value: '#dc2626', name: 'Red' },
    { value: '#2563eb', name: 'Blue' },
    { value: '#16a34a', name: 'Green' },
    { value: '#d97706', name: 'Amber' },
    { value: '#7c3aed', name: 'Violet' },
    { value: '#475569', name: 'Slate' },
    { value: '#ea580c', name: 'Orange' },
    { value: '#0d9488', name: 'Teal' },
    { value: '#e11d48', name: 'Rose' },
    { value: '#000000', name: 'Black' },
];

export const DEFAULT_SETTINGS = {
    swipeActions: {
        left:  { type: 'trash',   color: '#dc2626' },
        up:    { type: 'archive', color: '#2563eb' },
        right: { type: 'label',   color: '#16a34a', labelName: 'Kept' },
    },
};

export function getActionLabel(actionConfig) {
    if (actionConfig.type === 'label') {
        return actionConfig.labelName || 'Custom Label';
    }
    const preset = ACTION_PRESETS[actionConfig.type];
    return preset ? preset.label : actionConfig.type;
}

export function getActionPastTense(actionConfig) {
    if (actionConfig.type === 'label') {
        const name = actionConfig.labelName || 'Custom Label';
        return `LABELED "${name}"`;
    }
    const preset = ACTION_PRESETS[actionConfig.type];
    return preset ? preset.pastTense : actionConfig.type.toUpperCase();
}

function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge with defaults so new keys are always present
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                swipeActions: {
                    ...DEFAULT_SETTINGS.swipeActions,
                    ...(parsed.swipeActions || {}),
                },
            };
        }
    } catch (err) {
        console.error('Failed to load settings from localStorage', err);
    }
    return DEFAULT_SETTINGS;
}

export function useSettings() {
    const [settings, setSettings] = useState(loadSettings);

    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const merged = {
                ...prev,
                ...newSettings,
                swipeActions: {
                    ...prev.swipeActions,
                    ...(newSettings.swipeActions || {}),
                },
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (err) {
                console.error('Failed to save settings to localStorage', err);
            }
            return merged;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        } catch (err) {
            console.error('Failed to reset settings in localStorage', err);
        }
    }, []);

    return { settings, updateSettings, resetSettings };
}

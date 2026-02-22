import { useState, useEffect, useRef, useCallback } from 'react';

export function useML() {
    const worker = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [mlStatus, setMlStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'failed'
    const [mlProgress, setMlProgress] = useState({ stage: '', percent: 0, file: '' });
    const processingRef = useRef(new Set());
    const setEmailsCallback = useRef(null);
    const modelsLoaded = useRef({ classifier: false, summarizer: false });

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../ml/worker.js', import.meta.url), {
                type: 'module'
            });

            // Track per-file progress for overall calculation
            const fileProgress = {};

            worker.current.addEventListener('message', (e) => {
                const { status, result, id, data } = e.data;

                if (status === 'READY') {
                    setIsReady(true);
                } else if (status === 'LOADING_CLASSIFIER' || status === 'LOADING_SUMMARIZER') {
                    setMlStatus('loading');
                    const isClassifier = status === 'LOADING_CLASSIFIER';
                    const stageLabel = isClassifier ? 'Classification model' : 'Summarization model';
                    // Classifier = 0-50%, Summarizer = 50-100%
                    const stageOffset = isClassifier ? 0 : 50;

                    if (data) {
                        const fileKey = `${status}:${data.file || ''}`;

                        if (data.status === 'progress' && data.total > 0) {
                            fileProgress[fileKey] = (data.loaded / data.total) * 50;
                        } else if (data.status === 'done') {
                            fileProgress[fileKey] = 50;
                        } else if (data.status === 'ready') {
                            if (isClassifier) modelsLoaded.current.classifier = true;
                            else modelsLoaded.current.summarizer = true;
                        }

                        // Sum all file progress contributions for this stage
                        const stageFiles = Object.keys(fileProgress).filter(k => k.startsWith(status));
                        const stageTotal = stageFiles.length > 0
                            ? stageFiles.reduce((sum, k) => sum + fileProgress[k], 0) / stageFiles.length
                            : 0;

                        const overall = Math.round(stageOffset + stageTotal);
                        const fileBasename = (data.file || '').split('/').pop() || '';
                        setMlProgress({ stage: stageLabel, percent: Math.min(99, overall), file: fileBasename });
                    }
                } else if (status === 'MODELS_LOADED') {
                    setMlStatus('ready');
                    setMlProgress({ stage: 'Ready', percent: 100, file: '' });
                } else if (status === 'MODELS_FAILED') {
                    setMlStatus('failed');
                    setMlProgress({ stage: 'Rule-based tagging', percent: 100, file: '' });
                } else if (status === 'SUCCESS') {
                    processingRef.current.delete(id);

                    if (setEmailsCallback.current && result) {
                        setEmailsCallback.current(prev =>
                            prev.map(email => email.id === id
                                ? { ...email, mlTag: result.mlTag?.toUpperCase(), mlSummary: result.mlSummary }
                                : email
                            )
                        );
                    }
                }
            });

            worker.current.postMessage({ action: 'PING' });
        }

        return () => {
            if (worker.current) {
                worker.current.terminate();
                worker.current = null;
            }
        };
    }, []);

    const analyzeEmails = useCallback((emailsToAnalyze, updateEmailsState) => {
        setEmailsCallback.current = updateEmailsState;
        if (!worker.current) return;

        const unprocessed = emailsToAnalyze.filter(e => !e.mlTag && !processingRef.current.has(e.id));

        unprocessed.forEach(email => {
            processingRef.current.add(email.id);
            worker.current.postMessage({
                action: 'PROCESS_EMAIL',
                id: email.id,
                payload: { email }
            });
        });
    }, []);

    return { isReady, mlStatus, mlProgress, analyzeEmails };
}

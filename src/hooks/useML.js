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

            worker.current.addEventListener('message', (e) => {
                const { status, result, id, data } = e.data;

                if (status === 'READY') {
                    setIsReady(true);
                } else if (status === 'LOADING_CLASSIFIER' || status === 'LOADING_SUMMARIZER') {
                    setMlStatus('loading');

                    // Transformers.js progress_callback sends: { status, name, file, loaded, total, progress }
                    if (data) {
                        const stage = status === 'LOADING_CLASSIFIER' ? 'classifier' : 'summarizer';
                        const stageLabel = stage === 'classifier' ? 'Classification model' : 'Summarization model';

                        if (data.status === 'progress' && data.total > 0) {
                            const fileBasename = (data.file || '').split('/').pop() || data.file;
                            setMlProgress({
                                stage: stageLabel,
                                percent: Math.round((data.loaded / data.total) * 100),
                                file: fileBasename,
                            });
                        } else if (data.status === 'initiate') {
                            const fileBasename = (data.file || '').split('/').pop() || data.file;
                            setMlProgress({
                                stage: stageLabel,
                                percent: 0,
                                file: fileBasename,
                            });
                        } else if (data.status === 'done') {
                            // Individual file done
                        } else if (data.status === 'ready') {
                            // Pipeline ready
                            if (stage === 'classifier') modelsLoaded.current.classifier = true;
                            if (stage === 'summarizer') modelsLoaded.current.summarizer = true;
                        }
                    }
                } else if (status === 'MODELS_LOADED') {
                    setMlStatus('ready');
                    setMlProgress({ stage: 'Ready', percent: 100, file: '' });
                } else if (status === 'MODELS_FAILED') {
                    setMlStatus('failed');
                    setMlProgress({ stage: 'Using rule-based tagging', percent: 0, file: '' });
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

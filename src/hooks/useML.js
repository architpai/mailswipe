import { useState, useEffect, useRef, useCallback } from 'react';

export function useML() {
    const worker = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [queue, setQueue] = useState([]); // emails waiting to be processed
    const processingRef = useRef(new Set());
    const setEmailsCallback = useRef(null);

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../ml/worker.js', import.meta.url), {
                type: 'module'
            });

            worker.current.addEventListener('message', (e) => {
                const { status, result, id } = e.data;

                if (status === 'READY') {
                    setIsReady(true);
                    // Initial ping returned, means worker is spun up but pipelines might load later
                } else if (status === 'LOADING_CLASSIFIER' || status === 'LOADING_SUMMARIZER') {
                    setIsLoading(true);
                } else if (status === 'SUCCESS') {
                    setIsLoading(false);
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

        // Only send ones that haven't been tagged or aren't already processing
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

    return { isReady, isLoading, analyzeEmails };
}

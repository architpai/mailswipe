import { pipeline, env } from '@xenova/transformers';

// Serve models from local public/models/ directory
env.localModelPath = '/models/';
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = true;

// Suppress ONNX Runtime warnings (benign "unused initializer" messages)
if (typeof env.backends?.onnx?.logLevel !== 'undefined') {
    env.backends.onnx.logLevel = 'error';
}


// Use promises as mutex to prevent concurrent pipeline loading attempts
let classifierPromise = null;
let summarizerPromise = null;
let classifierFailed = false;
let summarizerFailed = false;

async function getClassificationPipeline(progressCallback) {
    if (classifierFailed) return null;
    if (classifierPromise) return classifierPromise;

    classifierPromise = pipeline(
        'zero-shot-classification',
        'Xenova/nli-deberta-v3-small',
        { progress_callback: progressCallback, quantized: true }
    ).catch(err => {
        console.warn('Classification pipeline failed to load:', err.message);
        classifierFailed = true;
        classifierPromise = null;
        return null;
    });

    return classifierPromise;
}

async function getSummarizationPipeline(progressCallback) {
    if (summarizerFailed) return null;
    if (summarizerPromise) return summarizerPromise;

    summarizerPromise = pipeline(
        'summarization',
        'Xenova/distilbart-cnn-6-6',
        { progress_callback: progressCallback, quantized: true }
    ).catch(err => {
        console.warn('Summarization pipeline failed to load:', err.message);
        summarizerFailed = true;
        summarizerPromise = null;
        return null;
    });

    return summarizerPromise;
}

// Rule-based fallback
const classifyRuleBased = (email) => {
    const subject = (email.subject || '').toLowerCase();
    const snippet = (email.snippet || '').toLowerCase();
    const listUnsub = email.unsubscribeLink || '';

    if (listUnsub || subject.includes('newsletter') || subject.includes('digest') || subject.includes('weekly')) {
        return 'newsletter';
    }
    if (subject.includes('receipt') || subject.includes('invoice') || subject.includes('order') || subject.includes('confirmation')) {
        return 'receipt';
    }
    if (subject.includes('alert') || subject.includes('warning') || subject.includes('security')) {
        return 'alert';
    }
    if (subject.includes('unsubscribe') || snippet.includes('unsubscribe')) {
        return 'newsletter';
    }
    return 'work';
};

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
    const { action, payload, id } = event.data;

    if (action === 'PING') {
        self.postMessage({ status: 'READY' });
        return;
    }

    if (action === 'PROCESS_EMAIL') {
        const { email } = payload;
        const inputString = (email.subject + " " + (email.snippet || "")).trim().substring(0, 200);

        let tag = classifyRuleBased(email);
        let summary = email.snippet;

        try {
            // 1. Classification
            const classifier = await getClassificationPipeline(x => {
                self.postMessage({ status: 'LOADING_CLASSIFIER', data: x });
            });

            if (classifier) {
                const classificationLabels = ["personal", "work", "newsletter", "receipt", "alert", "spam"];
                const clsResult = await classifier(inputString, classificationLabels);
                if (clsResult && clsResult.labels && clsResult.labels.length > 0) {
                    tag = clsResult.labels[0].toLowerCase();
                }
            }

            // 2. Summarize (only for longer emails)
            if (inputString.length >= 80) {
                const summarizer = await getSummarizationPipeline(x => {
                    self.postMessage({ status: 'LOADING_SUMMARIZER', data: x });
                });

                if (summarizer) {
                    const summaryResult = await summarizer(inputString, {
                        max_new_tokens: 30,
                        min_new_tokens: 5,
                    });
                    if (summaryResult && summaryResult.length > 0) {
                        summary = summaryResult[0].summary_text;
                    }
                }
            }
        } catch (err) {
            console.warn("ML processing error (using rule-based fallback):", err.message);
        }

        // Always send back a result (ML or rule-based)
        self.postMessage({
            status: 'SUCCESS',
            id,
            result: {
                mlTag: tag,
                mlSummary: summary
            }
        });
    }
});

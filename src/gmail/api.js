import { gapi } from 'gapi-script';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];

// Initialize the gapi client that will use the access token provided by GSI
export const initGmailApi = async () => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    discoveryDocs: DISCOVERY_DOCS,
                });
                resolve();
            } catch (error) {
                console.error('Error initializing GAPI client', error);
                reject(error);
            }
        });
    });
};

export const setGmailToken = (token) => {
    gapi.client.setToken({ access_token: token });
};

// Returns a batch of the 50 most recent inbox emails (metadata style)
// Fetch metadata for a chunk of message IDs, filtering out failed responses
const fetchMessageChunk = async (messageIds) => {
    const batch = gapi.client.newBatch();
    messageIds.forEach((id) => {
        batch.add(gapi.client.gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date', 'List-Unsubscribe'],
        }), { id });
    });

    const batchResponse = await batch;
    const succeeded = [];
    const failed = [];

    Object.keys(batchResponse.result).forEach((id) => {
        const item = batchResponse.result[id];
        if (item.result?.id) {
            succeeded.push(item.result);
        } else {
            failed.push(id);
        }
    });

    return { succeeded, failed };
};

const CHUNK_SIZE = 15;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

export const fetchInboxMessages = async (pageToken = '') => {
    try {
        const response = await gapi.client.gmail.users.messages.list({
            userId: 'me',
            q: 'in:inbox',
            maxResults: 50,
            pageToken: pageToken || undefined,
        });

        const messages = response.result.messages || [];
        const nextPageToken = response.result.nextPageToken;

        if (messages.length === 0) return { messages: [], nextPageToken };

        // Fetch metadata in small chunks to avoid 429 rate limiting
        const allIds = messages.map((m) => m.id);
        const allResults = [];

        for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
            const chunkIds = allIds.slice(i, i + CHUNK_SIZE);
            let { succeeded, failed } = await fetchMessageChunk(chunkIds);
            allResults.push(...succeeded);

            // Retry failed IDs with backoff
            for (let retry = 0; retry < MAX_RETRIES && failed.length > 0; retry++) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY * (retry + 1)));
                const retryResult = await fetchMessageChunk(failed);
                allResults.push(...retryResult.succeeded);
                failed = retryResult.failed;
            }

            // Small pause between chunks to stay under rate limit
            if (i + CHUNK_SIZE < allIds.length) {
                await new Promise((r) => setTimeout(r, 300));
            }
        }

        return { messages: allResults, nextPageToken };
    } catch (error) {
        console.error('Error fetching inbox messages:', error);
        throw error;
    }
};

// Fetch the full content of an email (used lazily)
export const fetchFullMessage = async (id) => {
    try {
        const response = await gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: id,
            format: 'full',
        });
        return response.result;
    } catch (error) {
        console.error('Error fetching full message:', error);
        throw error;
    }
};

// MailSwipe actions
export const archiveMessage = async (id) => {
    return gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id,
        removeLabelIds: ['INBOX'],
    });
};

export const trashMessage = async (id) => {
    return gapi.client.gmail.users.messages.trash({
        userId: 'me',
        id,
    });
};

export const keepMessage = async (id, keepLabelId) => {
    return gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id,
        removeLabelIds: ['INBOX'],
        addLabelIds: [keepLabelId],
    });
};

export const untrashMessage = async (id) => {
    return gapi.client.gmail.users.messages.untrash({ userId: 'me', id });
};

export const unarchiveMessage = async (id) => {
    return gapi.client.gmail.users.messages.modify({ userId: 'me', id, addLabelIds: ['INBOX'] });
};

export const unkeepMessage = async (id, keepLabelId) => {
    return gapi.client.gmail.users.messages.modify({ userId: 'me', id, addLabelIds: ['INBOX'], removeLabelIds: [keepLabelId] });
};

export const starMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['STARRED'],
  });
};

export const unstarMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['STARRED'],
  });
};

export const markReadMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['UNREAD'],
  });
};

export const unmarkReadMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['UNREAD'],
  });
};

export const spamMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['SPAM'],
    removeLabelIds: ['INBOX'],
  });
};

export const unspamMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['SPAM'],
    addLabelIds: ['INBOX'],
  });
};

// Ensuring MailSwipe labels exist
const PARENT_LABEL_NAME = 'MailSwipe';
const labelIdCache = {};

const ensureParentLabel = async () => {
  if (labelIdCache[PARENT_LABEL_NAME]) return labelIdCache[PARENT_LABEL_NAME];

  const { result } = await gapi.client.gmail.users.labels.list({ userId: 'me' });
  const labels = result.labels || [];

  let parentLabel = labels.find(l => l.name === PARENT_LABEL_NAME);
  if (!parentLabel) {
    const response = await gapi.client.gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: PARENT_LABEL_NAME,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }
    });
    parentLabel = response.result;
  }

  labelIdCache[PARENT_LABEL_NAME] = parentLabel.id;
  return parentLabel.id;
};

export const ensureMailSwipeLabel = async (childName = 'Kept') => {
  const fullName = `${PARENT_LABEL_NAME}/${childName}`;
  if (labelIdCache[fullName]) return labelIdCache[fullName];

  await ensureParentLabel();

  const { result } = await gapi.client.gmail.users.labels.list({ userId: 'me' });
  const labels = result.labels || [];

  let childLabel = labels.find(l => l.name === fullName);
  if (!childLabel) {
    const response = await gapi.client.gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: fullName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }
    });
    childLabel = response.result;
  }

  labelIdCache[fullName] = childLabel.id;
  return childLabel.id;
};

export const parseEmailHeaders = (message) => {
    const headers = message.payload?.headers || [];

    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

    const subject = getHeader('Subject') || '(No Subject)';

    const rawFrom = getHeader('From') || 'Unknown Sender';
    // Parse "Name <email@example.com>"
    let fromName = rawFrom;
    let fromEmail = rawFrom;
    const match = rawFrom.match(/(.*)<(.*)>/);
    if (match) {
        fromName = match[1].replace(/"/g, '').trim();
        fromEmail = match[2].trim();
    }

    const dateValue = getHeader('Date');
    const dateStr = dateValue ? parseRelativeDate(new Date(dateValue)) : '';

    const listUnsub = getHeader('List-Unsubscribe');
    let unsubscribeLink = null;
    if (listUnsub) {
        // try to extract url from <https://...> or empty string
        const matchUrl = listUnsub.match(/<(https?[^>]+)>/);
        if (matchUrl) unsubscribeLink = matchUrl[1];
    }

    // Basic snippet parsing
    const snippet = message.snippet ? decodeHtmlEntities(message.snippet) : '';

    return {
        id: message.id,
        subject,
        from: { name: fromName || fromEmail, email: fromEmail },
        date: dateStr,
        snippet,
        unsubscribeLink,
        mlTag: null,
        mlSummary: null,
    };
};

const parseRelativeDate = (date) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
        const hours = Math.round((date - new Date()) / (1000 * 60 * 60));
        if (hours === 0) return 'Just now';
        return rtf.format(hours, 'hour');
    }
    if (Math.abs(daysDifference) < 7) {
        return rtf.format(daysDifference, 'day');
    }
    return date.toLocaleDateString();
};

const decodeHtmlEntities = (text) => {
    if (!text) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

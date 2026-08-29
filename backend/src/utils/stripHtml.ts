export const stripHtml = (html: string): string =>
    html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");

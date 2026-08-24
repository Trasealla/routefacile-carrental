/**
 * Build a URL slug from an arbitrary title (English).
 * Lower-case, ASCII-only, hyphen-separated, max 140 chars.
 */
export function slugifyTitle(title: string): string {
    if (!title) return '';
    return title
        .toString()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 140);
}

/** Build a stable, unique slug for a career job: `<slugified-title>-<id>`. */
export function buildJobSlug(title_en: string, id: number | string): string {
    const base = slugifyTitle(title_en) || 'job';
    return `${base}-${id}`;
}

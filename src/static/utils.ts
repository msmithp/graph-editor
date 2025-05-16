export function toTitleCase(s: string): string {
    return s.toLowerCase()
            .split(' ')
            .map(wd => wd.charAt(0).toUpperCase + wd.slice(1))
            .join(' ');
}
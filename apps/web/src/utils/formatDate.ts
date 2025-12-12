/**
 * Formats a date to a relative time string in Spanish
 * @param date - The date to format
 * @returns Relative time string (e.g., "hace 2 horas", "ayer", "hace 3 días")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Just now (less than 1 minute)
  if (diffSeconds < 60) {
    return 'justo ahora';
  }

  // Minutes ago (less than 1 hour)
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'hace 1 minuto' : `hace ${diffMinutes} minutos`;
  }

  // Hours ago (less than 24 hours)
  if (diffHours < 24) {
    return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`;
  }

  // Yesterday
  if (diffDays === 1) {
    return 'ayer';
  }

  // Days ago (less than 7 days)
  if (diffDays < 7) {
    return `hace ${diffDays} días`;
  }

  // Weeks ago (less than 30 days)
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'hace 1 semana' : `hace ${weeks} semanas`;
  }

  // Months ago (less than 365 days)
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
  }

  // Years ago
  const years = Math.floor(diffDays / 365);
  return years === 1 ? 'hace 1 año' : `hace ${years} años`;
}

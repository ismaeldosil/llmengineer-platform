import { formatRelativeTime } from '../formatDate';

describe('formatRelativeTime', () => {
  describe('seconds ago', () => {
    it('returns "justo ahora" for less than 1 minute', () => {
      const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('justo ahora');
    });

    it('returns "justo ahora" for 0 seconds', () => {
      const date = new Date(Date.now());
      expect(formatRelativeTime(date)).toBe('justo ahora');
    });
  });

  describe('minutes ago', () => {
    it('returns "hace 1 minuto" for exactly 1 minute', () => {
      const date = new Date(Date.now() - 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 minuto');
    });

    it('returns "hace X minutos" for multiple minutes', () => {
      const date = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      expect(formatRelativeTime(date)).toBe('hace 15 minutos');
    });

    it('returns "hace 59 minutos" for 59 minutes', () => {
      const date = new Date(Date.now() - 59 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 59 minutos');
    });
  });

  describe('hours ago', () => {
    it('returns "hace 1 hora" for exactly 1 hour', () => {
      const date = new Date(Date.now() - 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 hora');
    });

    it('returns "hace X horas" for multiple hours', () => {
      const date = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours ago
      expect(formatRelativeTime(date)).toBe('hace 4 horas');
    });

    it('returns "hace 23 horas" for 23 hours', () => {
      const date = new Date(Date.now() - 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 23 horas');
    });
  });

  describe('days ago', () => {
    it('returns "ayer" for exactly 1 day', () => {
      const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('ayer');
    });

    it('returns "hace X días" for multiple days', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(formatRelativeTime(date)).toBe('hace 3 días');
    });

    it('returns "hace 6 días" for 6 days', () => {
      const date = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 6 días');
    });
  });

  describe('weeks ago', () => {
    it('returns "hace 1 semana" for 7 days', () => {
      const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 semana');
    });

    it('returns "hace X semanas" for multiple weeks', () => {
      const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 2 weeks ago
      expect(formatRelativeTime(date)).toBe('hace 2 semanas');
    });

    it('returns "hace 4 semanas" for 28 days', () => {
      const date = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 4 semanas');
    });
  });

  describe('months ago', () => {
    it('returns "hace 1 mes" for 30 days', () => {
      const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 mes');
    });

    it('returns "hace X meses" for multiple months', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // ~2 months ago
      expect(formatRelativeTime(date)).toBe('hace 2 meses');
    });

    it('returns "hace 11 meses" for 330 days', () => {
      const date = new Date(Date.now() - 330 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 11 meses');
    });
  });

  describe('years ago', () => {
    it('returns "hace 1 año" for 365 days', () => {
      const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 año');
    });

    it('returns "hace X años" for multiple years', () => {
      const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
      expect(formatRelativeTime(date)).toBe('hace 2 años');
    });

    it('returns "hace 5 años" for 5 years', () => {
      const date = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 5 años');
    });
  });

  describe('edge cases', () => {
    it('handles exact minute boundaries', () => {
      const date = new Date(Date.now() - 1000); // 1 second ago
      expect(formatRelativeTime(date)).toBe('justo ahora');
    });

    it('handles exact hour boundaries', () => {
      const date = new Date(Date.now() - 59 * 60 * 1000 + 1000); // 59 min 59 sec ago
      const result = formatRelativeTime(date);
      expect(result).toMatch(/hace \d+ minutos/);
    });

    it('handles dates at midnight', () => {
      const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('ayer');
    });

    it('handles very old dates', () => {
      const date = new Date(Date.now() - 24 * 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 24 años');
    });
  });

  describe('boundary conditions', () => {
    it('correctly categorizes 60 seconds as 1 minute', () => {
      const date = new Date(Date.now() - 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 minuto');
    });

    it('correctly categorizes 3600 seconds as 1 hour', () => {
      const date = new Date(Date.now() - 3600 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 hora');
    });

    it('correctly categorizes 86400 seconds as 1 day (ayer)', () => {
      const date = new Date(Date.now() - 86400 * 1000);
      expect(formatRelativeTime(date)).toBe('ayer');
    });
  });

  describe('real-world scenarios', () => {
    it('formats a timestamp from 2 hours ago correctly', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 2 horas');
    });

    it('formats a timestamp from yesterday correctly', () => {
      const date = new Date(Date.now() - 25 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('ayer');
    });

    it('formats a timestamp from 5 days ago correctly', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 5 días');
    });

    it('formats a timestamp from 3 weeks ago correctly', () => {
      const date = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 3 semanas');
    });

    it('formats a timestamp from 6 months ago correctly', () => {
      const date = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 6 meses');
    });

    it('formats a timestamp from 1 year ago correctly', () => {
      const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 1 año');
    });
  });
});

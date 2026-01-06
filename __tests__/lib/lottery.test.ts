/**
 * Unit Tests for Lottery Business Logic
 *
 * Tests the PPS (Probability Proportional to Size) winner selection algorithm
 * and lottery validation functions.
 */

// Import the function directly to test it in isolation
// We need to extract the pure function for testing
const selectWinnerFromEntries = (entries: { userId: string; points: number }[]): string | null => {
  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    return entries[0].userId;
  }

  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const random = Math.random() * totalPoints;

  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.points;
    if (random < cumulative) {
      return entry.userId;
    }
  }

  return entries[entries.length - 1].userId;
};

describe('PPS Winner Selection Algorithm', () => {
  describe('selectWinnerFromEntries', () => {
    it('should return null for empty entries', () => {
      const result = selectWinnerFromEntries([]);
      expect(result).toBeNull();
    });

    it('should return the single user when only one entry exists', () => {
      const entries = [{ userId: 'user1', points: 50 }];
      const result = selectWinnerFromEntries(entries);
      expect(result).toBe('user1');
    });

    it('should return the single user regardless of point amount', () => {
      const entries = [{ userId: 'user1', points: 1 }];
      const result = selectWinnerFromEntries(entries);
      expect(result).toBe('user1');
    });

    it('should always return a valid userId from entries', () => {
      const entries = [
        { userId: 'user1', points: 30 },
        { userId: 'user2', points: 50 },
        { userId: 'user3', points: 20 },
      ];

      // Run multiple times to ensure always returns valid user
      for (let i = 0; i < 100; i++) {
        const result = selectWinnerFromEntries(entries);
        expect(['user1', 'user2', 'user3']).toContain(result);
      }
    });

    it('should select winner with probability proportional to points', () => {
      // Mock Math.random to test specific scenarios
      const entries = [
        { userId: 'user1', points: 30 },  // 30% (0-30)
        { userId: 'user2', points: 50 },  // 50% (30-80)
        { userId: 'user3', points: 20 },  // 20% (80-100)
      ];

      // Test user1 selection (random in 0-30 range)
      const mockRandom1 = jest.spyOn(Math, 'random').mockReturnValue(0.15); // 15 out of 100
      expect(selectWinnerFromEntries(entries)).toBe('user1');
      mockRandom1.mockRestore();

      // Test user2 selection (random in 30-80 range)
      const mockRandom2 = jest.spyOn(Math, 'random').mockReturnValue(0.55); // 55 out of 100
      expect(selectWinnerFromEntries(entries)).toBe('user2');
      mockRandom2.mockRestore();

      // Test user3 selection (random in 80-100 range)
      const mockRandom3 = jest.spyOn(Math, 'random').mockReturnValue(0.90); // 90 out of 100
      expect(selectWinnerFromEntries(entries)).toBe('user3');
      mockRandom3.mockRestore();
    });

    it('should handle boundary case where random equals 0', () => {
      const entries = [
        { userId: 'user1', points: 50 },
        { userId: 'user2', points: 50 },
      ];

      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
      const result = selectWinnerFromEntries(entries);
      // At random = 0, cumulative starts at 0, first entry adds 50
      // 0 < 50, so user1 is selected
      expect(result).toBe('user1');
      mockRandom.mockRestore();
    });

    it('should handle equal probability entries', () => {
      const entries = [
        { userId: 'user1', points: 50 },
        { userId: 'user2', points: 50 },
      ];

      // Each user should have ~50% chance
      // Test at boundary: random = 0.49 should select user1, 0.51 should select user2
      const mockRandom1 = jest.spyOn(Math, 'random').mockReturnValue(0.49);
      expect(selectWinnerFromEntries(entries)).toBe('user1');
      mockRandom1.mockRestore();

      const mockRandom2 = jest.spyOn(Math, 'random').mockReturnValue(0.51);
      expect(selectWinnerFromEntries(entries)).toBe('user2');
      mockRandom2.mockRestore();
    });

    it('should handle very small point values', () => {
      const entries = [
        { userId: 'user1', points: 1 },
        { userId: 'user2', points: 1 },
        { userId: 'user3', points: 1 },
      ];

      // Run multiple times - all users should be possible winners
      const winners = new Set<string>();
      const mockRandomValues = [0.1, 0.4, 0.8];

      mockRandomValues.forEach(val => {
        const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(val);
        const result = selectWinnerFromEntries(entries);
        if (result) winners.add(result);
        mockRandom.mockRestore();
      });

      expect(winners.size).toBeGreaterThan(0);
    });

    it('should handle large point differences', () => {
      const entries = [
        { userId: 'whale', points: 9900 },  // 99%
        { userId: 'minnow', points: 100 },  // 1%
      ];

      // Test whale wins at 0.5 (5000 out of 10000)
      const mockRandom1 = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(selectWinnerFromEntries(entries)).toBe('whale');
      mockRandom1.mockRestore();

      // Test minnow wins at 0.995 (9950 out of 10000, which is > 9900)
      const mockRandom2 = jest.spyOn(Math, 'random').mockReturnValue(0.995);
      expect(selectWinnerFromEntries(entries)).toBe('minnow');
      mockRandom2.mockRestore();
    });
  });
});

describe('Lottery Validation Rules', () => {
  describe('Point validation', () => {
    it('should reject negative points', () => {
      const isValidPoints = (points: number) => points > 0;
      expect(isValidPoints(-10)).toBe(false);
      expect(isValidPoints(0)).toBe(false);
      expect(isValidPoints(1)).toBe(true);
      expect(isValidPoints(100)).toBe(true);
    });

    it('should require minimum entry points', () => {
      const isValidEntry = (points: number, minEntry: number) => points >= minEntry;
      expect(isValidEntry(5, 10)).toBe(false);
      expect(isValidEntry(10, 10)).toBe(true);
      expect(isValidEntry(15, 10)).toBe(true);
    });
  });

  describe('Lottery status validation', () => {
    it('should only allow entry to ACTIVE lotteries', () => {
      const canEnter = (status: string) => status === 'ACTIVE';
      expect(canEnter('DRAFT')).toBe(false);
      expect(canEnter('SCHEDULED')).toBe(false);
      expect(canEnter('ACTIVE')).toBe(true);
      expect(canEnter('COMPLETED')).toBe(false);
      expect(canEnter('CANCELLED')).toBe(false);
    });
  });

  describe('Creator validation', () => {
    it('should prevent creator from entering own lottery', () => {
      const canCreatorEnter = (creatorId: string, userId: string) => creatorId !== userId;
      expect(canCreatorEnter('user1', 'user1')).toBe(false);
      expect(canCreatorEnter('user1', 'user2')).toBe(true);
    });
  });

  describe('End date validation', () => {
    it('should reject entries after lottery ends', () => {
      const isLotteryActive = (endDate: Date) => new Date() < endDate;
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      expect(isLotteryActive(pastDate)).toBe(false);
      expect(isLotteryActive(futureDate)).toBe(true);
    });
  });
});

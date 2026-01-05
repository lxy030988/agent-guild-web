import { formatEther, parseEther } from 'viem';

describe('Red Packet Utils', () => {
  describe('formatEther', () => {
    it('should format wei to ether', () => {
      const wei = BigInt('1000000000000000000'); // 1 ETH
      const result = formatEther(wei);
      expect(result).toBe('1');
    });

    it('should format smaller amounts', () => {
      const wei = BigInt('500000000000000000'); // 0.5 ETH
      const result = formatEther(wei);
      expect(result).toBe('0.5');
    });
  });

  describe('parseEther', () => {
    it('should parse ether string to wei', () => {
      const ether = '1';
      const result = parseEther(ether);
      expect(result).toBe(BigInt('1000000000000000000'));
    });

    it('should parse decimal ether', () => {
      const ether = '0.01';
      const result = parseEther(ether);
      expect(result).toBe(BigInt('10000000000000000'));
    });
  });
});

describe('Red Packet Business Logic', () => {
  describe('Address formatting', () => {
    it('should format address to short form', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`;
      expect(formatted).toBe('0x1234...7890');
    });
  });

  describe('Red packet ID validation', () => {
    it('should accept valid packet ID', () => {
      const packetId = '5';
      const isValid = /^\d+$/.test(packetId) && Number(packetId) >= 0;
      expect(isValid).toBe(true);
    });

    it('should reject negative numbers', () => {
      const packetId = '-1';
      const isValid = /^\d+$/.test(packetId) && Number(packetId) >= 0;
      expect(isValid).toBe(false);
    });

    it('should reject non-numeric input', () => {
      const packetId = 'abc';
      const isValid = /^\d+$/.test(packetId) && Number(packetId) >= 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Form validation', () => {
    it('should validate amount and count are provided', () => {
      const amount = '0.01';
      const count = '3';
      const isValid = amount && count && Number(amount) > 0 && Number(count) > 0;
      expect(isValid).toBe(true);
    });

    it('should reject empty amount', () => {
      const amount = '';
      const count = '3';
      const isValid = !!(amount && count && Number(amount) > 0 && Number(count) > 0);
      expect(isValid).toBe(false);
    });

    it('should reject zero count', () => {
      const amount = '0.01';
      const count = '0';
      const isValid = amount && count && Number(amount) > 0 && Number(count) > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Progress calculation', () => {
    it('should calculate remaining progress correctly', () => {
      const remainingCount = 2;
      const totalCount = 5;
      const progress = remainingCount / totalCount;
      expect(progress).toBe(0.4);
    });

    it('should handle fully claimed packet', () => {
      const remainingCount = 0;
      const totalCount = 5;
      const progress = remainingCount / totalCount;
      expect(progress).toBe(0);
    });

    it('should handle unclaimed packet', () => {
      const remainingCount = 5;
      const totalCount = 5;
      const progress = remainingCount / totalCount;
      expect(progress).toBe(1);
    });
  });

  describe('Claimed count calculation', () => {
    it('should calculate claimed count', () => {
      const totalCount = 5;
      const remainingCount = 2;
      const claimedCount = totalCount - remainingCount;
      expect(claimedCount).toBe(3);
    });
  });
});

describe('Contract interaction logic', () => {
  describe('createPacket parameters', () => {
    it('should format createPacket call correctly', () => {
      const count = '5';
      const isRandom = true;
      const amount = '0.1';
      
      const args = [BigInt(count), isRandom];
      const value = parseEther(amount);
      
      expect(args[0]).toBe(BigInt(5));
      expect(args[1]).toBe(true);
      expect(value).toBe(BigInt('100000000000000000'));
    });
  });

  describe('claimPacket parameters', () => {
    it('should format claimPacket call correctly', () => {
      const packetId = '10';
      const args = [BigInt(packetId)];
      
      expect(args[0]).toBe(BigInt(10));
    });
  });
});

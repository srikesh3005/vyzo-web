import { CommissionService } from '@/lib/services/commission.service';

describe('Commission Service', () => {
  let commissionService: CommissionService;

  beforeEach(() => {
    commissionService = new CommissionService();
    // Mock the findRule method to avoid DB calls
    jest.spyOn(commissionService, 'findRule').mockImplementation(async (categoryId) => {
      if (categoryId === 'electronics') {
        return {
          id: 'rule-elec',
          name: 'Electronics Rule',
          category_id: 'electronics',
          rate: 0.05, // 5%
          maximum_reward: null,
          priority: 10,
        };
      }
      if (categoryId === 'grocery') {
        return {
          id: 'rule-gro',
          name: 'Grocery Cap Rule',
          category_id: 'grocery',
          rate: 0.10, // 10%
          maximum_reward: 50, // max 50 INR
          priority: 10,
        };
      }
      return {
        id: 'rule-catch-all',
        name: 'Catch All',
        category_id: null,
        rate: 0.01, // 1%
        maximum_reward: null,
        priority: 0,
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should calculate 5% commission and 50% reward correctly for electronics', async () => {
    // 1000 INR = 100000 paise
    const result = await commissionService.calculate(100000, 'electronics');
    
    expect(result.commission_rate).toBe(0.05);
    // 5% of 100000 = 5000 paise (50 INR)
    expect(result.estimated_commission_paise).toBe(5000);
    // Reward is 50% of commission = 2500 paise (25 INR)
    expect(result.estimated_reward_paise).toBe(2500);
    expect(result.is_catch_all).toBe(false);
  });

  it('should apply maximum_reward cap for grocery', async () => {
    // 1000 INR = 100000 paise. 10% would be 10000 paise (100 INR)
    // But maximum_reward is 50 INR (5000 paise).
    const result = await commissionService.calculate(100000, 'grocery');
    
    expect(result.commission_rate).toBe(0.10);
    // Commission is capped at 50 INR = 5000 paise
    expect(result.estimated_commission_paise).toBe(5000);
    // Reward is 50% of capped commission = 2500 paise (25 INR)
    expect(result.estimated_reward_paise).toBe(2500);
  });

  it('should fallback to catch-all rule for unknown categories', async () => {
    // 1000 INR = 100000 paise. 1% would be 1000 paise (10 INR)
    const result = await commissionService.calculate(100000, 'unknown-category');
    
    expect(result.commission_rate).toBe(0.01);
    expect(result.estimated_commission_paise).toBe(1000);
    expect(result.estimated_reward_paise).toBe(500);
    expect(result.is_catch_all).toBe(true);
  });
});


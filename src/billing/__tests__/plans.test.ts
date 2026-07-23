import { getLaunchPlan, LAUNCH_PLAN_ID } from '../plans';

describe('Billing Foundation — Plan Registry', () => {
  const original = process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY;

  afterEach(() => {
    process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY = original;
  });

  it('throws a clear error when no Stripe Price id is configured — never invents one', () => {
    delete process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY;
    expect(() => getLaunchPlan()).toThrow(/STRIPE_PRICE_ID_CREATOR_MONTHLY/);
  });

  it('returns the single Launch plan when configured', () => {
    process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY = 'price_test_123';
    const plan = getLaunchPlan();
    expect(plan.planId).toBe(LAUNCH_PLAN_ID);
    expect(plan.stripePriceId).toBe('price_test_123');
  });
});

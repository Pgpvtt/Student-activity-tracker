
import { dataService } from './dataService';

export interface PlanDetails {
  name: string;
  price: number;
  currency: string;
}

export const PLAN_MAPPING: Record<string, PlanDetails> = {
  free: { name: 'Free', price: 0, currency: 'INR' },
  pro: { name: 'Pro', price: 99, currency: 'INR' },
  premium: { name: 'Premium', price: 199, currency: 'INR' },
};

/**
 * Service to handle payment lifecycle and plan upgrades.
 * Prepared for Razorpay/Stripe integration.
 */
export const paymentService = {
  /**
   * PLACEHOLDER: Create an order on the backend.
   */
  createOrder: async (planType: string) => {
    const plan = PLAN_MAPPING[planType.toLowerCase()];
    if (!plan) throw new Error('Invalid plan type');

    console.log(`Creating order for ${plan.name} at ₹${plan.price}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Future implementation:
    // const res = await api.post('/payments/create-order', { planType });
    // return res.data;

    return {
      orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
      amount: plan.price * 100, // In paise/cents
      currency: plan.currency,
      status: 'created'
    };
  },

  /**
   * PLACEHOLDER: Verify payment signature/data from gateway.
   */
  verifyPayment: async (paymentData: any) => {
    console.log('Verifying payment...', paymentData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Future implementation:
    // const res = await api.post('/payments/verify', paymentData);
    // return res.data.success;

    return true; // Simulate success
  },

  /**
   * Updates user plan in local storage and prepares for backend sync.
   */
  upgradeUserPlan: async (userId: string, planType: string) => {
    const upgradeDate = new Date().toISOString();
    
    try {
      await dataService.setUserData(userId, {
        plan: planType.toLowerCase(),
        planUpgradeDate: upgradeDate
      } as any); // Using any because we'll update the interface next
      
      console.log(`User ${userId} upgraded to ${planType} on ${upgradeDate}`);
      return true;
    } catch (error) {
      console.error('Failed to upgrade user plan:', error);
      return false;
    }
  }
};

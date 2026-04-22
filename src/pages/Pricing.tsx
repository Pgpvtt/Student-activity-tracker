import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Sparkles, Shield, Rocket, Flame, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { paymentService } from '../services/paymentService';

const Pricing = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPlan = async () => {
      if (user) {
        try {
          const data = await dataService.getUserData(user.id);
          setCurrentPlan(data.plan || 'free');
        } catch (error) {
          console.error('Error fetching plan:', error);
        }
      }
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    
    setProcessingPlan(planId);
    setMessage({ type: '', text: '' });

    try {
      // 1. Create Order
      const order = await paymentService.createOrder(planId);
      
      // 2. Verify Payment (Simulated)
      const isVerified = await paymentService.verifyPayment({
        orderId: order.orderId,
        mockTransactionId: 'txn_' + Date.now()
      });

      if (isVerified) {
        // 3. Upgrade User Plan
        const success = await paymentService.upgradeUserPlan(user.id, planId);
        if (success) {
          setCurrentPlan(planId);
          setMessage({ type: 'success', text: 'Plan upgraded successfully!' });
        } else {
          throw new Error('Failed to update local records.');
        }
      } else {
        throw new Error('Payment verification failed.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setMessage({ type: 'error', text: 'Payment failed. Please try again.' });
    } finally {
      setProcessingPlan(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      description: 'The essential toolkit for every student starting their journey.',
      icon: <Rocket className="text-slate-400" size={24} />,
      features: [
        'Max 3 subjects tracking',
        'Basic weekly timetable',
        'Manual attendance marking',
        'Standard assignments list',
      ],
      cta: 'Current Plan',
      color: 'slate',
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₹99',
      description: 'Master your schedule with advanced tools and smart insights.',
      icon: <Flame className="text-primary" size={24} />,
      features: [
        'Unlimited subjects',
        'PDF/Image/Excel Timetable upload',
        'Smart attendance insights',
        'Advanced schedule prediction',
        'Priority feature access',
      ],
      cta: 'Upgrade to Pro',
      color: 'indigo',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '₹199',
      description: 'The ultimate academic powerhouse with AI-driven strategy.',
      icon: <Sparkles className="text-warning" size={24} />,
      features: [
        'Everything in Pro',
        'Advanced academic analytics',
        'AI-based study suggestions',
        'Custom dashboard themes',
        'Early access to new modules',
      ],
      cta: 'Go Premium',
      color: 'amber',
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <header className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-black text-text-main mb-3">Upgrade Your Academic Journey</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Choose the plan that fits your ambition. Scale your tracking, optimize your time, and master your curriculum.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-card rounded-3xl p-8 border-2 transition-all flex flex-col ${
              plan.id === currentPlan 
                ? 'border-primary ring-4 ring-primary/10' 
                : 'border-border hover:border-primary/30'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                plan.id === 'free' ? 'bg-slate-100' : 
                plan.id === 'pro' ? 'bg-indigo-50' : 'bg-amber-50'
              }`}>
                {plan.icon}
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-text-main">{plan.price}</span>
                <span className="text-text-muted text-xs font-bold">/mo</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-text-main mb-2">{plan.name}</h3>
            <p className="text-xs text-text-muted font-medium leading-relaxed mb-8 flex-grow">
              {plan.description}
            </p>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, fIdx) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    plan.id === 'free' ? 'bg-slate-100 text-slate-400' : 'bg-success/10 text-success'
                  }`}>
                    <Check size={10} strokeWidth={4} />
                  </div>
                  <span className="text-xs font-semibold text-text-main leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            {message.text && plan.id === processingPlan && (
              <div className={`mb-4 p-2 rounded text-[10px] font-bold text-center ${
                message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {message.text}
              </div>
            )}

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.id === currentPlan || processingPlan !== null}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                plan.id === currentPlan
                  ? 'bg-success/10 text-success border-2 border-success/30 cursor-default'
                  : 'bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:opacity-50'
              }`}
            >
              {processingPlan === plan.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : plan.id === currentPlan ? (
                'Active Plan'
              ) : (
                plan.cta
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <section className="max-w-3xl mx-auto bg-slate-50 rounded-3xl p-8 border border-border text-center">
        <h4 className="font-bold text-text-main mb-2">Need a Custom Team Plan?</h4>
        <p className="text-xs text-text-muted mb-6">
          For universities, departments, or large student groups, we offer specialized enterprise features and volume discounts.
        </p>
        <button className="text-primary font-bold text-sm hover:underline">
          Contact our academic success team →
        </button>
      </section>
    </Layout>
  );
};

export default Pricing;

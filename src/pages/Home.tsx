import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Zap, Star, ShieldCheck, ArrowUpRight, X, Check, Users, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { signIn, user, profile, updateRole } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = async () => {
    if (checkoutStep === 1) {
      setCheckoutStep(2);
    } else {
      if (!user) return;
      setIsSubmitting(true);
      const path = 'subscriptions';
      try {
        // Create actual subscription
        const subId = `${user.uid}_demo_creator`; // Demo: subscribing to a dummy creator
        await setDoc(doc(db, path, subId), {
          memberId: user.uid,
          creatorId: 'demo_creator_id',
          tierId: 'elite_tier',
          status: 'active',
          startedAt: serverTimestamp(),
        });

        // If they want to try the creator side, we can also upgrade their role
        if (profile?.role !== 'creator') {
          await updateRole('creator');
        }

        setShowCheckout(false);
        setCheckoutStep(1);
        navigate('/dashboard');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium mb-6 uppercase tracking-wider">
              Launching New Monthly Drops
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-[1.1]">
              The premium layer for <br /> elite creators.
            </h1>
            <p className="max-w-2xl mx-auto text-white/50 text-lg md:text-xl mb-10 leading-relaxed font-light">
              Paydrop is the luxury membership platform built for creators who value exclusivity. 
              Upload weekly "drops," manage your elite circle, and scale your influence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => user ? setShowCheckout(true) : signIn()} className="w-full sm:w-auto">
                {user ? 'Join Elite Tier' : 'Connect Wallet'}
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  const el = document.getElementById('marketplace');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Sample Vault
              </Button>
            </div>
          </motion.div>

          {/* Abstract background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand/5 blur-[120px] rounded-full -z-10" />
        </div>
      </section>

      {/* Checkout Modal Simulation */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md premium-card p-8 shadow-2xl border-white/10"
            >
              <button 
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-2 h-2 rounded-full", checkoutStep >= 1 ? "bg-brand" : "bg-white/20")} />
                  <div className={cn("flex-1 h-[1px]", checkoutStep >= 2 ? "bg-brand" : "bg-white/20")} />
                  <div className={cn("w-2 h-2 rounded-full", checkoutStep >= 2 ? "bg-brand" : "bg-white/20")} />
                </div>
                <h3 className="text-xl font-bold">{checkoutStep === 1 ? 'Select Payment' : 'Confirm Access'}</h3>
              </div>

              {checkoutStep === 1 ? (
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-xl border border-brand bg-brand/5 flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="font-bold">Elite Tier</p>
                        <p className="text-xs text-white/40">$49/month</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-brand" />
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group cursor-pointer opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">Pro Tier</p>
                        <p className="text-xs text-white/40">$19/month</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mb-8 text-center py-4">
                  <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4 glow-indigo">
                    <ShieldCheck className="w-10 h-10 text-brand" />
                  </div>
                  <p className="text-white/60">You are about to join the elite inner circle. You will get instant access to all premium drops.</p>
                </div>
              )}

              <Button className="w-full" onClick={handleNextStep} loading={isSubmitting}>
                {checkoutStep === 1 ? 'Next Step' : 'Confirm Subscription'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature Bento (Platform) */}
      <section id="platform" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">The Platform</h2>
            <p className="text-white/40">Everything you need to run a high-end membership.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 row-span-2 premium-card p-12 flex flex-col justify-between group overflow-hidden relative"
            >
              <div className="relative z-10">
                <Zap className="w-10 h-10 text-brand mb-8" />
                <h3 className="text-4xl font-bold mb-4 tracking-tight">Monthly Value Drops</h3>
                <p className="text-white/50 max-w-sm text-lg leading-relaxed">Schedule files, links, and exclusive Figmas to drop automatically for your inner circle.</p>
              </div>
              <div className="mt-12 flex items-center text-brand font-bold uppercase tracking-widest text-xs group-hover:gap-2 transition-all">
                Learn more <ArrowUpRight className="ml-1 w-4 h-4" />
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand/10 blur-[100px] rounded-full group-hover:bg-brand/20 transition-colors" />
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 premium-card p-8 bg-brand/5 border-brand/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center glow-indigo">
                  <Star className="text-white w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Elite Tiered Access</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6">Create multiple access levels with varying permissions for your most loyal supporters.</p>
              <div className="flex gap-2">
                {['Direct Support', 'Early Access', 'Exclusive Assets'].map((feat) => (
                  <span key={feat} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                    {feat}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="premium-card p-8 items-center justify-center flex flex-col text-center"
            >
              <ShieldCheck className="w-8 h-8 text-white/40 mb-4" />
              <h3 className="text-lg font-bold mb-2">Secure Vault</h3>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Enterprise Privacy</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="premium-card p-8 flex flex-col justify-center"
            >
              <Users className="w-8 h-8 text-brand mb-4" />
              <h3 className="text-lg font-bold mb-1">10k+ Creators</h3>
              <p className="text-xs text-white/40">Trusted by the best in the industry.</p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Marketplace Drops</h2>
              <p className="text-white/40">Exclusive resources from the Paydrop community.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex">See all drops</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'creator_1', name: 'Elena Vance', tag: 'Visual Arts' },
              { id: 'creator_2', name: 'Marcus Aurelius', tag: 'Strategy' },
              { id: 'creator_3', name: 'Sarah Drasner', tag: 'Engineering' },
              { id: 'creator_4', name: 'Vito Corleone', tag: 'Foundations' }
            ].map((creator) => (
              <motion.div 
                key={creator.id}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/creator/${creator.id}`)}
                className="premium-card aspect-square p-6 flex flex-col justify-between group cursor-pointer overflow-hidden relative"
              >
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-brand relative z-10 transition-transform group-hover:scale-110">
                  <Users className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold truncate">{creator.name}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{creator.tag}</p>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] w-20 h-20 bg-brand/5 blur-xl rounded-full group-hover:bg-brand/20 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Transparent Pricing</h2>
            <p className="text-white/40 max-w-sm mx-auto">Join the next generation of elite creators today.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Basic', price: '9', features: ['Up to 5 drops/mo', 'Basic Analytics', 'Direct Support'] },
              { name: 'Pro', price: '19', features: ['Unlimited drops', 'Advanced Insights', 'Framer Components', 'Discord Community'], popular: true },
              { name: 'Elite', price: '49', features: ['Custom Branded Vault', 'API Access', 'White-labeling', 'Dedicated Mgr'] },
            ].map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "premium-card p-8 flex flex-col relative",
                  plan.popular && "border-brand/40 bg-brand/[0.03]"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand text-[10px] font-bold rounded-full uppercase tracking-widest">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-white/40 text-sm">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-white/60 flex items-center gap-2">
                       <Check className="w-4 h-4 text-brand" />
                       {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full" onClick={() => user ? setShowCheckout(true) : signIn()}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

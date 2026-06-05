'use client';

import React, { useState, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Shield, Truck, RotateCcw, Zap, Terminal, Globe, Cpu, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bundle } from './BundleSelector';

interface CheckoutProps {
  selectedBundle: Bundle;
}

const Checkout: React.FC<CheckoutProps> = ({ selectedBundle }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [diagnostics, setDiagnostics] = useState(0);
  const [step, setStep] = useState<'none' | 'loading' | 'form' | 'manifest'>('none');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: 'United States'
  });

  useEffect(() => {
    if (step === 'loading') {
      const interval = setInterval(() => {
        setDiagnostics(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('form');
            return 100;
          }
          return prev + 5;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('manifest');
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-blue-500/10 border border-blue-500/50 rounded-2xl"
      >
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <Zap className="text-white w-8 h-8 fill-current" />
        </div>
        <h3 className="text-2xl font-bold text-blue-400 mb-4 tracking-tighter uppercase">TRANSMISSION COMPLETE</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          Your AstroCase manifest has been logged. Secure dispatch initiated to {formData.city}.
        </p>
        <div className="text-[10px] text-blue-500/50 uppercase tracking-[0.2em]">Confirmation ID: AST-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
      </motion.div>
    );
  }

  if (step === 'none') {
    return (
      <button 
        onClick={() => setStep('loading')}
        className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3 group"
      >
        <Terminal className="w-5 h-5 group-hover:animate-pulse" />
        Initialize Purchase
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between text-[10px] text-blue-400 uppercase tracking-widest mb-2">
              <span>Establishing Secure Link...</span>
              <span>{diagnostics}%</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"
                initial={{ width: 0 }}
                animate={{ width: `${diagnostics}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-left">
              <div className="text-[9px] text-zinc-600 uppercase flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Encrypting Payload
              </div>
              <div className="text-[9px] text-zinc-600 uppercase flex items-center gap-2">
                <Globe className="w-3 h-3" /> Sector 7 Protocol
              </div>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left"
          >
            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="w-3 h-3" />
              Delivery Protocol
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                  placeholder="COMMANDER NAME"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                    placeholder="NAME@GALAXY.COM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest ml-1">Phone</label>
                  <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest ml-1">Shipping Address</label>
                <textarea 
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all h-20 resize-none"
                  placeholder="STREET ADDRESS / APARTMENT / SUITE"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input 
                  required
                  name="city"
                  placeholder="CITY"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:border-blue-500/50 outline-none"
                />
                <input 
                  required
                  name="postal"
                  placeholder="POSTAL"
                  value={formData.postal}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:border-blue-500/50 outline-none"
                />
                <input 
                  required
                  name="country"
                  placeholder="COUNTRY"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:border-blue-500/50 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl mt-4 hover:bg-blue-500 hover:text-white transition-all shadow-xl"
              >
                Log Manifest & Continue
              </button>
            </form>
          </motion.div>
        )}

        {step === 'manifest' && (
          <motion.div 
            key="manifest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 border border-white/5 rounded-xl p-6 text-left relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Terminal className="w-12 h-12" />
               </div>
               <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                 Validated Manifest
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500 text-[10px] uppercase">Commander</span>
                    <span className="text-white text-xs font-bold truncate ml-4">{formData.name}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500 text-[10px] uppercase">Destination</span>
                    <span className="text-white text-[10px] font-bold truncate ml-4 italic">{formData.city}, {formData.country}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-blue-400 text-sm font-black uppercase">Grand Total</span>
                    <span className="text-white text-xl font-black">€{selectedBundle.price}</span>
                 </div>
               </div>
               <button 
                onClick={() => setStep('form')}
                className="text-[9px] text-zinc-600 uppercase tracking-widest mt-4 hover:text-white underline underline-offset-4"
               >
                 Edit Details
               </button>
            </div>

            <div className="space-y-4">
              <PayPalButtons
                style={{ 
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "buynow"
                }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          value: selectedBundle.price.toString(),
                          currency_code: "EUR"
                        },
                        description: `AstroCase - ${selectedBundle.name}`
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  if (actions.order) {
                    return actions.order.capture().then((details) => {
                      setStatus('success');
                    });
                  }
                  return Promise.resolve();
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  setStatus('error');
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-[9px] text-zinc-500 uppercase tracking-[0.2em] group">
          <Shield className="w-5 h-5 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
          Secure SSL
        </div>
        <div className="flex flex-col items-center text-[9px] text-zinc-500 uppercase tracking-[0.2em] group">
          <Truck className="w-5 h-5 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
          Global Ship
        </div>
        <div className="flex flex-col items-center text-[9px] text-zinc-500 uppercase tracking-[0.2em] group">
          <RotateCcw className="w-5 h-5 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
          Returns
        </div>
      </div>
    </div>
  );
};

export default Checkout;

'use client';

import React from 'react';
import { Package, Star, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export interface Bundle {
  id: string;
  name: string;
  price: number;
  description: string;
  savings: string | null;
  popular: boolean;
  icon: React.ReactNode;
}

export const BUNDLES: Bundle[] = [
  {
    id: 'solo',
    name: 'Solo AstroCase',
    price: 39.99,
    description: '1× AstroCase',
    savings: null,
    popular: false,
    icon: <Zap size={18} />
  },
  {
    id: 'travel',
    name: 'Travel Bundle',
    price: 59.99,
    description: 'AstroCase + Cable + Pouch',
    savings: 'SAVE €4.99',
    popular: true,
    icon: <TrendingUp size={18} />
  },
  {
    id: 'explorer',
    name: 'Explorer Duo',
    price: 69.99,
    description: '2× AstroCase',
    savings: 'SAVE €9.99',
    popular: false,
    icon: <Star size={18} />
  },
  {
    id: 'ultimate',
    name: 'Ultimate EDC',
    price: 59.99,
    description: 'AstroCase + PopSocket + Shield',
    savings: 'SAVE €4.98',
    popular: false,
    icon: <ShieldCheck size={18} />
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    price: 54.99,
    description: 'AstroCase + Sleeve + Cloth',
    savings: 'SAVE €4.99',
    popular: false,
    icon: <Package size={18} />
  },
  {
    id: 'shield',
    name: 'Shield Pack',
    price: 99.99,
    description: '3× AstroCase',
    savings: 'SAVE €19.98',
    popular: false,
    icon: <ShieldCheck size={18} />
  }
];

interface BundleSelectorProps {
  selectedBundle: Bundle;
  onSelect: (bundle: Bundle) => void;
}

const BundleSelector: React.FC<BundleSelectorProps> = ({ selectedBundle, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-3 mb-8 text-left">
      {BUNDLES.map((bundle) => (
        <button
          key={bundle.id}
          onClick={() => onSelect(bundle)}
          className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedBundle.id === bundle.id
              ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
              : 'border-white/5 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${
              selectedBundle.id === bundle.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {bundle.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">{bundle.name}</span>
                {bundle.popular && (
                  <span className="bg-orange-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-white">
                    Popular
                  </span>
                )}
                {bundle.savings && (
                  <span className="text-blue-400 text-[10px] font-bold">
                    {bundle.savings}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{bundle.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-white">€{bundle.price}</div>
          </div>
          
          {selectedBundle.id === bundle.id && (
            <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-lg shadow-blue-500/50">
              <ShieldCheck size={12} className="text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default BundleSelector;

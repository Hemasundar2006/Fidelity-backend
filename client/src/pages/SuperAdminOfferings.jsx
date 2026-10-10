import React from 'react';
import { Package, Check, Zap, Building2 } from 'lucide-react';

const SuperAdminOfferings = () => {
  const plans = [
    {
      name: 'Basic Clinic',
      price: 'Free Trial',
      features: ['Up to 5 Staff Members', 'Basic OPD Queueing', 'Patient Directory', 'Email Support'],
      color: 'blue'
    },
    {
      name: 'Maternity Standard',
      price: '$299/mo',
      features: ['Up to 50 Staff Members', 'Fetal Monitoring Logs', 'AI Risk Predictor (Basic)', 'Lab Integrations', 'Priority Support'],
      color: 'pink',
      popular: true
    },
    {
      name: 'Enterprise Hospital',
      price: 'Custom',
      features: ['Unlimited Staff', 'Full AI Suite & Predictive Models', 'Patient Mobile App', 'Dedicated Account Manager', 'Custom Integrations'],
      color: 'slate'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 font-sans bg-[#f4fafe] min-h-screen rounded-[32px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#e6f4fc]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Platform Offerings</h1>
            <p className="text-sm text-gray-500 font-medium">Manage pricing plans, packages, and features available to partners</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition-colors">
          Create New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`bg-white rounded-3xl p-8 border-2 relative flex flex-col ${plan.popular ? 'border-[#FF95A5] shadow-xl shadow-[#FF95A5]/10 scale-105 z-10' : 'border-transparent shadow-sm'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#FF95A5] text-white text-xs font-bold uppercase tracking-widest rounded-full">
                Most Popular
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${
              plan.color === 'blue' ? 'bg-[#f0f8fd] text-[#76C0EC]' : 
              plan.color === 'pink' ? 'bg-[#fff0f2] text-[#FF95A5]' : 
              'bg-slate-100 text-slate-800'
            }`}>
              {plan.color === 'blue' ? <Building2 size={24}/> : plan.color === 'pink' ? <Zap size={24}/> : <Package size={24}/>}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
            <div className="text-3xl font-black text-gray-900 mb-8">{plan.price}</div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    plan.color === 'blue' ? 'bg-[#76C0EC]/20 text-[#76C0EC]' : 
                    plan.color === 'pink' ? 'bg-[#FF95A5]/20 text-[#FF95A5]' : 
                    'bg-slate-200 text-slate-700'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
              plan.popular 
                ? 'bg-[#FF95A5] text-white hover:bg-[#ff8597] shadow-lg shadow-[#FF95A5]/30' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}>
              Edit Package
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminOfferings;

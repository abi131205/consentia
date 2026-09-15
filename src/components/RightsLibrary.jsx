import React, { useState } from 'react';
import { Scale, Search, Shield, Info, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function RightsLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const rightsList = [
    {
      id: 'informed_consent',
      title: 'Right to Informed Consent & Informed Refusal',
      category: 'Clinical Care',
      summary: 'You have the ethical and legal right to receive a complete, understandable explanation of proposed treatments, alternative therapies, and associated risks before agreeing. You also maintain the right to refuse any procedure at any time.',
      keyTakeaway: 'No doctor or hospital can perform non-emergency procedures on you without your voluntary, informed consent.',
      statute: 'Common Law Medical Ethics & State Patient Bill of Rights'
    },
    {
      id: 'no_surprises_act',
      title: 'No Surprises Act (Balance Billing Protection)',
      category: 'Billing & Insurance',
      summary: 'Effective January 1, 2022, federal law protects patients from surprise balance billing when receiving emergency care, or when receiving non-emergency care from out-of-network providers at in-network facilities.',
      keyTakeaway: 'Out-of-network doctors at in-network hospitals cannot bill you more than your standard in-network copay or deductible.',
      statute: 'Federal No Surprises Act (P.L. 116-260)'
    },
    {
      id: 'emtala',
      title: 'EMTALA (Emergency Stabilization Right)',
      category: 'Emergency Care',
      summary: 'Under the Emergency Medical Treatment & Active Labor Act, any hospital emergency department receiving Medicare funds must provide an appropriate medical screening examination and stabilizing treatment to anyone seeking emergency care, regardless of ability to pay or insurance status.',
      keyTakeaway: 'Emergency rooms cannot delay treatment or refuse emergency stabilization over paperwork disputes, insurance status, or advance payment demands.',
      statute: '42 U.S.C. § 1395dd (EMTALA)'
    },
    {
      id: 'itemized_bill',
      title: 'Right to an Itemized Bill with Medical Coding',
      category: 'Billing & Insurance',
      summary: 'Patients have the legal right to request a complete, line-by-line itemized receipt listing every medical code (CPT/HCPCS), medication, and facility charge before making payment.',
      keyTakeaway: 'Requesting an itemized bill frequently uncovers duplicate billing errors, incorrect coding levels, or unbundled charges.',
      statute: 'Healthcare Financial Transparency Guidelines'
    },
    {
      id: 'insurance_appeals',
      title: 'Right to Internal & External Insurance Appeals',
      category: 'Insurance Appeals',
      summary: 'If your health plan denies coverage for a claim or treatment, you have the statutory right to file an internal appeal with your insurer. If denied internally, you have the right to an independent external review by an unbiased medical panel whose decision is binding on the insurer.',
      keyTakeaway: 'Over 50% of formal insurance appeals are decided in favor of the patient when supported by physician medical necessity documentation.',
      statute: 'Affordable Care Act § 2719 Appeal Provisions'
    },
    {
      id: 'hipaa_access',
      title: 'Right to Copies of Medical Records (HIPAA)',
      category: 'Clinical Care',
      summary: 'Under the HIPAA Privacy Rule, you have the right to inspect and receive electronic or physical copies of your complete medical records, doctor notes, and diagnostic lab reports within 30 days of request.',
      keyTakeaway: 'Providers cannot withhold medical records because of outstanding unpaid medical bills.',
      statute: '45 CFR § 164.524 (HIPAA Privacy Rule)'
    }
  ];

  const categories = ['All', 'Clinical Care', 'Billing & Insurance', 'Emergency Care', 'Insurance Appeals'];

  const filtered = rightsList.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = search === '' || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-paper-50 p-6 rounded-2xl border border-paper-300/60 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Patient Rights Reference Library
            </h2>
            <p className="text-xs text-slate-600">
              Educational overview of key legal protections governing healthcare, billing disputes, and insurance appeals.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-paper-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient rights..."
              className="w-full bg-paper-100 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-paper-300 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'bg-sage-600 text-paper-50 border-sage-600'
                    : 'bg-paper-100 text-slate-600 border-paper-300 hover:bg-paper-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className="bg-paper-50 p-5 rounded-2xl border border-paper-300/70 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100 px-2 py-0.5 rounded border border-sage-500/20">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.statute}
                </span>
              </div>

              <h3 className="text-base font-bold font-serif text-slate-900">
                {item.title}
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {item.summary}
              </p>
            </div>

            {/* Key Takeaway Callout */}
            <div className="bg-sage-50/90 p-3 rounded-xl border border-sage-500/20 text-xs text-sage-900 font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[10px] uppercase text-sage-700">Patient Protection Takeaway:</span>
                {item.keyTakeaway}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

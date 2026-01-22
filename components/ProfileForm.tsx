
import React, { useState } from 'react';
import { CitizenProfile } from '../types';

interface Props {
  onSubmit: (profile: CitizenProfile) => void;
}

export const ProfileForm: React.FC<Props> = ({ onSubmit }) => {
  const [profile, setProfile] = useState<CitizenProfile>({
    age: 28,
    gender: 'Male',
    state: 'Maharashtra',
    district: 'Mumbai',
    education: 'Graduate',
    incomeRange: '< 2.5 LPA',
    occupation: 'Farmer',
    category: 'General',
    disability: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'age' ? parseInt(value) : value)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Citizen Profile Builder</h2>
        <p className="text-slate-500">Essential parameters for autonomous eligibility verification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Age</label>
          <input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gender</label>
          <select name="gender" value={profile.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">State</label>
          <input type="text" name="state" value={profile.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Social Category</label>
          <select name="category" value={profile.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option>General</option>
            <option>OBC</option>
            <option>SC/ST</option>
            <option>Minority</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Annual Income Range</label>
          <select name="incomeRange" value={profile.incomeRange} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option>&lt; 2.5 LPA</option>
            <option>2.5 - 5 LPA</option>
            <option>5 - 8 LPA</option>
            <option>&gt; 8 LPA</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Occupation</label>
          <input type="text" name="occupation" value={profile.occupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Student" />
        </div>
        <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <input type="checkbox" name="disability" checked={profile.disability} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <label className="text-sm font-semibold text-slate-700">Physical Disability Status</label>
        </div>
      </div>

      <button 
        onClick={() => onSubmit(profile)}
        className="mt-10 w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group flex items-center justify-center gap-2"
      >
        INITIALIZE ACTION AGENT
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
};

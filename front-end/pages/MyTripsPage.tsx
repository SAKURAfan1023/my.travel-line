import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface MyTripsPageProps {
  onBack: () => void;
}

interface TripSummary {
  id: string;
  destination: string;
  country: string;
  image: string;
  dates: string;
  duration: string;
  travelers: number;
  status: 'Upcoming' | 'Draft' | 'Completed';
  tags: string[];
  budget: string;
}

const myTrips: TripSummary[] = [
  {
    id: '1',
    destination: 'Kyoto',
    country: 'Japan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz5crycLhV1Vc1BboKBADjqUqnIqH1c_MJv-b5L4vAyYC8JrY7pG3xFf6aVJ_YkqyoqXy052jB0YCXdFb5_EklneY1QOejLNlyujh9IACFBjJH9h-IsU1tKO4x1Q08gq5luZXRQ5joQuDrhRxWp9V9L3Dgx_sfZ8spVf_f4a_uzmzhMxdfq2wAoCizfmg4I6aeYIRGGXnRAXUZ-zhuPyo9-IUaHNJgyDV6jeLOpvzZLpqxRVUXcXGiS6f6vnMNBuADFxSdCA',
    dates: 'Oct 12 - Oct 15, 2024',
    duration: '4 Days',
    travelers: 2,
    status: 'Upcoming',
    tags: ['Culture', 'History'],
    budget: '$$$'
  },
  {
    id: '2',
    destination: 'Santorini',
    country: 'Greece',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnqx780Byo2Isq5jjKy-SFbdkGpxwvTq3ECHrcjy8xavaVzCIg_MoGv5QfMKu9y_CLNl5DwaO_bmK1TxhErlgKnY0PMjDeLe6sZ6KkViPVjQXJMMQxpPlGSSr_dY-zZpvKjHjvL0-rIp0BBzzle3NJz9bINdu--qxX-uS8hKQr5pPwbRrj3rbpIgdxJg5DbB-uL189_GrGJj1p4Z1OkYSwOuMv9wfjkS9oFGmttOakHBuBioLE7hKCh0CQiGWQnfSy5gJiYw',
    dates: 'Sep 01 - Sep 07, 2024',
    duration: '7 Days',
    travelers: 1,
    status: 'Completed',
    tags: ['Relaxation', 'Beach'],
    budget: '$$$$'
  },
  {
    id: '3',
    destination: 'Reykjavik',
    country: 'Iceland',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1nDQuazZn6I9VG6Vsixl34-pRMGEHMk97tnu752hIjT_gbWXbEVytPQfPCqEWCSo2MlRSq9UzVwdNjGH2NjQr2tf72c_vCxli-kejyzRgYtwO4vIriDNtbjmS6vE00jdlUP7sD1KpUlSwO3YkmDKBHyFbc8YzXZRnUnBKLFpZwJphbkJqSft2bAYUb2pY8Mvoi0JeGxU_PKPv5iKUVZic_NkahzQmSaG--pu7j2_CWn5J83mmkF-esAITRpH1XA9Izyi5A',
    dates: 'TBD',
    duration: '5 Days',
    travelers: 4,
    status: 'Draft',
    tags: ['Nature', 'Adventure'],
    budget: '$$'
  }
];

const MyTripsPage: React.FC<MyTripsPageProps> = ({ onBack }) => {
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-[#111418] font-display">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white/80 backdrop-blur-md px-6 lg:px-10 py-3 z-20">
        <div className="flex items-center gap-4 text-[#111418] cursor-pointer" onClick={onBack}>
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
          </div>
          <h2 className="text-[#111418] text-xl font-bold leading-tight tracking-[-0.015em]">{t('app.name')}</h2>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-9">
            <a className="text-primary text-sm font-bold leading-normal transition-colors" href="#">{t('nav.my_trips')}</a>
            <a className="text-[#111418] text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer" onClick={onBack}>{t('nav.explore')}</a>
            <a className="text-[#111418] text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">{t('nav.community')}</a>
          </nav>
          
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-md hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">
                    {language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-100" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9IieWfMutCVT39ubACBRV1dvx3Yr1in8xNA9IyEWezB4fRF1ar1YdMyDsqSTzsyZTKc86b8SIq_KuDc7BFQvA132dT1a3sAyrW7VdsS0Lt56mgDgvWKfV5fsyTacbe3cJjos5EJMsGnz7fNJk_icRBlrtnwNq4OD106GPkmYcJ5b9lbQ5JTRHFttlucqPhltG0ODFSMGd2XZmEnHwlx968G25gCkaXPpZd6tevjG3vpwVeqZBvGGBnwfRG3swp_uNSnP6sA")' }}></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111418] dark:text-white mb-2">{t('trips.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t('trips.manage')}</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20" onClick={onBack}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              {t('trips.new')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTrips.map((trip) => (
              <div key={trip.id} className="group bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                   <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${trip.image}")` }}></div>
                   <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md
                        ${trip.status === 'Upcoming' ? 'bg-primary/90 text-white' : 
                          trip.status === 'Completed' ? 'bg-green-500/90 text-white' : 
                          'bg-slate-500/90 text-white'}`}>
                        {trip.status}
                      </span>
                   </div>
                   <div className="absolute top-3 right-3">
                      <button className="size-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                   </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#111418] dark:text-white leading-tight">{trip.destination}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{trip.country}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                        {trip.budget}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-4 text-sm text-slate-600 dark:text-slate-300">
                     <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                        <span>{trip.duration}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                        <span>{trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                     </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {trip.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-700">
                            {tag}
                        </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                    <button className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        {t('trips.edit')}
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl bg-[#111418] dark:bg-white text-white dark:text-[#111418] font-bold text-sm hover:opacity-90 transition-opacity">
                        {t('trips.view')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Placeholder Card */}
            <button onClick={onBack} className="group min-h-[400px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-300">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">add_location_alt</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{t('trips.new')}</h3>
                <p className="text-sm font-medium opacity-70">Start a new AI itinerary</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTripsPage;
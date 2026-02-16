import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface LandingPageProps {
  onStartPlanning: (city?: string) => void;
  onMyTrips: () => void;
}

interface SearchSuggestion {
  name: string;
  district: string;
  adcode: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartPlanning, onMyTrips }) => {
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await fetch(`http://localhost:8000/api/search-suggestions?query=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: string) => {
    setSearchQuery(city);
    setShowSuggestions(false);
    onStartPlanning(city);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-[#111418]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-6 lg:px-10 py-3 z-20 transition-colors">
        <div className="flex items-center gap-4 text-[#111418] dark:text-white">
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
          </div>
          <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">{t('app.name')}</h2>
        </div>
        <div className="flex items-center gap-4 lg:gap-8">
          <nav className="hidden md:flex items-center gap-6 lg:gap-9">
            <a
              className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer"
              onClick={onMyTrips}
            >
              {t('nav.my_trips')}
            </a>
            <a className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">{t('nav.community')}</a>
          </nav>

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold text-slate-600 dark:text-white transition-colors">
              {language === 'en' ? '中文' : 'EN'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors">
              <span className="truncate">{t('nav.login')}</span>
            </button>
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-100 dark:border-slate-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9IieWfMutCVT39ubACBRV1dvx3Yr1in8xNA9IyEWezB4fRF1ar1YdMyDsqSTzsyZTKc86b8SIq_KuDc7BFQvA132dT1a3sAyrW7VdsS0Lt56mgDgvWKfV5fsyTacbe3cJjos5EJMsGnz7fNJk_icRBlrtnwNq4OD106GPkmYcJ5b9lbQ5JTRHFttlucqPhltG0ODFSMGd2XZmEnHwlx968G25gCkaXPpZd6tevjG3vpwVeqZBvGGBnwfRG3swp_uNSnP6sA")' }}></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-6 lg:p-10 max-w-[1200px] mx-auto pb-24 h-full flex flex-col justify-center">
            {/* Hero */}
            <div className="w-full relative min-h-[500px] flex flex-col items-center justify-center text-center p-8 mb-10 group isolate">
              {/* Background Layer with Overflow Hidden */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl z-0">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDf1pqopAS00TUFrQ_3wgZSxBfcwxO7yPoal4jkkaE8-oZIb-uglYr99Q9Cbii01xKHV-DcOn1lL0Yw3rCdjdkJeVS9T9e9mYqdQGIMSe4kPwCn5usX5oweddg1ippKQPmuRdNx81dS74hADkEzYI-rORL60_Bg5XzYdcN4yR3EicxDJ65hLzwoj3osCZbdshvgTN8ig5cFk8m8exEQmgwCg6FyUwhnV9aHG7SITfNSaPlPs1EFmB1UYictWLblcPuNb-tcQQ")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60"></div>
              </div>

              {/* Content Layer */}
              <div className="relative z-10 max-w-3xl flex flex-col gap-8 items-center animate-fade-in-up">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold tracking-wide uppercase">
                      {t('hero.badge')}
                    </span>
                  </div>
                  <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.9] tracking-[-0.033em] drop-shadow-lg whitespace-pre-line">
                    {t('hero.title')}
                  </h1>
                  <h2 className="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto drop-shadow-md">
                    {t('hero.subtitle')}
                  </h2>
                </div>

                {/* Search Bar Trigger */}
                <div ref={searchRef} className="w-full max-w-[600px] mt-4 relative group/search z-50">
                  <div className="flex items-center w-full bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden h-16 ring-4 ring-white/20 focus-within:ring-primary/40 transition-all transform hover:scale-[1.01]">
                    <div className="pl-6 pr-3 text-slate-400">
                      <span className="material-symbols-outlined text-3xl">search</span>
                    </div>
                    <input
                      className="w-full h-full border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-lg font-medium bg-transparent"
                      placeholder={t('hero.search_placeholder')}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectCity(searchQuery)}
                    />
                    <button
                      className="mr-2 h-12 px-8 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-base transition-colors shadow-lg whitespace-nowrap"
                      onClick={() => handleSelectCity(searchQuery)}
                    >
                      {t('hero.plan_button')}
                    </button>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-100">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.adcode}-${index}`}
                          className="px-6 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                          onClick={() => handleSelectCity(suggestion.name)}
                        >
                          <div>
                            <span className="text-slate-800 font-medium">{suggestion.name}</span>
                            <span className="ml-2 text-xs text-slate-400">{suggestion.district}</span>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">arrow_outward</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestions */}
                  <div className="flex justify-center gap-3 mt-4">
                    {['Tokyo', 'New York', 'London', 'Bali'].map(city => (
                      <button key={city} onClick={() => handleSelectCity(city)} className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors">
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof / Trusted By (Visual Filler) */}
            <div className="flex flex-col items-center gap-4 opacity-60">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Trusted by travelers worldwide</p>
              <div className="flex gap-8 grayscale opacity-70">
                <span className="material-symbols-outlined text-3xl">flight</span>
                <span className="material-symbols-outlined text-3xl">hotel</span>
                <span className="material-symbols-outlined text-3xl">map</span>
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;

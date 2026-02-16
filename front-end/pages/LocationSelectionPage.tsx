import React, { useState } from 'react';
import { TripLocation, SelectedLocation } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface LocationSelectionPageProps {
  onBack: () => void;
  onNext: () => void;
  selectedLocations: SelectedLocation[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<SelectedLocation[]>>;
}

const recommendations: TripLocation[] = [
  {
    id: '1',
    name: 'Santorini',
    country: 'Greece',
    rating: 4.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnqx780Byo2Isq5jjKy-SFbdkGpxwvTq3ECHrcjy8xavaVzCIg_MoGv5QfMKu9y_CLNl5DwaO_bmK1TxhErlgKnY0PMjDeLe6sZ6KkViPVjQXJMMQxpPlGSSr_dY-zZpvKjHjvL0-rIp0BBzzle3NJz9bINdu--qxX-uS8hKQr5pPwbRrj3rbpIgdxJg5DbB-uL189_GrGJj1p4Z1OkYSwOuMv9wfjkS9oFGmttOakHBuBioLE7hKCh0CQiGWQnfSy5gJiYw',
    tags: ['Coastal', 'Relaxation'],
    daysRecommended: 2
  },
  {
    id: '2',
    name: 'Kyoto',
    country: 'Japan',
    rating: 4.8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz5crycLhV1Vc1BboKBADjqUqnIqH1c_MJv-b5L4vAyYC8JrY7pG3xFf6aVJ_YkqyoqXy052jB0YCXdFb5_EklneY1QOejLNlyujh9IACFBjJH9h-IsU1tKO4x1Q08gq5luZXRQ5joQuDrhRxWp9V9L3Dgx_sfZ8spVf_f4a_uzmzhMxdfq2wAoCizfmg4I6aeYIRGGXnRAXUZ-zhuPyo9-IUaHNJgyDV6jeLOpvzZLpqxRVUXcXGiS6f6vnMNBuADFxSdCA',
    tags: ['Culture', 'History'],
    daysRecommended: 3
  },
  {
    id: '3',
    name: 'Banff',
    country: 'Canada',
    rating: 5.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1nDQuazZn6I9VG6Vsixl34-pRMGEHMk97tnu752hIjT_gbWXbEVytPQfPCqEWCSo2MlRSq9UzVwdNjGH2NjQr2tf72c_vCxli-kejyzRgYtwO4vIriDNtbjmS6vE00jdlUP7sD1KpUlSwO3YkmDKBHyFbc8YzXZRnUnBKLFpZwJphbkJqSft2bAYUb2pY8Mvoi0JeGxU_PKPv5iKUVZic_NkahzQmSaG--pu7j2_CWn5J83mmkF-esAITRpH1XA9Izyi5A',
    tags: ['Nature', 'Hiking'],
    daysRecommended: 3
  },
  {
    id: '4',
    name: 'Machu Picchu',
    country: 'Peru',
    rating: 4.7,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBggx3Bjmf2foq02wdCVSLqG_w3wnrbA79Pqnu9jt07ci5nEtAR8dwRKjXzj5bSr11bv7oGXTvgbDlB9lE1IOqGfoIxKWUe6f3EzDcPvAUyu5BIu9jLWAWhWXUgQw7zCClp3ts5Hgd65SuE6sQPVBjBHQlnB3JdtOl4J_vPRYZRUgLK12awDfLObe5ok0srlKVBZYJfmEXe0Y288is_VOT9w9JiCvnts1iaBMmoBTUFctmTfqGHAXkzSHaXtVEa1tiJYuV3YA',
    tags: ['History', 'Adventure'],
    daysRecommended: 2
  },
  {
    id: '5',
    name: 'Amalfi Coast',
    country: 'Italy',
    rating: 4.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuguQvKyHfpGeOxt2nwQSaR-gsnWJbVUNOyI9YyYKZRujNTCMopqSViauJDh_jLjCyxxVFLb2WOXDUmQxocSEbu-7cn9nMduPe06PGJD1ZepU5UAp4gwpkykAISjaNxjmosJili6Rr5bkWnyn3qO7aGzsuvudF1DjtRJ0d3Ha-9_APX4v1rmAmKd6ESDndUcw0pvitDfuez-hCQ7GSEellxs-erHf_HyswwOYpjKJpelBvcYa1gFj1yaRxLDFD_i3pInFTeA',
    tags: ['Coastal', 'Food'],
    daysRecommended: 3
  },
  {
    id: '6',
    name: 'Maui',
    country: 'Hawaii',
    rating: 4.8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMfoE-gxBFLWAEoS4X_9_0PZgAjVAnzARwcsSulsejyLKqh0ILAaKbsM-OcIDYQ7ydQ-kNaaE1HyUgd2Nr_NtR73IP9dLD_YNNGfjDRlAr1fv9Vl2o0Pq0Xi82g3RCyaeP2hURwd9t2DFJAFUSlbgkvyKfTYt-tcQwcovdizuFfSSHrtF6mqxGn1nPvW84eltFtSK0L6URde5vb8rwigb0Wa4m3FgItQxw8Ms6F3h6BgL3JcAF0PXsbhP4OOVKILzoaO8WDQ',
    tags: ['Beach', 'Nature'],
    daysRecommended: 4
  }
];

const tagIcons: Record<string, string> = {
  'Coastal': 'water_drop',
  'Relaxation': 'spa',
  'Culture': 'temple_buddhist',
  'History': 'history_edu',
  'Nature': 'park',
  'Hiking': 'hiking',
  'Adventure': 'landscape',
  'Food': 'restaurant',
  'Beach': 'surfing'
};

const LocationSelectionPage: React.FC<LocationSelectionPageProps> = ({ 
  onBack, 
  onNext, 
  selectedLocations, 
  setSelectedLocations 
}) => {
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileBasketOpen, setIsMobileBasketOpen] = useState(false);
  
  // State for the configuration modal
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  const addToBasket = (place: TripLocation) => {
    if (!selectedLocations.find(item => item.id === place.id)) {
      // Create a copy of the object so we can modify it (e.g. days)
      setSelectedLocations([...selectedLocations, { ...place }]);
    }
  };

  const removeFromBasket = (id: string) => {
    setSelectedLocations(prev => prev.filter(item => item.id !== id));
    if (editingLocationId === id) {
        setEditingLocationId(null);
    }
  };

  const updateLocationDetails = (id: string, updates: Partial<SelectedLocation>) => {
    setSelectedLocations(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const filteredRecommendations = recommendations.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingLocation = selectedLocations.find(l => l.id === editingLocationId);
  const basket = selectedLocations; // Alias for easier refactoring

  const renderBasketList = (isMobile = false) => (
    <>
        {basket.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">map</span>
                <p className="text-sm font-medium">{t('location.empty_basket')}</p>
            </div>
        ) : (
            basket.map((item, index) => (
            <div 
                key={item.id} 
                className={`relative flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group transition-all animate-fade-in-up cursor-pointer hover:border-primary/40 hover:shadow-md ${editingLocationId === item.id ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`} 
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setEditingLocationId(item.id)}
            >
                <div className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${item.image}")` }}></div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#111418] truncate">{item.name}, {item.country}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.daysRecommended} {t('common.days')}
                        </span>
                        {item.userNotes && (
                             <span className="material-symbols-outlined text-xs text-slate-400">sticky_note_2</span>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col gap-1 items-end justify-center">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingLocationId(item.id);
                        }}
                        className="text-slate-400 hover:text-primary hover:bg-blue-50 rounded-full p-1 transition-colors"
                        title={t('common.edit')}
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFromBasket(item.id);
                        }}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"
                        title={t('common.remove')}
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                
                {/* Connector Line */}
                {index < basket.length - 1 && (
                        <div className="absolute left-[38px] -bottom-6 w-0.5 h-4 bg-slate-300 z-0"></div>
                )}
            </div>
            ))
        )}
         <button className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 gap-2 h-24 hover:border-primary/40 hover:text-primary/60 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-2xl opacity-50">add_location_alt</span>
              <p className="text-xs font-medium">{t('location.add_another')}</p>
            </button>
    </>
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-[#111418]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white/80 backdrop-blur-md px-6 lg:px-10 py-3 z-20">
        <div className="flex items-center gap-4 text-[#111418] cursor-pointer" onClick={onBack}>
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
          </div>
          <h2 className="text-[#111418] text-xl font-bold leading-tight tracking-[-0.015em]">{t('app.name')}</h2>
        </div>
        
        {/* Search Bar in Header */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">search</span>
                </div>
                <input 
                    type="text" 
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
                    placeholder={t('location.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                     <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-md hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">
                     {language === 'en' ? '中文' : 'EN'}
                </button>
            </div>
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors" onClick={onBack}>
                 <span className="material-symbols-outlined text-slate-600">close</span>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content: Recommendations Grid */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50/50 dark:bg-background-dark">
          <div className="p-6 lg:p-10 max-w-[1200px] mx-auto pb-24 lg:pb-10">
            
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{t('step.1')}</span>
                        <span className="h-1 w-1 rounded-full bg-[#dbe0e5] dark:bg-gray-600"></span>
                        <span className="text-xs font-medium text-[#617589] dark:text-gray-400">{t('nav.explore')}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#111418] dark:text-white mb-2">{t('location.title')}</h1>
                    <p className="text-slate-500">{t('location.subtitle')}</p>
                </div>
                <div className="hidden md:block max-w-md text-right pb-1">
                     <p className="text-sm text-slate-400 leading-relaxed">
                        {t('location.instruction')}
                     </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#111418] text-white px-4 transition-transform active:scale-95 shadow-md">
                <span className="text-sm font-medium">{t('filter.all')}</span>
                </button>
                {['Nature', 'City Break', 'Historical', 'Coastal'].map((filter) => {
                    const key = filter.toLowerCase().replace(' ', '_');
                    return (
                        <button key={filter} className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-200 hover:border-primary/50 hover:bg-slate-50 px-4 transition-all">
                            <span className="material-symbols-outlined text-[18px]">{tagIcons[filter] || 'explore'}</span>
                            <span className="text-[#111418] text-sm font-medium">{t(`filter.${key}`)}</span>
                        </button>
                    )
                })}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((place) => {
                const isSelected = basket.some(b => b.id === place.id);
                return (
                    <div key={place.id} className={`group flex flex-col gap-3 bg-white p-3 rounded-2xl border transition-all duration-300 ${isSelected ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10' : 'border-slate-100 hover:shadow-lg hover:shadow-primary/5'}`}>
                    <div className="w-full relative aspect-[4/3] rounded-xl overflow-hidden">
                        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-yellow-500 text-[16px] fill">star</span>
                        <span className="text-xs font-bold text-slate-800">{place.rating.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url("${place.image}")` }}></div>
                        
                        {!isSelected ? (
                            <button 
                                onClick={() => addToBasket(place)}
                                className="absolute bottom-3 right-3 size-10 bg-white hover:bg-primary text-primary hover:text-white rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        ) : (
                             <button 
                                onClick={() => removeFromBasket(place.id)}
                                className="absolute inset-0 z-20 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] transition-all cursor-pointer group/remove"
                             >
                                <span className="bg-white text-primary group-hover/remove:bg-red-500 group-hover/remove:text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 transition-colors">
                                    <span className="material-symbols-outlined text-sm group-hover/remove:hidden">check</span> 
                                    <span className="material-symbols-outlined text-sm hidden group-hover/remove:block">close</span>
                                    <span className="group-hover/remove:hidden">{t('card.added')}</span>
                                    <span className="hidden group-hover/remove:inline">{t('common.remove')}</span>
                                </span>
                             </button>
                        )}
                    </div>
                    <div className="px-1 pb-1">
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#111418] text-lg font-bold leading-normal">{place.name}, {place.country}</p>
                            <p className="text-[#617589] text-sm font-medium mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">{tagIcons[place.tags[0]] || 'place'}</span>
                            {place.tags.join(' • ')}
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                );
            })}
            </div>
          </div>
        </main>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[360px] flex-col border-l border-slate-200 bg-white shadow-xl shadow-slate-200/50 z-10">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-[#111418]">{t('location.your_route')}</h3>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{basket.length} Places</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {renderBasketList(false)}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Est. Duration</span>
                <span className="text-xl font-bold text-[#111418]">{basket.reduce((acc, item) => acc + item.daysRecommended, 0)} {t('common.days')}</span>
              </div>
              <div className="flex -space-x-2">
                {basket.map((item) => (
                    <div key={item.id} className="size-8 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: `url("${item.image}")` }}></div>
                ))}
              </div>
            </div>
            <button 
                onClick={onNext} 
                disabled={basket.length === 0}
                className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-primary/20 disabled:shadow-none"
            >
              {t('location.continue')}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Bar (Sticky) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 flex items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <button 
                onClick={() => setIsMobileBasketOpen(true)}
                className="flex-1 flex items-center gap-3 text-left"
            >
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {basket.length} Places
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#111418]">{t('location.your_route')}</span>
                    <span className="text-xs text-slate-500">Tap to view list</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 ml-auto">expand_less</span>
            </button>
            <button 
                onClick={onNext}
                disabled={basket.length === 0}
                className="px-6 py-3 bg-primary hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:shadow-none whitespace-nowrap"
            >
                {t('location.continue')}
            </button>
        </div>

        {/* Mobile Drawer (Overlay) */}
        {isMobileBasketOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileBasketOpen(false)}></div>
                
                {/* Drawer Content */}
                <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-fade-in-up">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-[#111418]">{t('location.your_route')} ({basket.length})</h3>
                        <button onClick={() => setIsMobileBasketOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto p-4 flex flex-col gap-4">
                        {renderBasketList(true)}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        {/* Summary Stats */}
                         <div className="flex justify-between items-end mb-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Est. Duration</span>
                                <span className="text-xl font-bold text-[#111418]">{basket.reduce((acc, item) => acc + item.daysRecommended, 0)} {t('common.days')}</span>
                            </div>
                            <div className="flex -space-x-2">
                                {basket.map((item) => (
                                    <div key={item.id} className="size-8 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: `url("${item.image}")` }}></div>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={onNext}
                            disabled={basket.length === 0}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-lg"
                        >
                            {t('location.continue')}
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* EDIT LOCATION DETAILS MODAL */}
        {editingLocation && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up" 
                    onClick={() => setEditingLocationId(null)}
                ></div>
                
                {/* Modal */}
                <div className="relative w-full max-w-md bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up scale-100 transition-all">
                    {/* Hero Image Header */}
                    <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url("${editingLocation.image}")` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <button 
                            onClick={() => setEditingLocationId(null)}
                            className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="absolute bottom-4 left-6 text-white">
                            <h2 className="text-2xl font-bold leading-none">{editingLocation.name}</h2>
                            <p className="text-white/80 text-sm font-medium">{editingLocation.country}</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        {/* Duration Control */}
                        <div>
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('modal.duration_label')}</label>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                                <button 
                                    onClick={() => updateLocationDetails(editingLocation.id, { daysRecommended: Math.max(1, editingLocation.daysRecommended - 1) })}
                                    className="size-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-white hover:bg-slate-50 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">remove</span>
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold text-[#111418] dark:text-white">{editingLocation.daysRecommended}</span>
                                    <span className="text-xs text-slate-500 font-medium">{t('common.days')}</span>
                                </div>
                                <button 
                                    onClick={() => updateLocationDetails(editingLocation.id, { daysRecommended: Math.min(30, editingLocation.daysRecommended + 1) })}
                                    className="size-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-primary hover:bg-blue-50 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Notes Input */}
                        <div>
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('modal.notes_label')}</label>
                            <textarea 
                                className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none placeholder-slate-400 text-[#111418] dark:text-white"
                                placeholder={t('modal.notes_placeholder')}
                                value={editingLocation.userNotes || ''}
                                onChange={(e) => updateLocationDetails(editingLocation.id, { userNotes: e.target.value })}
                            ></textarea>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                             <button 
                                onClick={() => removeFromBasket(editingLocation.id)}
                                className="flex-1 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm"
                            >
                                {t('modal.remove_city')}
                            </button>
                            <button 
                                onClick={() => setEditingLocationId(null)}
                                className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors text-sm"
                            >
                                {t('common.done')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default LocationSelectionPage;
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface ItineraryPageProps {
  onMyTrips: () => void;
  onHome: () => void;
}

// Localized Data Structures
const itineraryContent = {
  en: {
    tripTitle: "3 Days in Kyoto",
    dateDisplay: "Oct 12 - Oct 14",
    dayHeader: "Day 1",
    daySubHeader: "Traditional Kyoto",
    dateShort: "OCT 12",
    mapPins: [
      { id: 1, name: "Kinkaku-ji", top: "32%", left: "24%" },
      { id: 2, name: "Fushimi Inari", top: "38%", left: "40%", active: true },
      { id: 3, name: "Kiyomizu-dera", top: "45%", left: "55%" }
    ],
    mapOverlay: {
      stopNumber: "Stop #2",
      title: "Fushimi Inari Shrine",
      duration: "2h Stay",
      description: "Famous for its thousands of vermilion torii gates.",
      aiStrategy: "Arrive before 8 AM to avoid the main crowds. The hike to the summit takes about 2-3 hours round trip."
    },
    timeline: [
      {
        time: "08:00 AM",
        title: "Arrive at Kyoto Station",
        description: "",
        tags: [{ label: "Transport", color: "slate" }]
      },
      {
        time: "09:30 AM",
        title: "Kinkaku-ji (Golden Pavilion)",
        description: "Iconic Zen Buddhist temple covered in gold leaf. Best viewed in the morning light reflecting on the pond.",
        tags: [{ label: "Sightseeing", color: "slate" }, { label: "Must See", color: "yellow" }]
      },
      {
        time: "12:30 PM",
        title: "Lunch at Nishiki Market",
        description: "Try local specialties like tofu donuts and fresh seafood.",
        tags: [{ label: "Dining", color: "slate" }]
      },
      {
        time: "02:30 PM",
        title: "Fushimi Inari Taisha",
        description: "Shinto shrine famous for its thousands of vermilion torii gates.",
        tags: [{ label: "Activity", color: "slate" }, { label: "Crowded", color: "red" }]
      },
      {
        time: "06:00 PM",
        title: "Pontocho Alley",
        description: "Atmospheric dining by the river.",
        tags: [{ label: "Dining", color: "purple" }]
      }
    ]
  },
  zh: {
    tripTitle: "京都 3 日游",
    dateDisplay: "10月12日 - 10月14日",
    dayHeader: "第 1 天",
    daySubHeader: "传统京都",
    dateShort: "10月12日",
    mapPins: [
      { id: 1, name: "金阁寺", top: "32%", left: "24%" },
      { id: 2, name: "伏见稻荷", top: "38%", left: "40%", active: true },
      { id: 3, name: "清水寺", top: "45%", left: "55%" }
    ],
    mapOverlay: {
      stopNumber: "第 2 站",
      title: "伏见稻荷大社",
      duration: "停留 2小时",
      description: "以成千上万的朱红色鸟居闻名的神社。",
      aiStrategy: "建议早上 8 点前到达以避开拥挤人群。徒步至山顶往返约需 2-3 小时。"
    },
    timeline: [
      {
        time: "08:00 AM",
        title: "抵达京都站",
        description: "",
        tags: [{ label: "交通", color: "slate" }]
      },
      {
        time: "09:30 AM",
        title: "金阁寺",
        description: "标志性的禅宗寺庙，覆盖着金箔。在晨光映照的池塘边观赏最佳。",
        tags: [{ label: "观光", color: "slate" }, { label: "必看", color: "yellow" }]
      },
      {
        time: "12:30 PM",
        title: "锦市场午餐",
        description: "品尝豆腐甜甜圈和新鲜海鲜等当地特色美食。",
        tags: [{ label: "餐饮", color: "slate" }]
      },
      {
        time: "02:30 PM",
        title: "伏见稻荷大社",
        description: "以成千上万的朱红色鸟居闻名的神社。",
        tags: [{ label: "活动", color: "slate" }, { label: "拥挤", color: "red" }]
      },
      {
        time: "06:00 PM",
        title: "先斗町",
        description: "河畔充满氛围的餐饮区。",
        tags: [{ label: "餐饮", color: "purple" }]
      }
    ]
  }
};

const ItineraryPage: React.FC<ItineraryPageProps> = ({ onMyTrips, onHome }) => {
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();
  
  const content = itineraryContent[language];

  // Helper to get tag styles
  const getTagStyles = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
      case 'red': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-6 lg:px-10 py-3 z-30">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-900 dark:text-white cursor-pointer" onClick={onHome}>
                <div className="size-8 text-primary">
                    <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">{t('itinerary.title')}</h2>
            </div>
            <div className="hidden lg:flex items-center gap-9">
                 <a 
                    className="text-slate-900 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium leading-normal cursor-pointer" 
                    onClick={onMyTrips}
                >
                    {t('nav.my_trips')}
                </a>
                <a className="text-slate-900 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">{t('nav.community')}</a>
            </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-white transition-colors">
                     <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold text-slate-600 dark:text-white transition-colors">
                     {language === 'en' ? '中文' : 'EN'}
                </button>
            </div>

            <div className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-slate-100 dark:bg-slate-800">
                    <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input className="flex w-full min-w-0 flex-1 bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 text-sm font-normal focus:outline-none" placeholder={t('location.search_placeholder')} />
                </div>
            </div>
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-slate-100 dark:ring-slate-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAvFktRTwKsgddXUhaJ5ok67hNqHyKEIv5iXd11v9wQ6ATqOqE3vUFysvzHxKzYec47TZnaQ_IHLRmDagkKLUlRA4eGr3DQVR13J0nL8ZWXGG6_sCDnmUv58eZEIThjWIG2fusUyFZet_4T8G23vcswEx7vWKSDdgInMxWsyOXUGUD8_PreWNXmjM7TS5Aw0HMoG1cMEo4kYXh7POldR88Car9xt10ATBEp4Rnh0SPI-nEm1H-XLlPYGpzgp3Y7DPXtcAboqw")' }}></div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Pane: Map */}
        <div className="relative w-full lg:w-2/3 h-full bg-slate-200 dark:bg-slate-900 group/map">
            {/* Map BG */}
            <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuABk1kntWQuUoSv7HCayE55jch7f8bJTmMPewp9llbZ2phY2dAu4NZLou3m2MsoLbx1USyAfqKr3SFjEVwumj0djJYXtap6Jod6OWPX3kypdnQ9BnTCIu6sSNUXMQ2i-C9GaiGkd6p-4SF6U3Yb2jYonC1Sa63TrXCsqgkhYYy7WkBQnGx9MZx2wo7kZUHrczAKFvu4rlDvMo0LQ2rBE5lsp8vjIl7TMpZWev6Sho7FegjYynVNbr3H2jXrx2p8lgZ1t4vzzg")', filter: 'brightness(0.95)' }}></div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none"></div>

            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-md">
                <path d="M 350 250 Q 450 350 550 300 T 750 350" fill="none" stroke="#2b8cee" strokeDasharray="8 6" strokeLinecap="round" strokeWidth="4"></path>
            </svg>

            {/* Map Controls */}
            <div className="absolute top-4 left-4 right-4 lg:left-6 lg:right-auto z-20 flex flex-col gap-3 max-w-sm pointer-events-none">
                <div className="pointer-events-auto bg-white dark:bg-surface-dark shadow-lg rounded-xl p-1 flex">
                    <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm transition-all">Map View</button>
                    <button className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-all">Satellite</button>
                </div>
            </div>

            {/* Zoom */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white border-b border-slate-200 dark:border-slate-700 transition-colors"><span className="material-symbols-outlined">add</span></button>
                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors"><span className="material-symbols-outlined">remove</span></button>
                </div>
                <button className="p-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined">my_location</span></button>
            </div>

            {/* Dynamic Map Pins */}
            {content.mapPins.map((pin) => (
              <div 
                key={pin.id} 
                className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 group ${pin.active ? 'z-30' : ''}`} 
                style={{ top: pin.top, left: pin.left }}
              >
                <div className="relative">
                    {pin.active ? (
                         <div className="size-12 bg-white dark:bg-surface-dark text-primary border-4 border-primary rounded-full flex items-center justify-center font-bold shadow-xl">{pin.id}</div>
                    ) : (
                        <>
                            <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white/50 dark:ring-black/20">{pin.id}</div>
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-surface-dark px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-slate-800 dark:text-white">{pin.name}</div>
                        </>
                    )}
                </div>
              </div>
            ))}

            {/* Detail Overlay */}
            <div className="absolute z-40" style={{ top: '22%', left: '43%' }}>
                <div className="w-72 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up ring-1 ring-slate-900/5 dark:ring-white/10">
                    <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxphmBCFqD26UPGKl5qZs92FhWAFxCqetX3ec89rKFbl6VzKKaY58_8B9MoRVaZQtrfQv_rw0XZm4DsV0ateZSCZiWy1z-FpyxlessKJC2XU0liP4iWhfUR5hE8bwsuTMxKfSFTtsok0p1Whyd2vQm6NxMYhGM-Z6ul8bHm2B_Dw23OvT5mYbxtU0XfwgUHx6KSmVQKhAk4_3WnpiVq-Z_otsfqQuGOGZIUmGVVKsaEDA3VzXsZYoNNPRSzQ3grTk8l1Yd0Q")' }}>
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">{content.mapOverlay.stopNumber}</div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{content.mapOverlay.title}</h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{content.mapOverlay.duration}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{content.mapOverlay.description}</p>
                        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                                <span className="text-xs font-bold text-primary uppercase">{t('itinerary.ai_rec')}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{content.mapOverlay.aiStrategy}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('itinerary.free_entry')}</span>
                            <button className="text-xs font-medium text-primary hover:text-blue-600 flex items-center">
                                {t('itinerary.more_details')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Pane: Timeline */}
        <div className="w-full lg:w-1/3 h-full flex flex-col bg-white dark:bg-background-dark border-l border-slate-200 dark:border-slate-800 shadow-xl z-30">
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex-none bg-white dark:bg-background-dark z-20">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{content.tripTitle}</h1>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            <span>{content.dateDisplay}</span>
                            <span className="mx-1">•</span>
                            <span>2 {t('common.guests')}</span>
                        </div>
                    </div>
                    <button className="flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
                <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('itinerary.est_cost')}</span>
                        <span className="text-xl font-bold text-primary">¥65,000</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('itinerary.pacing')}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <span className="material-symbols-outlined">hiking</span>
                            {t('itinerary.relaxed')}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth bg-slate-50/50 dark:bg-transparent">
                 {/* Day 1 */}
                 <div className="flex flex-col gap-6">
                    {/* Day Header */}
                    <div className="flex items-center gap-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur py-3 mb-2 z-10 border-b border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-lg text-sm font-bold">{content.dayHeader}</div>
                        <div className="flex-1">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">{content.daySubHeader}</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{content.dateShort}</span>
                    </div>

                    <div className="relative pl-4 space-y-8 pb-4">
                        <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                        {/* Timeline Items Map */}
                        {content.timeline.map((event, index) => (
                            <div key={index} className="relative pl-8 group">
                                <div className="absolute left-[11px] top-4 size-4 bg-white dark:bg-background-dark border-4 border-slate-300 dark:border-slate-600 rounded-full z-10 group-hover:border-primary transition-colors"></div>
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{event.time}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{event.title}</h3>
                                    {event.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">{event.description}</p>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        {event.tags.map((tag, i) => (
                                            <span 
                                                key={i} 
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTagStyles(tag.color)}`}
                                            >
                                                {tag.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                 <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">refresh</span>
                    {t('itinerary.regenerate')}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ItineraryPage;
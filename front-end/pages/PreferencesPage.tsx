import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SelectedLocation } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface PreferencesPageProps {
  onBack: () => void;
  onNext: () => void;
  onHome: () => void;
  selectedLocations: SelectedLocation[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<SelectedLocation[]>>;
}

const PreferencesPage: React.FC<PreferencesPageProps> = ({ onBack, onNext, onHome, selectedLocations, setSelectedLocations }) => {
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();

  // Optional Section States
  const [enableTransport, setEnableTransport] = useState(false);
  const [enableInterests, setEnableInterests] = useState(false);
  const [enableDetailedBudget, setEnableDetailedBudget] = useState(false);

  const [transport, setTransport] = useState('Flight');
  
  // Initialize view with current date (1st of current month)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Calendar State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Calculate total duration based on location stays (Days + Hours logic)
  const totalRecommendedDays = useMemo(() => {
    return selectedLocations.reduce((acc, loc) => {
        const days = loc.stayDays !== undefined ? loc.stayDays : loc.daysRecommended;
        const hours = loc.stayHours || 0;
        return acc + days + (hours > 0 ? 0.5 : 0); // Simplified visual duration
    }, 0);
  }, [selectedLocations]);
  
  const formattedTotalDuration = useMemo(() => {
      const totalDays = selectedLocations.reduce((acc, loc) => acc + (loc.stayDays ?? loc.daysRecommended), 0);
      const totalHours = selectedLocations.reduce((acc, loc) => acc + (loc.stayHours || 0), 0);
      const extraDays = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;
      return `${totalDays + extraDays} ${t('common.days')}` + (remainingHours > 0 ? `, ${remainingHours} ${t('common.hours')}` : '');
  }, [selectedLocations, t]);

  // Logic to update assigned dates for locations when startDate changes
  useEffect(() => {
    if (startDate) {
        let currentDate = new Date(startDate);
        const updatedLocations = selectedLocations.map(loc => {
            const durationDays = (loc.stayDays ?? loc.daysRecommended);
            const start = new Date(currentDate);
            const end = new Date(currentDate);
            end.setDate(start.getDate() + Math.max(1, durationDays) - 1);
            
            // Advance for next
            currentDate = new Date(end);
            currentDate.setDate(currentDate.getDate() + 1);

            return {
                ...loc,
                stayDays: durationDays, // ensure set
                stayHours: loc.stayHours || 0,
                assignedStartDate: start.toISOString(),
                assignedEndDate: end.toISOString(),
            };
        });
        
        // Check for changes to avoid infinite loop
        const currentSignature = JSON.stringify(selectedLocations.map(l => ({d: l.assignedStartDate, e: l.assignedEndDate, sd: l.stayDays, sh: l.stayHours})));
        const newSignature = JSON.stringify(updatedLocations.map(l => ({d: l.assignedStartDate, e: l.assignedEndDate, sd: l.stayDays, sh: l.stayHours})));
        
        if (currentSignature !== newSignature) {
            setSelectedLocations(updatedLocations);
        }
    }
  }, [startDate, selectedLocations]);

  // State for preferences input
  const [preferences, setPreferences] = useState<string[]>(['Local Cuisine']);
  const [prefInput, setPrefInput] = useState('');
  
  // Total Budget State (Required)
  const [totalBudget, setTotalBudget] = useState<[number, number]>([3000, 8000]);

  // Detailed Budget State (Optional)
  const [budget, setBudget] = useState<[number, number]>([150, 600]);
  const [diningBudget, setDiningBudget] = useState<[number, number]>([20, 80]);
  const [diningPrefs, setDiningPrefs] = useState<string[]>(['Local', 'Street Food']);

  // Modal State for Location Details
  const [editingLocId, setEditingLocId] = useState<string | null>(null);

  // Slider Logic Refs
  const activeSlider = useRef<'total' | 'budget' | 'dining' | null>(null);
  const draggingHandle = useRef<'min' | 'max' | null>(null);
  const totalBudgetSliderRef = useRef<HTMLDivElement>(null);
  const budgetSliderRef = useRef<HTMLDivElement>(null);
  const diningSliderRef = useRef<HTMLDivElement>(null);
  
  const PRESETS = ['Vegan', 'Vegetarian', 'Halal', 'Museums', 'Nature', 'Shopping', 'Nightlife', 'History', 'Art'];
  const DINING_PRESETS = ['Street Food', 'Fine Dining', 'Local', 'Vegan', 'Seafood', 'Italian', 'Asian', 'Halal', 'Steakhouse'];

  // Unified Slider Logic
  const startDrag = (e: React.MouseEvent, slider: 'total' | 'budget' | 'dining', handle: 'min' | 'max') => {
    e.preventDefault();
    if (slider === 'budget' && !enableDetailedBudget) return;
    if (slider === 'dining' && !enableDetailedBudget) return;

    activeSlider.current = slider;
    draggingHandle.current = handle;
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!activeSlider.current || !draggingHandle.current) return;
    
    let ref: React.RefObject<HTMLDivElement> | null = null;
    let setter: React.Dispatch<React.SetStateAction<[number, number]>> | null = null;
    let maxVal = 1000;
    let minBuffer = 10;

    if (activeSlider.current === 'total') {
        ref = totalBudgetSliderRef;
        setter = setTotalBudget;
        maxVal = 20000;
        minBuffer = 500;
    } else if (activeSlider.current === 'budget') {
        ref = budgetSliderRef;
        setter = setBudget;
        maxVal = 1000;
        minBuffer = 50;
    } else if (activeSlider.current === 'dining') {
        ref = diningSliderRef;
        setter = setDiningBudget;
        maxVal = 300;
        minBuffer = 20;
    }
    
    if (!ref || !ref.current || !setter) return;
    
    const rect = ref.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    const value = Math.round(percent * maxVal); 
    
    setter(prev => {
        if (draggingHandle.current === 'min') {
            const newVal = Math.min(value, prev[1] - minBuffer);
            return [newVal, prev[1]];
        } else {
            const newVal = Math.max(value, prev[0] + minBuffer);
            return [prev[0], newVal];
        }
    });
  };

  const handleGlobalMouseUp = () => {
    activeSlider.current = null;
    draggingHandle.current = null;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  useEffect(() => {
      return () => {
          document.removeEventListener('mousemove', handleGlobalMouseMove);
          document.removeEventListener('mouseup', handleGlobalMouseUp);
      }
  }, []);

  const addPreference = () => {
    if (prefInput.trim() && !preferences.includes(prefInput.trim())) {
      setPreferences([...preferences, prefInput.trim()]);
      setPrefInput('');
    }
  };

  const handlePrefKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPreference();
    }
  };

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };

  const togglePreset = (preset: string) => {
    if (preferences.includes(preset)) {
        removePreference(preset);
    } else {
        setPreferences([...preferences, preset]);
    }
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const clicked = new Date(year, month, day);
    
    if (!startDate || (startDate && endDate)) {
        // Start new range selection
        setStartDate(clicked);
        setEndDate(null);
    } else if (clicked < startDate) {
        // User clicked before start date, treat as new start
        setStartDate(clicked);
        setEndDate(null);
    } else {
        // User clicked after start date, set end
        setEndDate(clicked);
    }
  };

  const changeMonth = (offset: number) => {
    setViewDate(prev => {
        const d = new Date(prev);
        d.setMonth(prev.getMonth() + offset);
        return d;
    });
  };
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  const renderCalendarGrid = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOffset = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startDayOffset; i++) {
        days.push(<div key={`empty-${year}-${month}-${i}`} className="h-9 w-full"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        let isRangeStart = false;
        let isRangeEnd = false;
        let isInRange = false;
        let isSingleSelection = false;
        const isToday = isSameDay(currentDate, today);

        if (startDate) {
            if (isSameDay(startDate, currentDate)) {
                isRangeStart = true;
                if (!endDate) {
                    isSingleSelection = true;
                } else if (isSameDay(endDate, startDate)) {
                     isSingleSelection = true;
                }
            }
            if (endDate) {
                if (isSameDay(endDate, currentDate)) isRangeEnd = true;
                if (currentDate > startDate && currentDate < endDate) isInRange = true;
            }
        }
        
        // Render Logic
        let content;
        const btnClass = "relative z-10 w-full h-full flex items-center justify-center text-sm rounded-full shadow-sm transition-colors";
        
        if (isRangeStart) {
            content = (
                <div key={`${year}-${month}-${i}`} className="h-9 w-full relative flex items-center">
                    {!isSingleSelection && <div className="absolute inset-0 bg-primary/20 rounded-l-full"></div>}
                    <button onClick={() => handleDateClick(year, month, i)} className={`${btnClass} text-white bg-primary hover:bg-blue-600`}>{i}</button>
                </div>
            );
        } else if (isRangeEnd) {
             content = (
                <div key={`${year}-${month}-${i}`} className="h-9 w-full relative flex items-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-r-full"></div>
                    <button onClick={() => handleDateClick(year, month, i)} className={`${btnClass} text-white bg-primary hover:bg-blue-600`}>{i}</button>
                </div>
            );
        } else if (isInRange) {
            content = (
                 <div key={`${year}-${month}-${i}`} className="h-9 w-full bg-primary/20 flex items-center justify-center">
                    <button onClick={() => handleDateClick(year, month, i)} className="w-full h-full flex items-center justify-center text-sm text-[#111418] dark:text-white font-medium">{i}</button>
                 </div>
            );
        } else {
             content = (
                <button 
                    key={`${year}-${month}-${i}`} 
                    onClick={() => handleDateClick(year, month, i)}
                    className={`h-9 w-full flex items-center justify-center text-sm rounded-full transition-colors relative ${isToday ? 'text-primary font-bold bg-primary/10 ring-1 ring-primary/50' : 'text-[#111418] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    {i}
                    {isToday && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>}
                </button>
            );
        }
        days.push(content);
    }
    return days;
  };

  const formatMonthYear = (date: Date) => date.toLocaleString(language === 'zh' ? 'zh-CN' : 'default', { month: 'long', year: 'numeric' });
  const secondViewDate = new Date(viewDate);
  secondViewDate.setMonth(viewDate.getMonth() + 1);

  // Helper to format date for display
  const formatDateDisplay = (isoDate?: string) => {
    if (!isoDate) return 'Set Date';
    return new Date(isoDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const editingLocation = selectedLocations.find(l => l.id === editingLocId);
  
  const selectedDuration = startDate && endDate 
      ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 
      : 0;
      
  const updateLocationDuration = (id: string, days: number, hours: number) => {
    const newLocs = selectedLocations.map(l => l.id === id ? {...l, stayDays: days, stayHours: hours} : l);
    setSelectedLocations(newLocs);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white overflow-hidden">
      
      {/* Header (Added for navigation consistency) */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white/80 backdrop-blur-md px-6 lg:px-10 py-3 z-20">
        <div className="flex items-center gap-4 text-[#111418] cursor-pointer" onClick={onHome}>
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
          </div>
          <h2 className="text-[#111418] text-xl font-bold leading-tight tracking-[-0.015em]">{t('app.name')}</h2>
        </div>
        
        {/* Actions Placeholder to match height/style of other pages */}
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                     <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-md hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">
                     {language === 'en' ? '中文' : 'EN'}
                </button>
            </div>
             <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-100" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9IieWfMutCVT39ubACBRV1dvx3Yr1in8xNA9IyEWezB4fRF1ar1YdMyDsqSTzsyZTKc86b8SIq_KuDc7BFQvA132dT1a3sAyrW7VdsS0Lt56mgDgvWKfV5fsyTacbe3cJjos5EJMsGnz7fNJk_icRBlrtnwNq4OD106GPkmYcJ5b9lbQ5JTRHFttlucqPhltG0ODFSMGd2XZmEnHwlx968G25gCkaXPpZd6tevjG3vpwVeqZBvGGBnwfRG3swp_uNSnP6sA")' }}></div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-10 lg:px-40 py-5 flex justify-center min-h-full">
            <div className="flex flex-col max-w-[1100px] w-full animate-fade-in-up pb-10">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 px-4 py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{t('step.2')}</span>
                    <span className="h-1 w-1 rounded-full bg-[#dbe0e5] dark:bg-gray-600"></span>
                    <span className="text-xs font-medium text-[#617589] dark:text-gray-400">{t('nav.settings')}</span>
                </div>

                {/* Heading */}
                <div className="flex flex-wrap justify-between gap-3 px-4 pt-4 pb-2">
                    <div className="flex min-w-72 flex-col gap-2">
                        <h1 className="text-[#111418] dark:text-white tracking-tight text-[32px] font-bold leading-tight">{t('preferences.title')}</h1>
                        <p className="text-[#617589] dark:text-gray-400 text-base font-normal leading-normal">{t('preferences.subtitle')}</p>
                    </div>
                </div>

                {/* Summary List (Replaces Chips) */}
                <div className="px-4 pb-6">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                                <span className="material-symbols-outlined text-2xl">route</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#111418] dark:text-white">{t('location.your_route')}: {selectedLocations.length} {t('preferences.destinations_count')} <span className="text-red-500">*</span></h3>
                                <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {selectedLocations.map((loc, idx) => (
                                        <span key={loc.id} className="flex items-center">
                                            {idx > 0 && <span className="material-symbols-outlined text-sm mx-1 opacity-50">arrow_right_alt</span>}
                                            {loc.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline px-4" onClick={() => onBack()}>{t('preferences.edit_route')}</button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                    {/* Left Col (8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Calendar (Mandatory) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight">{t('preferences.travel_dates')} <span className="text-red-500">*</span></h3>
                                </div>
                                {startDate && endDate && (
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold animate-fade-in-up">
                                        {selectedDuration} {t('common.days')}
                                    </div>
                                )}
                            </div>
                            
                            {/* Dual Calendar View */}
                            <div className="flex flex-wrap justify-center gap-6 mb-6">
                                <div className="flex min-w-[280px] flex-1 flex-col gap-2">
                                    <div className="flex items-center justify-between p-1">
                                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                                        <p className="text-[#111418] dark:text-white text-base font-bold text-center flex-1">{formatMonthYear(viewDate)}</p>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1">
                                        {['S','M','T','W','T','F','S'].map(d => <p key={d} className="text-[#617589] text-[12px] font-bold text-center h-8 flex items-center justify-center">{d}</p>)}
                                        {renderCalendarGrid(viewDate.getFullYear(), viewDate.getMonth())} 
                                    </div>
                                </div>
                                <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex min-w-[280px] flex-1 flex-col gap-2">
                                    <div className="flex items-center justify-between p-1">
                                        <p className="text-[#111418] dark:text-white text-base font-bold text-center flex-1">{formatMonthYear(secondViewDate)}</p>
                                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1">
                                        {['S','M','T','W','T','F','S'].map(d => <p key={d} className="text-[#617589] text-[12px] font-bold text-center h-8 flex items-center justify-center">{d}</p>)}
                                        {renderCalendarGrid(secondViewDate.getFullYear(), secondViewDate.getMonth())} 
                                    </div>
                                </div>
                            </div>
                            
                            {/* Info Text */}
                            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex gap-2">
                                <span className="material-symbols-outlined text-primary text-base">info</span>
                                <p>{t('preferences.date_instruction_1')} <strong>{formattedTotalDuration}</strong> {t('preferences.date_instruction_2')}</p>
                            </div>
                        </div>

                        {/* Detailed Timeline Editor (Below Calendar) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
                             <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight">{t('preferences.timeline')} <span className="text-red-500">*</span></h3>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {selectedLocations.map((loc, index) => (
                                    <div key={loc.id} className="relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:border-primary/50 transition-colors">
                                        {/* Connector Line (visual) */}
                                        {index < selectedLocations.length - 1 && (
                                            <div className="absolute left-[26px] -bottom-4 w-0.5 h-4 bg-slate-300 dark:bg-slate-600 md:hidden"></div>
                                        )}
                                        
                                        {/* Left: Info */}
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <div className="size-12 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${loc.image}")` }}></div>
                                            <div>
                                                <p className="font-bold text-[#111418] dark:text-white">{loc.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{loc.country}</p>
                                            </div>
                                        </div>

                                        {/* Center: Duration Display */}
                                        <div className="flex-1 flex flex-col justify-center gap-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">{t('preferences.duration_label')}</label>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-slate-400 text-base">hourglass_top</span>
                                                {loc.stayDays ?? loc.daysRecommended} {t('common.days')} 
                                                {loc.stayHours ? `, ${loc.stayHours} ${t('common.hours')}` : ''}
                                            </div>
                                        </div>

                                        {/* Right: Edit */}
                                        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-600 pl-4">
                                            <button 
                                                onClick={() => setEditingLocId(loc.id)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors ml-2" 
                                                title={t('common.edit')}
                                            >
                                                <span className="material-symbols-outlined">edit_note</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Col (4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Total Trip Budget (Mandatory) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">{t('preferences.budget')} <span className="text-red-500">*</span></h3>
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                                    ${totalBudget[0]} - ${totalBudget[1] >= 20000 ? '20k+' : totalBudget[1]}
                                </span>
                            </div>
                            
                            <div className="relative h-12 flex items-center select-none touch-none" ref={totalBudgetSliderRef}>
                                <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="absolute h-full bg-primary" style={{ left: `${(totalBudget[0] / 20000) * 100}%`, right: `${100 - (totalBudget[1] / 20000) * 100}%` }}></div>
                                </div>
                                <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(totalBudget[0] / 20000) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'total', 'min')}><div className="size-1.5 bg-primary rounded-full"></div></div>
                                <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(totalBudget[1] / 20000) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'total', 'max')}><div className="size-1.5 bg-primary rounded-full"></div></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{t('preferences.budget_note')}</p>
                        </div>

                        {/* Transport Mode (Optional) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 relative">
                             <div className="flex items-center gap-3 mb-4">
                                <input 
                                    type="checkbox" 
                                    checked={enableTransport} 
                                    onChange={(e) => setEnableTransport(e.target.checked)}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <h3 className={`text-lg font-bold leading-tight ${enableTransport ? 'text-[#111418] dark:text-white' : 'text-slate-400'}`}>{t('preferences.transport')}</h3>
                            </div>
                            
                            <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${enableTransport ? '' : 'opacity-40 pointer-events-none grayscale'}`}>
                                {[
                                    { name: 'Flight', icon: 'flight' },
                                    { name: 'Train', icon: 'train' },
                                    { name: 'Car', icon: 'directions_car' },
                                    { name: 'Bus', icon: 'directions_bus' }
                                ].map((mode) => (
                                    <label key={mode.name} className="cursor-pointer group relative">
                                        <input 
                                            type="radio" 
                                            name="transport" 
                                            className="peer sr-only" 
                                            checked={transport === mode.name} 
                                            onChange={() => setTransport(mode.name)}
                                            disabled={!enableTransport}
                                        />
                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-transparent bg-[#f0f2f4] dark:bg-gray-700 peer-checked:bg-primary/10 peer-checked:border-primary transition-all hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <span className={`material-symbols-outlined mb-1 text-[28px] ${transport === mode.name ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{mode.icon}</span>
                                            <span className={`text-sm font-medium ${transport === mode.name ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{mode.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Preferences (Optional) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col gap-6 relative">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <input 
                                        type="checkbox" 
                                        checked={enableInterests} 
                                        onChange={(e) => setEnableInterests(e.target.checked)}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <h3 className={`text-lg font-bold leading-tight ${enableInterests ? 'text-[#111418] dark:text-white' : 'text-slate-400'}`}>{t('preferences.interests')}</h3>
                                </div>
                                
                                <div className={`transition-all duration-300 ${enableInterests ? '' : 'opacity-40 pointer-events-none grayscale'}`}>
                                    {/* Input Field */}
                                    <div className="flex gap-2 mb-4">
                                        <input 
                                            type="text" 
                                            value={prefInput}
                                            onChange={(e) => setPrefInput(e.target.value)}
                                            onKeyDown={handlePrefKeyDown}
                                            placeholder={t('preferences.add_interest_placeholder')}
                                            className="flex-1 rounded-lg border border-[#dbe0e5] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111418] dark:text-white focus:border-primary focus:ring-0 placeholder:text-gray-400 focus:outline-none px-4 py-2 text-sm"
                                        />
                                        <button 
                                            onClick={addPreference}
                                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
                                        >
                                            {t('common.add')}
                                        </button>
                                    </div>

                                    {/* Selected Preferences */}
                                    {preferences.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {preferences.map(pref => (
                                                <button 
                                                    key={pref} 
                                                    onClick={() => removePreference(pref)}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent bg-primary/10 text-primary hover:bg-primary/20 hover:text-red-500 transition-colors flex items-center gap-1 group"
                                                >
                                                    {pref}
                                                    <span className="material-symbols-outlined text-[16px] group-hover:text-red-500">close</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggested Presets */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('preferences.suggestions')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {PRESETS.filter(p => !preferences.includes(p)).map(p => (
                                                <button 
                                                    key={p} 
                                                    onClick={() => togglePreset(p)}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Budget (Optional) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col gap-6 relative">
                            <div className="flex items-center gap-3 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={enableDetailedBudget} 
                                    onChange={(e) => setEnableDetailedBudget(e.target.checked)}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <h3 className={`text-lg font-bold leading-tight ${enableDetailedBudget ? 'text-[#111418] dark:text-white' : 'text-slate-400'}`}>{t('preferences.spending')}</h3>
                            </div>

                            <div className={`flex flex-col gap-6 transition-all duration-300 ${enableDetailedBudget ? '' : 'opacity-40 pointer-events-none grayscale'}`}>
                                {/* Budget Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight">{t('preferences.accommodation')}</h3>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                                            ${budget[0]} - ${budget[1] >= 1000 ? '1000+' : budget[1]} <span className="text-xs font-medium opacity-70">{t('preferences.night')}</span>
                                        </span>
                                    </div>
                                    
                                    <div className="relative h-12 flex items-center select-none touch-none" ref={budgetSliderRef}>
                                        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="absolute h-full bg-slate-400 dark:bg-slate-500" style={{ left: `${(budget[0] / 1000) * 100}%`, right: `${100 - (budget[1] / 1000) * 100}%` }}></div>
                                        </div>
                                        <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(budget[0] / 1000) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'budget', 'min')}><div className="size-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div></div>
                                        <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(budget[1] / 1000) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'budget', 'max')}><div className="size-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div></div>
                                    </div>
                                </div>
                                
                                <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>

                                {/* Dining Budget & Style */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight">{t('preferences.dining')}</h3>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                                            ${diningBudget[0]} - ${diningBudget[1] >= 300 ? '300+' : diningBudget[1]} <span className="text-xs font-medium opacity-70">{t('preferences.person')}</span>
                                        </span>
                                    </div>
                                    
                                    <div className="relative h-12 flex items-center select-none touch-none" ref={diningSliderRef}>
                                        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="absolute h-full bg-slate-400 dark:bg-slate-500" style={{ left: `${(diningBudget[0] / 300) * 100}%`, right: `${100 - (diningBudget[1] / 300) * 100}%` }}></div>
                                        </div>
                                        <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(diningBudget[0] / 300) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'dining', 'min')}><div className="size-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div></div>
                                        <div className="absolute size-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-10" style={{ left: `calc(${(diningBudget[1] / 300) * 100}% - 12px)` }} onMouseDown={(e) => startDrag(e, 'dining', 'max')}><div className="size-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 z-20 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-[#e5e7eb] dark:border-gray-800 p-4">
          <div className="flex justify-between items-center max-w-[960px] mx-auto">
              <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-lg text-[#111418] dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                  {t('preferences.back')}
              </button>
               <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02]">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {t('preferences.generate')}
              </button>
          </div>
      </div>

      {/* MODAL: Detailed Location Edit */}
      {editingLocation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up" onClick={() => setEditingLocId(null)}></div>
             <div className="relative w-full max-w-md bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-[#111418] dark:text-white">{t('common.edit')}: {editingLocation.name}</h3>
                    <button onClick={() => setEditingLocId(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-4 flex flex-col gap-6">
                    {/* Duration Selectors */}
                    <div>
                         <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('modal.duration_label')}</label>
                         <div className="flex gap-4">
                            <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase mb-1">{t('common.days')}</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="size-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                                        onClick={() => updateLocationDuration(editingLocation.id, Math.max(0, (editingLocation.stayDays ?? editingLocation.daysRecommended) - 1), editingLocation.stayHours || 0)}
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="text-xl font-bold w-6 text-center">{editingLocation.stayDays ?? editingLocation.daysRecommended}</span>
                                    <button 
                                        className="size-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 text-primary"
                                        onClick={() => updateLocationDuration(editingLocation.id, (editingLocation.stayDays ?? editingLocation.daysRecommended) + 1, editingLocation.stayHours || 0)}
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                             <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase mb-1">{t('common.hours')}</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="size-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                                        onClick={() => updateLocationDuration(editingLocation.id, editingLocation.stayDays ?? editingLocation.daysRecommended, Math.max(0, (editingLocation.stayHours || 0) - 1))}
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="text-xl font-bold w-6 text-center">{editingLocation.stayHours || 0}</span>
                                    <button 
                                        className="size-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 text-primary"
                                        onClick={() => updateLocationDuration(editingLocation.id, editingLocation.stayDays ?? editingLocation.daysRecommended, Math.min(23, (editingLocation.stayHours || 0) + 1))}
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('common.notes')}</label>
                        <textarea 
                            className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm outline-none resize-none text-[#111418] dark:text-white focus:ring-1 focus:ring-primary"
                            value={editingLocation.userNotes || ''}
                            onChange={(e) => {
                                const newLocs = selectedLocations.map(l => l.id === editingLocation.id ? {...l, userNotes: e.target.value} : l);
                                setSelectedLocations(newLocs);
                            }}
                            placeholder={t('preferences.notes_placeholder')}
                        ></textarea>
                    </div>
                    
                    <button onClick={() => setEditingLocId(null)} className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors">{t('preferences.save_details')}</button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesPage;
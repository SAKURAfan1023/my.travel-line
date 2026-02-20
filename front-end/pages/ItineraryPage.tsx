import React, { useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
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
    mapCenter: { lng: 135.7681, lat: 35.0116 },
    budgetRange: { min: 60000, max: 70000, currency: "¥" },
    mapPins: [
      {
        id: 1,
        name: "Kinkaku-ji",
        top: "32%",
        left: "24%",
        lng: 135.729243,
        lat: 35.03937,
        title: "Kinkaku-ji (Golden Pavilion)",
        duration: "1.5h Stay",
        description: "Iconic Zen Buddhist temple covered in gold leaf.",
        aiStrategy: "Best viewed in the morning light reflecting on the pond. Arrive early.",
        stopNumber: "Stop #1"
      },
      {
        id: 2,
        name: "Fushimi Inari",
        top: "38%",
        left: "40%",
        lng: 135.7727,
        lat: 34.9671,
        active: true,
        title: "Fushimi Inari Shrine",
        duration: "2h Stay",
        description: "Famous for its thousands of vermilion torii gates.",
        aiStrategy: "Arrive before 8 AM to avoid the main crowds. The hike to the summit takes about 2-3 hours round trip.",
        stopNumber: "Stop #2"
      },
      {
        id: 3,
        name: "Kiyomizu-dera",
        top: "45%",
        left: "55%",
        lng: 135.7846,
        lat: 34.9949,
        title: "Kiyomizu-dera",
        duration: "2h Stay",
        description: "Historic temple with a massive wooden stage.",
        aiStrategy: "Sunset views are spectacular. Be prepared for crowds.",
        stopNumber: "Stop #3"
      }
    ],
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
        pinId: 1,
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
        pinId: 2,
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
    mapCenter: { lng: 135.7681, lat: 35.0116 },
    budgetRange: { min: 60000, max: 70000, currency: "¥" },
    mapPins: [
      {
        id: 1,
        name: "金阁寺",
        top: "32%",
        left: "24%",
        lng: 135.729243,
        lat: 35.03937,
        title: "金阁寺",
        duration: "停留 1.5小时",
        description: "标志性的禅宗寺庙，覆盖着金箔。",
        aiStrategy: "建议在晨光映照的池塘边观赏最佳。请尽早到达。",
        stopNumber: "第 1 站"
      },
      {
        id: 2,
        name: "伏见稻荷",
        top: "38%",
        left: "40%",
        lng: 135.7727,
        lat: 34.9671,
        active: true,
        title: "伏见稻荷大社",
        duration: "停留 2小时",
        description: "以成千上万的朱红色鸟居闻名的神社。",
        aiStrategy: "建议早上 8 点前到达以避开拥挤人群。徒步至山顶往返约需 2-3 小时。",
        stopNumber: "第 2 站"
      },
      {
        id: 3,
        name: "清水寺",
        top: "45%",
        left: "55%",
        lng: 135.7846,
        lat: 34.9949,
        title: "清水寺",
        duration: "停留 2小时",
        description: "历史悠久的寺庙，拥有巨大的木制舞台。",
        aiStrategy: "日落景色壮观。请做好应对拥挤人群的准备。",
        stopNumber: "第 3 站"
      }
    ],
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
        pinId: 1,
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
        pinId: 2,
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

  // State for itinerary content
  const [content, setContent] = useState<any>(itineraryContent[language]);
  const [loading, setLoading] = useState(true);
  const [selectedPinKey, setSelectedPinKey] = useState<string | null>(null); // Controls the details overlay
  const [focusedPinKey, setFocusedPinKey] = useState<string | null>(null); // Controls the visual highlighting
  const [mapZoom, setMapZoom] = useState(11);
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const AMapRef = React.useRef<any>(null); // Store AMap class reference
  const markersRef = React.useRef<any[]>([]);
  const ignoreNextMapClickRef = React.useRef(false);
  const mapClickHandlerRef = React.useRef<(() => void) | null>(null);
  const mapZoomHandlerRef = React.useRef<(() => void) | null>(null);
  const hasInitialFitRef = React.useRef(false);

  React.useEffect(() => {
    // Check if we have generated data in localStorage
    const savedData = localStorage.getItem('generatedItinerary');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure parsed data matches expected structure or merge
        setContent(parsed);
      } catch (e) {
        console.error("Failed to parse saved itinerary", e);
      }
    }
    setLoading(false);
  }, []);

  const days = React.useMemo(() => {
    if (Array.isArray(content?.days) && content.days.length > 0) return content.days;
    return [content];
  }, [content]);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const activeDay = React.useMemo(() => {
    const safeIndex = Math.min(activeDayIndex, Math.max(0, days.length - 1));
    return days[safeIndex] ?? days[0];
  }, [days, activeDayIndex]);

  React.useEffect(() => {
    if (activeDayIndex > days.length - 1) {
      setActiveDayIndex(0);
    }
  }, [activeDayIndex, days.length]);

  React.useEffect(() => {
    setSelectedPinKey(null);
    setFocusedPinKey(null);
  }, [activeDayIndex]);

  const orderedPins = React.useMemo(() => {
    let seq = 1;
    const pins: Array<any> = [];

    days.forEach((day: any, dayIndex: number) => {
      (day?.mapPins || []).forEach((pin: any, pinIndex: number) => {
        const key = `${dayIndex}:${pin?.id ?? pinIndex}`;
        const providedSeq = Number(pin?.seq);
        const displaySeq = Number.isFinite(providedSeq) && providedSeq > 0 ? providedSeq : seq;
        if (!(Number.isFinite(providedSeq) && providedSeq > 0)) seq += 1;

        pins.push({
          ...pin,
          __key: key,
          __dayIndex: dayIndex,
          __seq: displaySeq,
        });
      });
    });

    const hasAnyProvidedSeq = pins.some((p) => Number.isFinite(Number(p?.seq)) && Number(p?.seq) > 0);
    if (hasAnyProvidedSeq) {
      return pins.sort((a, b) => Number(a.__seq) - Number(b.__seq));
    }
    return pins;
  }, [days]);

  const findPinForEvent = React.useCallback(
    (dayIndex: number, event: any) => {
      if (!event) return null;
      // 1. Try explicit ID match
      const pinId = event?.pinId ?? event?.mapPinId ?? event?.pin_id;
      if (pinId != null) {
        const byId = orderedPins.find(
          (pin) => pin.__dayIndex === dayIndex && String(pin.id) === String(pinId)
        );
        if (byId) return byId;
      }
      // 2. Try Name/Title fuzzy match
      const eventTitle = event?.title;
      if (eventTitle) {
        const byName = orderedPins.find((pin) => {
          if (pin.__dayIndex !== dayIndex) return false;
          const pName = pin.name || "";
          const pTitle = pin.title || "";
          return (
            (pName && eventTitle.includes(pName)) ||
            (pTitle && eventTitle.includes(pTitle)) ||
            (pName && pName.includes(eventTitle))
          );
        });
        if (byName) return byName;
      }
      return null;
    },
    [orderedPins]
  );

  const focusPin = React.useCallback((pin: any, showDetails: boolean = true) => {
    if (!pin?.lng || !pin?.lat) return;
    setActiveDayIndex(pin.__dayIndex ?? 0);
    setFocusedPinKey(pin.__key);
    if (showDetails) {
      setSelectedPinKey(pin.__key);
    } else {
      setSelectedPinKey(null);
    }
    setMapCenter({ lng: pin.lng, lat: pin.lat });
    setMapZoom((z) => (z < 14 ? 14 : z));
  }, []);

  const timelineScrollRef = React.useRef<HTMLDivElement | null>(null);
  const daySectionRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const timelineEventRefs = React.useRef<Array<Array<HTMLDivElement | null>>>([]);
  const timelineScrollRafRef = React.useRef<number | null>(null);

  const scrollToDay = React.useCallback((dayIndex: number) => {
    const container = timelineScrollRef.current;
    const target = daySectionRefs.current[dayIndex];
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;
      container.scrollTo({ top: container.scrollTop + relativeTop - 8, behavior: 'smooth' });
    }
    setActiveDayIndex(dayIndex);
  }, []);

  const scrollToEvent = React.useCallback((dayIndex: number, eventIndex: number) => {
    const container = timelineScrollRef.current;
    const target = timelineEventRefs.current?.[dayIndex]?.[eventIndex];
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;
      container.scrollTo({ top: container.scrollTop + relativeTop - 24, behavior: 'smooth' });
    }
    setActiveDayIndex(dayIndex);
  }, []);

  const findEventIndexForPin = React.useCallback(
    (pin: any) => {
      const dayIndex = pin?.__dayIndex ?? 0;
      const day = days[dayIndex];
      if (!day) return null;
      const timeline = day?.timeline || [];
      const pinId = pin?.id;
      const pinName = pin?.name;
      const pinTitle = pin?.title;

      for (let i = 0; i < timeline.length; i += 1) {
        const event = timeline[i];
        // 1. ID match
        const eventPinId = event?.pinId ?? event?.mapPinId ?? event?.pin_id;
        if (pinId != null && eventPinId != null && String(pinId) === String(eventPinId)) {
          return { dayIndex, eventIndex: i };
        }
        // 2. Name match
        if (event.title) {
          if (pinName && event.title.includes(pinName)) return { dayIndex, eventIndex: i };
          if (pinTitle && event.title.includes(pinTitle)) return { dayIndex, eventIndex: i };
          if (pinName && pinName.includes(event.title)) return { dayIndex, eventIndex: i };
        }
      }
      return null;
    },
    [days]
  );

  const handleTimelineScroll = React.useCallback(() => {
    if (timelineScrollRafRef.current != null) return;
    timelineScrollRafRef.current = window.requestAnimationFrame(() => {
      timelineScrollRafRef.current = null;
      const container = timelineScrollRef.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      daySectionRefs.current.forEach((el, idx) => {
        if (!el) return;
        const distance = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = idx;
        }
      });

      setActiveDayIndex((prev) => (prev === bestIndex ? prev : bestIndex));
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (timelineScrollRafRef.current != null) {
        window.cancelAnimationFrame(timelineScrollRafRef.current);
        timelineScrollRafRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (content?.mapCenter?.lng && content?.mapCenter?.lat) {
      setMapCenter({ lng: content.mapCenter.lng, lat: content.mapCenter.lat });
      return;
    }
    const firstPin = activeDay?.mapPins?.find((pin: any) => pin?.lng && pin?.lat);
    if (firstPin) {
      setMapCenter({ lng: firstPin.lng, lat: firstPin.lat });
    }
  }, [content, activeDay]);

  React.useEffect(() => {
    hasInitialFitRef.current = false;
  }, [content]);

  const resolvedCenter = mapCenter || { lng: 116.397428, lat: 39.90923 };
  const amapKey = ((import.meta as any).env?.VITE_AMAP_JS_KEY || (import.meta as any).env?.VITE_AMAP_KEY) as string | undefined;
  const amapSecurityCode = (import.meta as any).env?.VITE_AMAP_SECURITY_CODE as string | undefined;

  // Initialize Map
  React.useEffect(() => {
    if (!amapKey) {
      setMapError(true);
      return;
    }

    if (amapSecurityCode) {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: amapSecurityCode,
      };
    }

    AMapLoader.load({
      key: amapKey,
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.ToolBar"], // Removed ControlBar which can cause issues with some keys/versions
    })
      .then((AMap) => {
        AMapRef.current = AMap;
        setIsMapLoaded(true);
      })
      .catch((e) => {
        console.error("AMap load failed", e);
        setMapError(true);
      });

    return () => {
      if (mapRef.current) {
        if (mapClickHandlerRef.current) {
          mapRef.current.off('click', mapClickHandlerRef.current);
          mapClickHandlerRef.current = null;
        }
        if (mapZoomHandlerRef.current) {
          mapRef.current.off('zoomend', mapZoomHandlerRef.current);
          mapZoomHandlerRef.current = null;
        }
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [amapKey]);

  // Initialize Map
  React.useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || !AMapRef.current || mapRef.current) return;

    const AMap = AMapRef.current;
    try {
      const map = new AMap.Map(mapContainerRef.current, {
        zoom: mapZoom,
        center: [resolvedCenter.lng, resolvedCenter.lat],
        viewMode: '2D', // Force 2D to avoid WebGL/Key issues
      });
      map.addControl(new AMap.Scale());
      map.addControl(new AMap.ToolBar({ position: 'LT' }));
      const handleMapClick = () => {
        if (ignoreNextMapClickRef.current) {
          ignoreNextMapClickRef.current = false;
          return;
        }
        setSelectedPinKey(null);
        setFocusedPinKey(null);
      };
      mapClickHandlerRef.current = handleMapClick;
      map.on('click', handleMapClick);
      const handleZoomEnd = () => {
        const nextZoom = map.getZoom();
        if (typeof nextZoom === 'number') {
          setMapZoom(nextZoom);
        }
      };
      mapZoomHandlerRef.current = handleZoomEnd;
      map.on('zoomend', handleZoomEnd);
      mapRef.current = map;
    } catch (e) {
      console.error("Map init failed", e);
      setMapError(true);
    }

    return () => {
      if (mapRef.current) {
        if (mapClickHandlerRef.current) {
          mapRef.current.off('click', mapClickHandlerRef.current);
          mapClickHandlerRef.current = null;
        }
        if (mapZoomHandlerRef.current) {
          mapRef.current.off('zoomend', mapZoomHandlerRef.current);
          mapZoomHandlerRef.current = null;
        }
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [isMapLoaded]);

  // Update Map View & Markers
  React.useEffect(() => {
    if (!mapRef.current || !AMapRef.current) return;

    const AMap = AMapRef.current;
    const map = mapRef.current;

    // Update View
    const currentZoom = map.getZoom();
    if (currentZoom !== mapZoom) {
      map.setZoom(mapZoom);
    }
    // Only update center if distance is significant to avoid jitter or conflict with drag
    const currentCenter = map.getCenter();
    const currentLng = typeof currentCenter?.getLng === 'function' ? currentCenter.getLng() : currentCenter.lng;
    const currentLat = typeof currentCenter?.getLat === 'function' ? currentCenter.getLat() : currentCenter.lat;

    if (Math.abs(currentLng - resolvedCenter.lng) > 0.0001 || Math.abs(currentLat - resolvedCenter.lat) > 0.0001) {
      map.setCenter([resolvedCenter.lng, resolvedCenter.lat]);
    }

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    orderedPins.forEach((pin: any) => {
      if (!pin?.lng || !pin?.lat) return;
      const displayNumber = pin?.__seq ?? pin?.seq ?? pin?.id;
      const isActive = pin.__key === focusedPinKey;
      const badgeColor = isActive ? 'bg-primary text-white' : 'bg-slate-700 text-white';
      const ringColor = isActive ? 'ring-primary/30 dark:ring-primary/40' : 'ring-white/50 dark:ring-black/20';
      const scaleClass = isActive ? 'scale-110' : '';
      const markerContent = `
        <div class="relative group cursor-pointer transform transition-transform hover:scale-110 ${scaleClass}">
          <div class="w-10 h-10 ${badgeColor} rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ${ringColor} text-sm transition-colors">
            ${displayNumber}
          </div>
          <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-surface-dark px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-slate-800 dark:text-white pointer-events-none z-50">
            ${pin.name}
          </div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: [pin.lng, pin.lat],
        content: markerContent,
        offset: new AMap.Pixel(-20, -20), // Center the custom marker (40x40 / 2)
        zIndex: isActive ? 200 : pin.__dayIndex === activeDayIndex ? 120 : 50,
      });

      marker.on('click', () => {
        ignoreNextMapClickRef.current = true;
        // Map click -> show details
        setSelectedPinKey(pin.__key);
        setFocusedPinKey(pin.__key);
        const matchedEvent = findEventIndexForPin(pin);
        if (matchedEvent) {
          window.requestAnimationFrame(() => {
            scrollToEvent(matchedEvent.dayIndex, matchedEvent.eventIndex);
          });
        }
      });

      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });

    if (!hasInitialFitRef.current && markersRef.current.length > 0) {
      mapRef.current.setFitView(markersRef.current);
      const nextZoom = mapRef.current.getZoom();
      const center = mapRef.current.getCenter();
      const nextCenter = {
        lng: typeof center?.getLng === 'function' ? center.getLng() : center.lng,
        lat: typeof center?.getLat === 'function' ? center.getLat() : center.lat,
      };
      setMapZoom(nextZoom);
      setMapCenter(nextCenter);
      hasInitialFitRef.current = true;
    }
  }, [isMapLoaded, orderedPins, selectedPinKey, focusedPinKey, activeDayIndex, mapZoom, resolvedCenter.lng, resolvedCenter.lat, findEventIndexForPin, scrollToEvent]);

  const handleZoomIn = () => setMapZoom((z) => Math.min(18, z + 1));
  const handleZoomOut = () => setMapZoom((z) => Math.max(3, z - 1));
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setMapZoom((z) => Math.max(z, 12));
      },
      () => null
    );
  };

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
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full"></div>
          {!amapKey || mapError ? (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 flex items-center justify-center"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuABk1kntWQuUoSv7HCayE55jch7f8bJTmMPewp9llbZ2phY2dAu4NZLou3m2MsoLbx1USyAfqKr3SFjEVwumj0djJYXtap6Jod6OWPX3kypdnQ9BnTCIu6sSNUXMQ2i-C9GaiGkd6p-4SF6U3Yb2jYonC1Sa63TrXCsqgkhYYy7WkBQnGx9MZx2wo7kZUHrczAKFvu4rlDvMo0LQ2rBE5lsp8vjIl7TMpZWev6Sho7FegjYynVNbr3H2jXrx2p8lgZ1t4vzzg")', filter: 'brightness(0.95)' }}
            >
              <div className="px-4 py-2 rounded-lg bg-white/90 dark:bg-surface-dark/90 text-slate-700 dark:text-slate-200 text-sm font-medium">
                地图加载失败，请检查高德 JS Key/安全密钥/域名白名单
              </div>
            </div>
          ) : null}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none"></div>

          {/* Zoom
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
            <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <button onClick={handleZoomIn} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white border-b border-slate-200 dark:border-slate-700 transition-colors"><span className="material-symbols-outlined">add</span></button>
              <button onClick={handleZoomOut} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors"><span className="material-symbols-outlined">remove</span></button>
            </div>
            <button onClick={handleLocate} className="p-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined">my_location</span></button>
          </div> */}

          {/* Detail Overlay */}
          {(() => {
            const selectedPin = orderedPins.find((p: any) => p.__key === selectedPinKey);
            if (!selectedPin) return null;

            return (
              <div className="absolute z-40" style={{ top: '22%', left: '43%' }}>
                <div className="w-72 bg-white dark:bg-surfaw ring-1 ring-slate-900/5 dark:ring-white/10 shadow-xl rounded-xl overflow-hidden">
                  <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxphmBCFqD26UPGKl5qZs92FhWAFxCqetX3ec89rKFbl6VzKKaY58_8B9MoRVaZQtrfQv_rw0XZm4DsV0ateZSCZiWy1z-FpyxlessKJC2XU0liP4iWhfUR5hE8bwsuTMxKfSFTtsok0p1Whyd2vQm6NxMYhGM-Z6ul8bHm2B_Dw23OvT5mYbxtU0XfwgUHx6KSmVQKhAk4_3WnpiVq-Z_otsfqQuGOGZIUmGVVKsaEDA3VzXsZYoNNPRSzQ3grTk8l1Yd0Q")' }}>
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">{selectedPin.stopNumber || `Stop #${selectedPin.__seq ?? selectedPin.id}`}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPinKey(null); }}
                      className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  <div className="p-4 bg-white dark:bg-surface-dark">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{selectedPin.title || selectedPin.name}</h3>
                      {selectedPin.duration && <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded whitespace-nowrap ml-2">{selectedPin.duration}</span>}
                    </div>
                    {selectedPin.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{selectedPin.description}</p>}
                    {selectedPin.aiStrategy && (
                      <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                          <span className="text-xs font-bold text-primary uppercase">{t('itinerary.ai_rec')}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">{selectedPin.aiStrategy}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('itinerary.free_entry')}</span>
                      <button className="text-xs font-medium text-primary hover:text-blue-600 flex items-center">
                        {t('itinerary.more_details')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
                <span className="text-xl font-bold text-primary">
                  {(() => {
                    const budgetRange =
                      content?.budgetRange ||
                      (Array.isArray(content?.budget) ? { min: content.budget[0], max: content.budget[1], currency: '¥' } : null);
                    if (!budgetRange) return '—';
                    const currency = budgetRange.currency || '¥';
                    return `${currency}${Number(budgetRange.min).toLocaleString()} - ${Number(budgetRange.max).toLocaleString()}`;
                  })()}
                </span>
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

          <div
            ref={timelineScrollRef}
            onScroll={handleTimelineScroll}
            className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth bg-slate-50/50 dark:bg-transparent"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 flex-wrap">
                {days.map((day: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollToDay(idx)}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors border ${idx === activeDayIndex
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {day?.dayHeader || `Day ${idx + 1}`}
                  </button>
                ))}
              </div>

              <div className="relative pl-4 pb-4">
                <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                <div className="flex flex-col gap-10">
                  {days.map((day: any, dayIndex: number) => (
                    <div key={dayIndex} className="flex flex-col gap-6">
                      <div
                        ref={(el) => {
                          daySectionRefs.current[dayIndex] = el;
                        }}
                        className="flex items-center gap-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur py-3 z-10 border-b border-slate-100 dark:border-slate-800"
                      >
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-lg text-sm font-bold z-10">
                          {day?.dayHeader || `Day ${dayIndex + 1}`}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {day?.daySubHeader}
                          </h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{day?.dateShort}</span>
                      </div>

                      <div className="space-y-8 z-1">
                        {(day?.timeline || []).map((event: any, index: number) => {
                          const isExtra = Boolean(event?.isExtra);
                          const linkedPin = findPinForEvent(dayIndex, event);
                          const isActive = linkedPin?.__key === focusedPinKey;
                          return (
                            <div key={`${dayIndex}-${index}`} className="relative pl-8 group">
                              <div
                                className={`absolute left-[11px] top-4 size-4 bg-white dark:bg-background-dark border-4 rounded-full z-10 transition-colors ${isActive
                                  ? 'border-primary'
                                  : isExtra
                                    ? 'border-amber-300 dark:border-amber-700'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-primary'
                                  }`}
                              ></div>
                              <div
                                ref={(el) => {
                                  if (!timelineEventRefs.current[dayIndex]) {
                                    timelineEventRefs.current[dayIndex] = [];
                                  }
                                  timelineEventRefs.current[dayIndex][index] = el;
                                }}
                                onClick={() => {
                                  if (linkedPin) {
                                    // Timeline click -> focus but NO details
                                    focusPin(linkedPin, false);
                                  }
                                }}
                                className={`p-4 rounded-xl shadow-sm border transition-all cursor-pointer ${isExtra
                                  ? 'bg-amber-50/70 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-300'
                                  : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30'
                                  } ${isActive
                                    ? 'ring-2 ring-primary/30 border-primary/40 bg-primary/5 dark:bg-primary/10'
                                    : ''
                                  }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{event.time}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{event.title}</h3>
                                {event.description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">{event.description}</p>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                  {(event.tags || []).map((tag: any, i: number) => (
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
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

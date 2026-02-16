import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'zh';
type Theme = 'light' | 'dark';

const translations = {
  en: {
    'app.name': 'TravelAI',
    'common.days': 'Days',
    'common.hours': 'Hours',
    'common.day': 'Day',
    'common.remove': 'Remove',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.done': 'Done',
    'common.save': 'Save',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.guests': 'Guests',
    'common.notes': 'Notes',
    'nav.my_trips': 'My Trips',
    'nav.community': 'Community',
    'nav.settings': 'Settings',
    'nav.login': 'Log In',
    'nav.explore': 'Explore',
    'hero.title': 'Design Your \nPerfect Journey',
    'hero.subtitle': 'Explore destinations, build your route, and let AI handle the logistics.',
    'hero.search_placeholder': 'Where to? (e.g. Kyoto, Paris, Iceland)',
    'hero.plan_button': 'Plan',
    'hero.badge': 'AI-Powered Itinerary Builder',
    'step.1': 'Step 1 of 3',
    'step.2': 'Step 2 of 3',
    'location.title': 'Select Your Destinations',
    'location.subtitle': 'Search and add places to build your perfect route.',
    'location.add_another': 'Add another destination',
    'location.continue': 'Continue to Preferences',
    'location.your_route': 'Your Route',
    'location.search_placeholder': 'Search for cities, regions, or landmarks...',
    'location.empty_basket': 'No places added yet',
    'location.instruction': 'Add cities, regions, or landmarks to your trip. We\'ll help you organize the logistics later.',
    'filter.all': 'All',
    'filter.nature': 'Nature',
    'filter.city_break': 'City Break',
    'filter.historical': 'Historical',
    'filter.coastal': 'Coastal',
    'card.added': 'Added',
    'modal.duration_label': 'Duration of Stay',
    'modal.notes_label': 'Personal Notes & Wishes',
    'modal.notes_placeholder': 'E.g. Visit the ancient ruins, try street food...',
    'modal.remove_city': 'Remove City',
    'preferences.title': 'Fine-tune your adventure',
    'preferences.subtitle': 'Tell us your preferences so our AI can craft the perfect route for you.',
    'preferences.generate': 'Generate Itinerary',
    'preferences.back': 'Back',
    'preferences.edit_route': 'Edit Route',
    'preferences.travel_dates': 'Travel Dates',
    'preferences.timeline': 'Itinerary Timeline',
    'preferences.budget': 'Total Trip Budget',
    'preferences.transport': 'Transport Mode',
    'preferences.interests': 'Interests',
    'preferences.spending': 'Spending Breakdown',
    'preferences.destinations_count': 'Destinations',
    'preferences.date_instruction_1': 'Select your start and end dates. We recommend at least',
    'preferences.date_instruction_2': 'for your selected route.',
    'preferences.accommodation': 'Accommodation',
    'preferences.night': '/ night',
    'preferences.dining': 'Dining',
    'preferences.person': '/ person',
    'preferences.budget_note': 'Estimated range excluding international flights.',
    'preferences.suggestions': 'Suggestions',
    'preferences.add_interest_placeholder': 'Add interest...',
    'preferences.duration_label': 'Duration',
    'preferences.notes_placeholder': 'Add personal notes, specific places to visit, or reminders...',
    'preferences.save_details': 'Save Details',
    'itinerary.title': 'AI Travel Planner',
    'itinerary.regenerate': 'Regenerate Itinerary',
    'itinerary.est_cost': 'Est. Total Cost',
    'itinerary.pacing': 'Pacing',
    'itinerary.relaxed': 'Relaxed',
    'itinerary.must_see': 'Must See',
    'itinerary.crowded': 'Crowded',
    'itinerary.ai_rec': 'AI Recommendation',
    'itinerary.route_details': 'Route Details',
    'itinerary.more_details': 'More Details',
    'itinerary.free_entry': 'Free Entry',
    'trips.title': 'My Trips',
    'trips.new': 'New Trip',
    'trips.manage': 'Manage your planned adventures and drafts.',
    'trips.edit': 'Edit',
    'trips.view': 'View',
    'trips.traveler': 'Traveler',
    'trips.travelers': 'Travelers',
    'trips.start_new': 'Start a new AI itinerary',
    'status.upcoming': 'Upcoming',
    'status.completed': 'Completed',
    'status.draft': 'Draft',
  },
  zh: {
    'app.name': 'TravelAI',
    'common.days': '天',
    'common.hours': '小时',
    'common.day': '第', // Often used as 第X天
    'common.remove': '移除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.done': '完成',
    'common.save': '保存',
    'common.add': '添加',
    'common.search': '搜索',
    'common.guests': '位旅客',
    'common.notes': '备注',
    'nav.my_trips': '我的行程',
    'nav.community': '社区',
    'nav.settings': '设置',
    'nav.login': '登录',
    'nav.explore': '探索',
    'hero.title': '规划您的\n完美旅程',
    'hero.subtitle': '探索目的地，构建路线，让 AI 为您处理后勤工作。',
    'hero.search_placeholder': '去哪里？(例如 京都, 巴黎, 冰岛)',
    'hero.plan_button': '开始规划',
    'hero.badge': 'AI 驱动的行程生成器',
    'step.1': '第 1 步 / 共 3 步',
    'step.2': '第 2 步 / 共 3 步',
    'location.title': '选择目的地',
    'location.subtitle': '搜索并添加地点以构建您的完美路线。',
    'location.add_another': '添加另一个目的地',
    'location.continue': '继续设置偏好',
    'location.your_route': '您的路线',
    'location.search_placeholder': '搜索城市、地区或地标...',
    'location.empty_basket': '尚未添加地点',
    'location.instruction': '添加城市、地区或地标。我们会稍后帮您安排具体行程。',
    'filter.all': '全部',
    'filter.nature': '自然',
    'filter.city_break': '城市休闲',
    'filter.historical': '历史人文',
    'filter.coastal': '海滨',
    'card.added': '已添加',
    'modal.duration_label': '停留时长',
    'modal.notes_label': '个人备注与愿望',
    'modal.notes_placeholder': '例如：参观古迹，尝试街头美食...',
    'modal.remove_city': '移除城市',
    'preferences.title': '微调您的冒险',
    'preferences.subtitle': '告诉我们您的偏好，以便 AI 为您打造完美路线。',
    'preferences.generate': '生成行程',
    'preferences.back': '返回',
    'preferences.edit_route': '编辑路线',
    'preferences.travel_dates': '旅行日期',
    'preferences.timeline': '行程时间轴',
    'preferences.budget': '总预算',
    'preferences.transport': '交通方式',
    'preferences.interests': '兴趣爱好',
    'preferences.spending': '消费明细',
    'preferences.destinations_count': '个目的地',
    'preferences.date_instruction_1': '选择起止日期。对于当前路线，我们建议至少',
    'preferences.date_instruction_2': '。',
    'preferences.accommodation': '住宿',
    'preferences.night': '/ 晚',
    'preferences.dining': '餐饮',
    'preferences.person': '/ 人',
    'preferences.budget_note': '预估范围（不含国际机票）。',
    'preferences.suggestions': '建议',
    'preferences.add_interest_placeholder': '添加兴趣...',
    'preferences.duration_label': '时长',
    'preferences.notes_placeholder': '添加个人备注、特定景点或提醒...',
    'preferences.save_details': '保存详情',
    'itinerary.title': 'AI 旅行规划师',
    'itinerary.regenerate': '重新生成行程',
    'itinerary.est_cost': '预估总花费',
    'itinerary.pacing': '节奏',
    'itinerary.relaxed': '轻松',
    'itinerary.must_see': '必看',
    'itinerary.crowded': '拥挤',
    'itinerary.ai_rec': 'AI 建议',
    'itinerary.route_details': '路线详情',
    'itinerary.more_details': '更多详情',
    'itinerary.free_entry': '免费入场',
    'trips.title': '我的行程',
    'trips.new': '新建行程',
    'trips.manage': '管理您的计划行程和草稿。',
    'trips.edit': '编辑',
    'trips.view': '查看',
    'trips.traveler': '位旅客',
    'trips.travelers': '位旅客',
    'trips.start_new': '开始新的 AI 行程',
    'status.upcoming': '即将开始',
    'status.completed': '已完成',
    'status.draft': '草稿',
  }
};

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LocationSelectionPage from './pages/LocationSelectionPage';
import PreferencesPage from './pages/PreferencesPage';
import ItineraryPage from './pages/ItineraryPage';
import MyTripsPage from './pages/MyTripsPage';
import { Screen, SelectedLocation, TripLocation } from './types';
import { SettingsProvider } from './contexts/SettingsContext';

// Default recommendations data to initialize if needed, or we can fetch/import
const defaultLocations: TripLocation[] = [
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
  }
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');
  const [searchCity, setSearchCity] = useState<string>('');
  // Lifted state for selected locations
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);

  const handleStartPlanning = (city?: string) => {
    if (city) {
      setSearchCity(city);
    }
    setCurrentScreen('LOCATION_SELECT');
  };

  const goHome = () => setCurrentScreen('LANDING');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LANDING':
        return <LandingPage onStartPlanning={handleStartPlanning} onMyTrips={() => setCurrentScreen('MY_TRIPS')} />;
      case 'LOCATION_SELECT':
        return (
          <LocationSelectionPage 
            onBack={() => setCurrentScreen('LANDING')} 
            onNext={() => setCurrentScreen('PREFERENCES')} 
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            initialCity={searchCity}
          />
        );
      case 'PREFERENCES':
        return (
          <PreferencesPage 
            onBack={() => setCurrentScreen('LOCATION_SELECT')} 
            onNext={() => setCurrentScreen('ITINERARY')}
            onHome={goHome}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
          />
        );
      case 'ITINERARY':
        return <ItineraryPage onMyTrips={() => setCurrentScreen('MY_TRIPS')} onHome={goHome} />;
      case 'MY_TRIPS':
        return <MyTripsPage onBack={() => setCurrentScreen('LANDING')} />;
      default:
        return <LandingPage onStartPlanning={() => setCurrentScreen('LOCATION_SELECT')} onMyTrips={() => setCurrentScreen('MY_TRIPS')} />;
    }
  };

  return (
    <SettingsProvider>
      {renderScreen()}
    </SettingsProvider>
  );
};

export default App;
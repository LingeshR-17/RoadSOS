import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Set default coordinates for Lingesh in Madurai, Tamil Nadu
  const [userLocation, setUserLocation] = useState({
    latitude: 9.9252,
    longitude: 78.1198,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [nearestHospital, setNearestHospital] = useState({
    name: 'Grace Emergency Hospital',
    distance: '1.2 km',
    duration: '4 mins',
    address: '88, Ring Road Bypass, Madurai, Tamil Nadu 625020',
    latitude: 9.9320,
    longitude: 78.1250,
  });

  // Mock route points from User Location to Nearest Hospital
  const [routeCoordinates, setRouteCoordinates] = useState([
    { latitude: 9.9252, longitude: 78.1198 },
    { latitude: 9.9265, longitude: 78.1205 },
    { latitude: 9.9280, longitude: 78.1215 },
    { latitude: 9.9300, longitude: 78.1230 },
    { latitude: 9.9320, longitude: 78.1250 },
  ]);

  const updateLocation = (latitude, longitude) => {
    setUserLocation(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        nearestHospital,
        routeCoordinates,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationStore = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationStore must be used within a LocationProvider');
  }
  return context;
};

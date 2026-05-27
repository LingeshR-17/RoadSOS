import { useState, useEffect } from 'react';
import { useLocationStore } from '../store/locationStore';

export const useLocation = () => {
  const { userLocation, updateLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Mimic requesting permissions and reading location on mount
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      // Location is initialized via locationStore
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const simulateMovement = () => {
    // Drifts the coordinates slightly to demonstrate dynamic updating
    const driftLat = (Math.random() - 0.5) * 0.001;
    const driftLng = (Math.random() - 0.5) * 0.001;
    updateLocation(userLocation.latitude + driftLat, userLocation.longitude + driftLng);
  };

  return {
    location: userLocation,
    loading,
    errorMsg,
    simulateMovement,
  };
};

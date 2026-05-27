import { useState, useEffect } from 'react';
import { useLocationStore } from '../store/locationStore';

export const useNearestHospital = () => {
  const { nearestHospital, routeCoordinates } = useLocationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return {
    hospital: nearestHospital,
    route: routeCoordinates,
    loading,
  };
};

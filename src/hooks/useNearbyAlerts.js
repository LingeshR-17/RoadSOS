import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useLocation } from './useLocation';
import { api } from '../services/api';

/**
 * Custom Hook that pulls safety alerts streams dynamically from the backend
 * based on user coordinates and authentication state.
 */
export const useNearbyAlerts = () => {
  const { userToken } = useUserStore();
  const { location } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userToken) return;

    setLoading(true);
    api.fetchNearbyAlerts(userToken, location.latitude, location.longitude)
      .then((data) => {
        setAlerts(data);
      })
      .catch((err) => {
        console.error('[useNearbyAlerts] Error fetching safety stream:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userToken, location.latitude, location.longitude]);

  const addMockAlert = (newAlert) => {
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        ...newAlert
      },
      ...prev
    ]);
  };

  return {
    alerts,
    loading,
    addMockAlert,
  };
};

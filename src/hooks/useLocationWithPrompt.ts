import { useState } from 'react';

/**
 * Custom hook to fetch geolocation and prompt user if location access is denied or unavailable.
 * Returns: { fetchLocation, locationError, setLocationError }
 */
export function useLocationWithPrompt() {
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchLocation = (onSuccess: (coords: GeolocationCoordinates) => void) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError(null);
        onSuccess(position.coords);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access denied. Please enable location services in your browser or device settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location information is unavailable. Please check your device settings.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.');
        } else {
          setLocationError('Unable to fetch location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { fetchLocation, locationError, setLocationError };
}

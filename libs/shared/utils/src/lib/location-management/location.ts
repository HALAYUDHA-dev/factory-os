import { genGEOLOCATIONAPI } from './location.const.js';

export interface LocationResult {
  status: 'SUCCESS' | 'API_ERROR' | 'PERMISSION_OR_GPS_ERROR' | 'NOT_SUPPORTED';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  formattedAddress?: string;
  addressDetails?: string;
  message?: string;
  error?: string;
}

export function getUserAddress(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' || !navigator.geolocation) {
      reject({
        status: 'NOT_SUPPORTED',
        message: 'GeoLocation is not supported by your browser or environment',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const respone = await fetch(genGEOLOCATIONAPI(latitude, longitude), {
            headers: { 'User-Agent': 'NxApp/1.0' },
          });

          if (!respone.ok) throw new Error('Failed to fetch address from API');

          const data = await respone.json();

          resolve({
            status: 'SUCCESS',
            coordinates: { latitude, longitude },
            formattedAddress: data.display_name,
            addressDetails: data.address,
          });
        } catch (err: Error) {
          reject({
            status: 'API_ERROR',
            message: 'Coordinates acquired, but failed to fetch address.',
            error: err.message,
            coordinates: { latitude, longitude },
          });
        }
      },
      (geoError) => {
        let msg = 'An unknown error occurred.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'User denied the request for Geolocation.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'The request to get user location timed out.';
        }

        reject({
          status: 'PERMISSION_OR_GPS_ERROR',
          message: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

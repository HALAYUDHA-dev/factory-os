export const genGEOLOCATIONAPI = (latitude: number, longitude: number) =>
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

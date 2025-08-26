export function getInitialScale() {
  const width = window.innerWidth;
  if (width < 768) return 0.8; // Mobile
  if (width < 1024) return 1.0; // Tablet
  return 1.0; // Desktop
}

export function getCurrentDevice() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

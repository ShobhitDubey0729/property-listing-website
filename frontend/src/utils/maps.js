export function generateGoogleMapsEmbedUrl(lat, lng, queryTitle, zoom = 15) {
  const query = encodeURIComponent(`${lat},${lng} (${queryTitle || "PropLease STR Property"})`);
  return `https://maps.google.com/maps?q=${query}&hl=en&z=${zoom}&output=embed`;
}

export function generateGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getPatientRouteId() {
  const match = window.location.hash.match(/^#\/patients\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function openPatientPage(patientId) {
  window.location.hash = `#/patients/${encodeURIComponent(patientId)}`;
}

export function goToDashboard() {
  window.location.hash = "#/";
}

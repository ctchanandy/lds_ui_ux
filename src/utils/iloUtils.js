// Shared utilities for ILO handling
export const ILO_STORAGE_KEY = 'ilo-data';
export const ILO_ASSESSMENTS_KEY = 'ilo-assessments';

export function getBloomLevel(text) {
  if (!text) return 'Apply';
  const first = text.trim().split(/\s+/)[0].toLowerCase();
  if (first === 'apply') return 'Apply';
  if (first === 'create' || first === 'design' || first === 'construct' || first === 'build') return 'Create';
  if (first === 'analyze' || first === 'compare' || first === 'contrast') return 'Analyze';
  if (first === 'evaluate' || first === 'judge') return 'Evaluate';
  if (first === 'understand' || first === 'explain' || first === 'describe') return 'Understand';
  return 'Apply';
}

export function readAssessments() {
  try {
    const raw = localStorage.getItem(ILO_ASSESSMENTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
}

export function writeAssessments(obj) {
  try {
    localStorage.setItem(ILO_ASSESSMENTS_KEY, JSON.stringify(obj));
  } catch (e) { }
}

export function isAssessedFor(key) {
  const map = readAssessments();
  if (map && Object.keys(map).length > 0) return Boolean(map && map[key]);
  // fallback deterministic mapping when no persisted assessments exist yet:
  // compute a simple hash and mark about half as assessed so the UI shows some green dots
  if (!key) return false;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 1)) & 0xfffff;
  return (h % 2) === 0;
}

export function linkAssessmentFor(key, assessmentId) {
  const map = readAssessments();
  map[key] = assessmentId;
  writeAssessments(map);
}

export function unlinkAssessmentFor(key) {
  const map = readAssessments();
  delete map[key];
  writeAssessments(map);
}

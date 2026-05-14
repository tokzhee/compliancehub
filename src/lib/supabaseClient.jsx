// Supabase has been removed from this project.
// All data operations now go through the REST API (VITE_API_BASE_URL).
export function supabase(...args) {
  console.warn('supabase() called but Supabase has been removed. Use apiClient instead.', args);
  return null;
}

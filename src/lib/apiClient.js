// Re-export from centralized API client for backward compatibility
// export { default, tokenStorage } from '../api/apiClient';

function apiClient(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: apiClient is not implemented yet.', args);
  return null;
}

export default apiClient;
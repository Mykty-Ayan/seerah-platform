const API_URL = import.meta.env.VITE_API_URL || '/api'

export function api(path: string, options?: RequestInit) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

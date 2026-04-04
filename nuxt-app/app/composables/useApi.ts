
export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
        return $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
            ...options,
            headers: {
                ...authStore.authHeaders(),
                ...(options.headers as Record<string, string> | undefined),
            },
        })
    }

    return { apiFetch }
}
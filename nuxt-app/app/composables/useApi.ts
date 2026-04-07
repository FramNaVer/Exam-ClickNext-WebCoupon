
export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
        try {
            return await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
                ...options,
                headers: {
                    ...authStore.authHeaders(),
                    ...(options.headers as Record<string, string> | undefined),
                },
            })
        } catch (e: any) {
            if (e?.status === 401) authStore.logout()
            throw e
        }
    }

    return { apiFetch }
}
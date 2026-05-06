
export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    // SSR uses private internal URL (Docker DNS: backend:8080), browser uses public URL
    const baseUrl = () => import.meta.server
        ? ((config as any).apiBaseUrl || config.public.apiBaseUrl)
        : config.public.apiBaseUrl

    async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
        try {
            return await $fetch<T>(`${baseUrl()}${path}`, {
                ...options,
                headers: {
                    ...authStore.authHeaders(),
                    ...(options.headers as Record<string, string> | undefined),
                },
            })
        } catch (e: any) {
            // access token หมดอายุ → ลอง refresh แล้วยิงใหม่
            if (e?.status === 401 && authStore.refreshToken) {
                try {
                    await authStore.refresh()
                    return await $fetch<T>(`${baseUrl()}${path}`, {
                        ...options,
                        headers: {
                            ...authStore.authHeaders(),
                            ...(options.headers as Record<string, string> | undefined),
                        },
                    })
                } catch {
                    authStore.logout()
                }
            }
            if (e?.status === 401) authStore.logout()
            throw e
        }
    }

    return { apiFetch }
}
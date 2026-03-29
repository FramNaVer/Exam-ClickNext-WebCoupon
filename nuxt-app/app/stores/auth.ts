import { defineStore } from 'pinia'

interface User {
    id: number
    username: string
    points: number
}

export const useAuthStore = defineStore('auth', () => {
    const config = useRuntimeConfig()
    const token = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
    })
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    function authHeaders(): Record<string, string> {
        return token.value ? { Authorization: `Bearer ${token.value}` } : {}
    }

    async function fetchCurrentUser() {
        if (!token.value) return
        try {
            const data = await $fetch<{ success: boolean; data: User }>(
                `${config.public.apiBaseUrl}/api/user/profile`,
                { headers: authHeaders() }
            )
            user.value = data.data
        } catch {
            token.value = null
            user.value = null
        }
    }

    async function login(username: string, password: string) {
        const data = await $fetch<{ success: boolean; token: string; user: User }>(
            `${config.public.apiBaseUrl}/api/auth/login`,
            {
                method: 'POST',
                body: { username, password },
            }
        )
        token.value = data.token
        user.value = data.user
    }

    function logout() {
        token.value = null
        user.value = null
        navigateTo('/login')
    }

    return { token, user, isAuthenticated, authHeaders, fetchCurrentUser, login, logout }
})

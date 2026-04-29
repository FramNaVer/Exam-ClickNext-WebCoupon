import { defineStore } from 'pinia'

interface User {
    id: number
    username: string
    points: number
    role: string
}

export const useAuthStore = defineStore('auth', () => {
    const loading = ref(false)
    const error = ref('')

    const config = useRuntimeConfig()
    const token = useCookie<string | null>('auth_token', {
        maxAge: 60 * 15, // 15 minutes
        sameSite: 'lax',
    })
    const refreshToken = useCookie<string | null>('refresh_token', {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        httpOnly: false,
    })
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value || !!refreshToken.value)

    function authHeaders(): Record<string, string> {
        return token.value ? { Authorization: `Bearer ${token.value}` } : {}
    }

    // Role-based computed properties
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isUser = computed(() => user.value?.role === 'user')

    async function refresh() {
        if (!refreshToken.value) throw new Error('No refresh token')
        const data = await $fetch<{ success: boolean; token: string; refreshToken: string }>(
            `${config.public.apiBaseUrl}/api/auth/refresh`,
            { method: 'POST', body: { refreshToken: refreshToken.value } }
        )
        token.value = data.token
        refreshToken.value = data.refreshToken
    }

    async function fetchCurrentUser() {
        if (!token.value && !refreshToken.value) return
        if (!token.value) {
            try {
                await refresh()
            } catch {
                // refresh token หมดอายุ — ล้าง state แต่ไม่ navigate (ให้ middleware จัดการ)
                token.value = null
                refreshToken.value = null
                user.value = null
                return
            }
        }
        try {
            const data = await $fetch<{ success: boolean; user: User }>(
                `${config.public.apiBaseUrl}/api/user/profile`,
                { headers: authHeaders() }
            )
            user.value = data.user
        } catch {
            token.value = null
            user.value = null
        }
    }

    async function login(username: string, password: string) {
        const data = await $fetch<{ success: boolean; token: string; refreshToken: string; user: User }>(
            `${config.public.apiBaseUrl}/api/auth/login`,
            { method: 'POST', body: { username, password } }
        )
        token.value = data.token
        refreshToken.value = data.refreshToken
        user.value = data.user
        // console.log("Store: Login Success, User Role is:", data.user.role)
    }

    async function LoginAction(username: string, password: string) {
        error.value = ''
        loading.value = true

        try {
            await login(username, password)
            const target = isAdmin.value ? '/admin' : '/'
            return await navigateTo(target)

        } catch (e: any) {
            if (isNuxtError(e) || e.message?.includes('redirect')) throw e
            error.value = e?.data?.message || 'Invalid username or password'
        } finally {
            loading.value = false
        }

    }

    async function logout() {
        try {
            if (refreshToken.value) {
                await $fetch(`${config.public.apiBaseUrl}/api/auth/logout`, {
                    method: 'POST',
                    body: { refreshToken: refreshToken.value }
                })
            }
        } catch { }
        token.value = null
        refreshToken.value = null
        user.value = null
        // ไม่เรียก navigateTo ที่นี่ — ถ้าเรียกโดยไม่ await ใน async context จะเป็น unhandled rejection
        // ให้ component หรือ middleware ที่เรียก logout() จัดการ navigation เอง
    }


    return { token, refreshToken, user, isAuthenticated, authHeaders, refresh, fetchCurrentUser, login, LoginAction, logout, isAdmin, isUser }
})

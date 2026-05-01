export interface AdminUser {
    id: number
    username: string
    role: 'user' | 'admin'
    provider: string
    points: number
    created_at: string
}

export const useAdminUsers = () => {
    const { apiFetch } = useApi()

    const users = ref<AdminUser[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchUsers() {
        loading.value = true
        error.value = ''
        try {
            const data = await apiFetch<{ success: boolean; users: AdminUser[] }>('/api/admin/users')
            users.value = data.users
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load users'
        } finally {
            loading.value = false
        }
    }

    async function updateRole(userId: number, role: string) {
        const data = await apiFetch<{ success: boolean; user: AdminUser }>(
            `/api/admin/users/${userId}/role`,
            { method: 'PATCH', body: { role } }
        )
        const found = users.value.find(u => u.id === userId)
        if (found) found.role = data.user.role
        return data.user
    }

    async function updatePoints(userId: number, points: number) {
        const data = await apiFetch<{ success: boolean; user: AdminUser }>(
            `/api/admin/users/${userId}/points`,
            { method: 'PATCH', body: { points } }
        )
        const found = users.value.find(u => u.id === userId)
        if (found) found.points = data.user.points
        return data.user
    }

    return { users, loading, error, fetchUsers, updateRole, updatePoints }
}

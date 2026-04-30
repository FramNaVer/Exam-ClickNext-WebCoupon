export interface AdminReward {
    id: number
    title: string
    description: string | null
    points_required: number
    image_url: string | null
    public_id: string | null
    expiry_date: string | null
    redeem_start_date: string | null
    redeem_end_date: string | null
    terms_condition: string | null
    stock: number
    created_at: string
}

export const useAdminRewards = () => {
    const { apiFetch } = useApi()

    const rewards = ref<AdminReward[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchRewards() {
        loading.value = true
        error.value = ''
        try {
            const data = await apiFetch<{ success: boolean; rewards: AdminReward[] }>('/api/admin/rewards')
            rewards.value = data.rewards
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load rewards'
        } finally {
            loading.value = false
        }
    }

    async function createReward(formData: FormData) {
        const data = await apiFetch<{ success: boolean; reward: AdminReward }>(
            '/api/admin/rewards',
            { method: 'POST', body: formData }
        )
        rewards.value.unshift(data.reward)
        return data.reward
    }

    async function updateReward(id: number, formData: FormData) {
        const data = await apiFetch<{ success: boolean; reward: AdminReward }>(
            `/api/admin/rewards/${id}`,
            { method: 'PATCH', body: formData }
        )
        const idx = rewards.value.findIndex(r => r.id === id)
        if (idx !== -1) rewards.value[idx] = data.reward
        return data.reward
    }

    async function deleteReward(id: number) {
        await apiFetch(`/api/admin/rewards/${id}`, { method: 'DELETE' })
        rewards.value = rewards.value.filter(r => r.id !== id)
    }

    return { rewards, loading, error, fetchRewards, createReward, updateReward, deleteReward }
}

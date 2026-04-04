interface Reward {
    id: number
    name: string
    description: string
    pointsRequired: number
    imageUrl?: string
    stock: number
}

interface RedeemResult {
    success: boolean
    message: string
    remainingPoints: number
}

export const useRewards = () => {
    const { apiFetch } = useApi()
    const authStore = useAuthStore()

    const rewards = ref<Reward[]>([])
    const currentReward = ref<Reward | null>(null)
    const loading = ref(false)
    const error = ref('')

    async function fetchRewards() {
        loading.value = true
        error.value = ''
        try {
            const data = await apiFetch<{ success: boolean; data: Reward[] }>('/api/rewards')
            rewards.value = data.data
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load rewards'
        } finally {
            loading.value = false
        }
    }

    async function fetchReward(id: number) {
        loading.value = true
        error.value = ''
        try {
            const data = await apiFetch<{ success: boolean; data: Reward }>(`/api/rewards/${id}`)
            currentReward.value = data.data
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load reward'
        } finally {
            loading.value = false
        }
    }

    async function redeemReward(id: number): Promise<RedeemResult> {
        const data = await apiFetch<{ success: boolean; message: string; data: { remainingPoints: number } }>(
            `/api/redeem`,
            { method: 'POST', body: { rewardId: id } }
        )
        // Update user points in auth store
        if (authStore.user) {
            authStore.user = { ...authStore.user, points: data.data.remainingPoints }
        }
        return { success: data.success, message: data.message, remainingPoints: data.data.remainingPoints }
    }

    return { rewards, currentReward, loading, error, fetchRewards, fetchReward, redeemReward }
}

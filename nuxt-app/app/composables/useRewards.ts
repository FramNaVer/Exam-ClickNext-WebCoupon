interface Reward {
    id: number
    title: string
    description: string
    points_required: number
    image_url?: string
    expiry_date?: string
    redeem_start_date?: string
    redeem_end_date?: string
    terms_condition?: string
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
            const data = await apiFetch<{ success: boolean; rewards: Reward[] }>('/api/rewards')
            rewards.value = data.rewards
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
            const data = await apiFetch<{ success: boolean; reward: Reward }>(`/api/rewards/${id}`)
            currentReward.value = data.reward
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load reward'
        } finally {
            loading.value = false
        }
    }

    async function redeemReward(id: number): Promise<RedeemResult> {
        const data = await apiFetch<{ success: boolean; message: string; data: object }>(
            `/api/redeem/${id}`,
            { method: 'POST' }
        )
        // Refetch user to get updated points
        await authStore.fetchCurrentUser()
        return { success: data.success, message: data.message, remainingPoints: authStore.user?.points ?? 0 }
    }

    return { rewards, currentReward, loading, error, fetchRewards, fetchReward, redeemReward }
}

interface RedemptionHistory {
    id: number
    rewardId: number
    rewardName: string
    pointsSpent: number
    redeemedAt: string
}

export const useProfile = () => {
    const { apiFetch } = useApi()

    const history = ref<RedemptionHistory[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchHistory() {
        loading.value = true
        error.value = ''
        try {
            const data = await apiFetch<{ success: boolean; data: RedemptionHistory[] }>('/api/user/history')
            history.value = data.data
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load history'
        } finally {
            loading.value = false
        }
    }

    return { history, loading, error, fetchHistory }
}

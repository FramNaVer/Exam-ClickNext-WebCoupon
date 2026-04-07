export const useRedeem = () => {
    const { redeemReward } = useRewards()

    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const showConfirm = ref(false)

    function openConfirm() {
        error.value = ''
        success.value = ''
        showConfirm.value = true
    }

    function cancelConfirm() {
        showConfirm.value = false
    }

    async function confirm(rewardId: number) {
        loading.value = true
        error.value = ''
        try {
            const result = await redeemReward(rewardId)
            success.value = result.message || 'Reward redeemed successfully!'
            showConfirm.value = false
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to redeem reward'
            showConfirm.value = false
        } finally {
            loading.value = false
        }
    }

    return { loading, error, success, showConfirm, openConfirm, cancelConfirm, confirm }
}

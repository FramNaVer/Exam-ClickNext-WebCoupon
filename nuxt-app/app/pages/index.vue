<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { rewards, loading, error, fetchRewards } = useRewards()
onMounted(fetchRewards)
</script>

<template>
    <div class="min-h-screen bg-zinc-50">
        <div class="max-w-5xl mx-auto px-6 py-6">

            <h2 class="text-lg font-semibold text-zinc-900 mb-4">Available Rewards</h2>

            <!-- Loading -->
            <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="i in 8" :key="i"
                    class="bg-white rounded-2xl overflow-hidden border border-zinc-100 animate-pulse">
                    <div class="w-full aspect-square bg-zinc-100" />
                    <div class="p-3 space-y-2">
                        <div class="h-3.5 bg-zinc-100 rounded w-4/5" />
                        <div class="h-3 bg-zinc-100 rounded w-2/5" />
                    </div>
                </div>
            </div>

            <!-- Error -->
            <UAlert v-else-if="error" color="error" variant="soft" :description="error" class="mb-4" />

            <!-- Empty -->
            <div v-else-if="rewards.length === 0" class="text-center text-zinc-400 py-20">
                <UIcon name="i-heroicons-gift" class="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p class="text-sm">No rewards available</p>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <RewardCard v-for="reward in rewards" :key="reward.id" :reward="reward" />
            </div>

        </div>
    </div>
</template>
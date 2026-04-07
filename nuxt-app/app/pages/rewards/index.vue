<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { rewards, loading, error, fetchRewards } = useRewards()

onMounted(fetchRewards)
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="bg-white border-b border-zinc-100 px-4 pt-10 pb-4">
            <div class="max-w-lg mx-auto">
                <h1 class="text-2xl font-bold text-zinc-900">Rewards</h1>
                <p class="text-sm text-zinc-500 mt-0.5">Browse and redeem your points</p>
            </div>
        </div>

        <div class="max-w-lg mx-auto px-4 py-6">
            <!-- Loading -->
            <div v-if="loading" class="grid grid-cols-3 gap-3">
                <div v-for="i in 6" :key="i" class="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div class="w-full aspect-4/3 bg-zinc-100" />
                    <div class="p-3 space-y-2">
                        <div class="h-3 bg-zinc-100 rounded w-3/4 mx-auto" />
                        <div class="h-3 bg-zinc-100 rounded w-1/2 mx-auto" />
                    </div>
                </div>
            </div>

            <!-- Error -->
            <UAlert v-else-if="error" color="error" variant="soft" :description="error" />

            <!-- Empty -->
            <div v-else-if="rewards.length === 0" class="text-center text-zinc-400 py-16">
                <UIcon name="i-heroicons-gift" class="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No rewards available</p>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-3 gap-3">
                <NuxtLink
                    v-for="reward in rewards"
                    :key="reward.id"
                    :to="`/rewards/${reward.id}`"
                    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.97] transition-transform flex flex-col"
                >
                    <div class="w-full aspect-[4/3] bg-zinc-100 flex items-center justify-center overflow-hidden">
                        <img
                            v-if="reward.image_url"
                            :src="reward.image_url"
                            :alt="reward.title"
                            class="w-full h-full object-cover"
                        />
                        <UIcon v-else name="i-heroicons-gift" class="w-8 h-8 text-zinc-400" />
                    </div>
                    <div class="p-3 text-center flex flex-col flex-1">
                        <p class="font-semibold text-zinc-900 text-sm leading-tight line-clamp-2 flex-1">{{ reward.title }}</p>
                        <p class="text-xs font-bold text-zinc-900 mt-2">
                            {{ reward.points_required.toLocaleString() }}
                            <span class="font-normal text-zinc-400">pts</span>
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

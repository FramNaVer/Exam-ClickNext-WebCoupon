<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { rewards, loading, error, fetchRewards } = useRewards()

onMounted(fetchRewards)
</script>

<template>
    <div class="min-h-screen bg-gray-50">

        <!-- Rewards list -->
        <div class="max-w-xl mx-auto px-4 py-6">
            <h2 class="text-lg font-semibold text-zinc-900 mb-4">Available Rewards</h2>

            <!-- Loading -->
            <div v-if="loading" class="grid grid-cols-2 gap-4">
                <div v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div class="w-full aspect-[4/3] bg-zinc-100" />
                    <div class="p-4 space-y-2">
                        <div class="h-4 bg-zinc-100 rounded w-3/4 mx-auto" />
                        <div class="h-3 bg-zinc-100 rounded w-1/2 mx-auto" />
                    </div>
                </div>
            </div>

            <!-- Error -->
            <UAlert
                v-else-if="error"
                color="error"
                variant="soft"
                :description="error"
                class="mb-4"
            />

            <!-- Empty -->
            <div
                v-else-if="rewards.length === 0"
                class="text-center text-zinc-400 py-16"
            >
                <UIcon name="i-heroicons-gift" class="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No rewards available</p>
            </div>

            <!-- List -->
            <div v-else class="grid grid-cols-2 gap-4">
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
                        <UIcon v-else name="i-heroicons-gift" class="w-10 h-10 text-zinc-400" />
                    </div>
                    <div class="p-4 text-center flex flex-col flex-1">
                        <p class="font-semibold text-zinc-900 text-sm leading-tight line-clamp-2 flex-1">{{ reward.title }}</p>
                        <p class="text-sm font-bold text-zinc-900 mt-2">{{ reward.points_required.toLocaleString() }} <span class="font-normal text-zinc-400 text-xs">pts</span></p>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

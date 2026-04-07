<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { rewards, loading, error, fetchRewards } = useRewards()

onMounted(fetchRewards)
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white border-b border-zinc-100 px-4 pt-10 pb-6">
            <div class="max-w-lg mx-auto">
                <p class="text-sm text-zinc-500">Welcome back,</p>
                <h1 class="text-2xl font-bold text-zinc-900 mt-0.5">
                    {{ authStore.user?.username }}
                </h1>
                <!-- Points card -->
                <div class="mt-4 bg-zinc-900 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p class="text-zinc-400 text-sm">Your Points</p>
                        <p class="text-white text-3xl font-bold mt-1">
                            {{ authStore.user?.points?.toLocaleString() ?? '—' }}
                        </p>
                    </div>
                    <div class="bg-zinc-800 rounded-xl p-3">
                        <UIcon name="i-heroicons-star" class="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Rewards list -->
        <div class="max-w-lg mx-auto px-4 py-6">
            <h2 class="text-lg font-semibold text-zinc-900 mb-4">Available Rewards</h2>

            <!-- Loading -->
            <div v-if="loading" class="space-y-3">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="bg-white rounded-2xl h-24 animate-pulse"
                />
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
                        <p class="text-xs font-bold text-zinc-900 mt-2">{{ reward.points_required.toLocaleString() }} <span class="font-normal text-zinc-400">pts</span></p>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { history, loading, error, fetchHistory } = useProfile()

onMounted(fetchHistory)

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white border-b border-zinc-100 px-6 pt-10 pb-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-zinc-900">Profile</h1>
                    <p class="text-sm text-zinc-400 mt-0.5">{{ authStore.user?.username }}</p>
                </div>
                <button
                    class="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100"
                    @click="authStore.logout()"
                >
                    <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                    Logout
                </button>
            </div>

            <!-- Points summary -->
            <div class="mt-4 bg-zinc-900 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <p class="text-zinc-400 text-xs">Total Points</p>
                    <p class="text-white text-2xl font-bold mt-0.5">
                        {{ authStore.user?.points?.toLocaleString() ?? '—' }}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-zinc-400 text-xs">Redeemed</p>
                    <p class="text-white text-2xl font-bold mt-0.5">{{ history.length }}</p>
                </div>
            </div>
        </div>

        <!-- History -->
        <div class="px-4 py-6">
            <h2 class="text-base font-semibold text-zinc-900 mb-4">Redemption History</h2>

            <!-- Loading -->
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                    <div class="w-12 h-12 rounded-xl bg-zinc-100 shrink-0" />
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-zinc-100 rounded w-1/2" />
                        <div class="h-3 bg-zinc-100 rounded w-1/3" />
                    </div>
                    <div class="h-4 bg-zinc-100 rounded w-16" />
                </div>
            </div>

            <!-- Error -->
            <UAlert v-else-if="error" color="error" variant="soft" :description="error" />

            <!-- Empty -->
            <div v-else-if="history.length === 0" class="text-center text-zinc-400 py-16">
                <UIcon name="i-heroicons-receipt-refund" class="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p class="font-medium">No redemptions yet</p>
                <p class="text-sm mt-1">Start redeeming rewards to see your history</p>
            </div>

            <!-- List -->
            <div v-else class="space-y-3">
                <div
                    v-for="item in history"
                    :key="item.id"
                    class="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                >
                    <div class="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                            v-if="item.reward.image_url"
                            :src="item.reward.image_url"
                            :alt="item.reward.title"
                            class="w-full h-full object-cover"
                        />
                        <UIcon v-else name="i-heroicons-gift" class="w-6 h-6 text-zinc-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-zinc-900 text-sm truncate">{{ item.reward.title }}</p>
                        <p class="text-xs text-zinc-400 mt-0.5">{{ formatDate(item.redeemed_at) }}</p>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="text-sm font-bold text-zinc-900">-{{ item.redeemed_points.toLocaleString() }}</p>
                        <p class="text-xs text-zinc-400">pts</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

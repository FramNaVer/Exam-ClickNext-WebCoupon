<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const authStore = useAuthStore()
const { currentReward, loading, error, fetchReward } = useRewards()
const redeem = useRedeem()

onMounted(() => fetchReward(Number(route.params.id)))

const canAfford = computed(() =>
    currentReward.value !== null &&
    authStore.user !== null &&
    authStore.user.points >= currentReward.value.points_required
)

const isOutOfStock = computed(() => currentReward.value !== null && currentReward.value.stock <= 0)
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Back button -->
        <div class="bg-white border-b border-zinc-100 px-4 pt-10 pb-4">
            <div class="max-w-lg mx-auto flex items-center gap-3">
                <button class="p-2 rounded-xl hover:bg-zinc-100 transition-colors -ml-2" @click="$router.back()">
                    <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 text-zinc-700" />
                </button>
                <h1 class="text-lg font-semibold text-zinc-900">Reward Detail</h1>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="max-w-lg mx-auto px-4 py-6 space-y-4">
            <div class="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div class="w-full aspect-video bg-zinc-100" />
                <div class="p-5 space-y-3">
                    <div class="h-5 bg-zinc-100 rounded w-2/3" />
                    <div class="h-4 bg-zinc-100 rounded w-full" />
                    <div class="h-4 bg-zinc-100 rounded w-3/4" />
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="max-w-lg mx-auto px-4 py-6">
            <UAlert color="error" variant="soft" :description="error" />
        </div>

        <!-- Content -->
        <div v-else-if="currentReward" class="max-w-lg mx-auto px-4 py-6 space-y-4">
            <!-- Image -->
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div class="w-full aspect-video bg-zinc-100 flex items-center justify-center overflow-hidden">
                    <img
                        v-if="currentReward.image_url"
                        :src="currentReward.image_url"
                        :alt="currentReward.title"
                        class="w-full h-full object-cover"
                    />
                    <UIcon v-else name="i-heroicons-gift" class="w-16 h-16 text-zinc-300" />
                </div>

                <div class="p-5">
                    <div class="flex items-start justify-between gap-3">
                        <h2 class="text-xl font-bold text-zinc-900">{{ currentReward.title }}</h2>
                        <div class="text-right shrink-0">
                            <p class="text-2xl font-bold text-zinc-900">{{ currentReward.points_required.toLocaleString() }}</p>
                            <p class="text-xs text-zinc-400">pts required</p>
                        </div>
                    </div>
                    <p class="text-zinc-500 text-sm mt-2 leading-relaxed">{{ currentReward.description }}</p>
                </div>
            </div>

            <!-- Info card -->
            <div class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-zinc-500">Stock remaining</span>
                    <span class="font-semibold" :class="isOutOfStock ? 'text-red-500' : 'text-zinc-900'">
                        {{ isOutOfStock ? 'Out of stock' : `${currentReward.stock} left` }}
                    </span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-zinc-500">Your points</span>
                    <span class="font-semibold text-zinc-900">{{ authStore.user?.points?.toLocaleString() ?? '—' }}</span>
                </div>
                <div v-if="currentReward.expiry_date" class="flex justify-between text-sm">
                    <span class="text-zinc-500">Expires</span>
                    <span class="font-semibold text-zinc-900">{{ new Date(currentReward.expiry_date).toLocaleDateString() }}</span>
                </div>
            </div>

            <!-- Terms -->
            <div v-if="currentReward.terms_condition" class="bg-white rounded-2xl p-5 shadow-sm">
                <p class="text-sm font-semibold text-zinc-900 mb-2">Terms & Conditions</p>
                <p class="text-sm text-zinc-500 leading-relaxed">{{ currentReward.terms_condition }}</p>
            </div>

            <!-- Feedback -->
            <UAlert v-if="redeem.success.value" color="success" variant="soft" :description="redeem.success.value" />
            <UAlert v-if="redeem.error.value" color="error" variant="soft" :description="redeem.error.value" />

            <!-- Redeem button -->
            <div v-if="!redeem.success.value">
                <UButton
                    v-if="!redeem.showConfirm.value"
                    block
                    size="lg"
                    :disabled="!canAfford || isOutOfStock"
                    @click="redeem.openConfirm()"
                >
                    {{ isOutOfStock ? 'Out of Stock' : !canAfford ? 'Not Enough Points' : 'Redeem Reward' }}
                </UButton>

                <!-- Confirm -->
                <div v-else class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                    <p class="text-sm font-semibold text-zinc-900 text-center">
                        Confirm redeem "{{ currentReward.title }}" for {{ currentReward.points_required.toLocaleString() }} pts?
                    </p>
                    <div class="flex gap-3">
                        <UButton block variant="outline" @click="redeem.cancelConfirm()">Cancel</UButton>
                        <UButton block :loading="redeem.loading.value" @click="redeem.confirm(currentReward.id)">Confirm</UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

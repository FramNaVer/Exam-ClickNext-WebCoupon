<script setup>
    const authStore = useAuthStore();
    const { rewards, loading, error, fetchRewards } = useRewards();
onMounted(fetchRewards)
</script>

<template>
    <div class="bg-white border-b border-zinc-100 px-6 pt-5 pb-3 sticky top-0 z-10 ">
        <div class="flex items-center justify-between">
            <!-- Left: App name -->
            <div class="flex items-center gap-2 px-2">
                <div class="bg-zinc-900 rounded-xl p-1.5">
                    <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-yellow-400" />
                </div>
                <span class="text-lg font-bold text-zinc-900 tracking-tight">SnapReward</span>
            </div>
            <!-- Right: Username + Points -->
            <div class="flex items-center gap-3 px-2">
                <div class="text-right">
                    <p class="text-xs text-zinc-400 leading-none">Welcome back,</p>
                    <p class="text-sm font-semibold text-zinc-900 leading-tight">{{ authStore.user?.username }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
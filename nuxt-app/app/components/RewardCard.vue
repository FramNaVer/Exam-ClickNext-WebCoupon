<script setup lang="ts">
defineProps<{
    reward: {
        id: number | string
        title: string
        points_required: number
        image_url?: string | null
    }
}>()
</script>

<template>
    <NuxtLink :to="`/rewards/${reward.id}`"
        class="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all active:scale-[0.98] flex flex-col">
        <!-- Image -->
        <div class="w-full aspect-square bg-zinc-50 overflow-hidden flex items-center justify-center">
            <img v-if="reward.image_url" :src="reward.image_url" :alt="reward.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="flex flex-col items-center gap-2">
                <UIcon name="i-heroicons-gift" class="w-10 h-10 text-zinc-300" />
            </div>
        </div>

        <!-- Info -->
        <div class="p-3 flex flex-col gap-1">
            <p class="text-sm font-medium text-zinc-800 leading-snug line-clamp-2">
                {{ reward.title }}
            </p>
            <div class="flex items-center gap-1 mt-0.5">
                <UIcon name="i-heroicons-star-solid" class="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span class="text-sm font-bold text-zinc-900">
                    {{ reward.points_required.toLocaleString() }}
                </span>
                <span class="text-xs text-zinc-400">pts</span>
            </div>
        </div>
    </NuxtLink>
</template>
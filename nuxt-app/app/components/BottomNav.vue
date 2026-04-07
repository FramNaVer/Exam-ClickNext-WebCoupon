<script setup lang="ts">
const route = useRoute()

const tabs = [
    { name: 'Home', path: '/', icon: 'i-heroicons-home' },
    { name: 'Rewards', path: '/rewards', icon: 'i-heroicons-gift' },
    { name: 'Profile', path: '/profile', icon: 'i-heroicons-user-circle' },
]

function isActive(path: string) {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}
</script>

<template>
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800">
        <div class="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
            <NuxtLink
                v-for="tab in tabs"
                :key="tab.path"
                :to="tab.path"
                class="flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors"
                :class="isActive(tab.path)
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'"
            >
                <UIcon :name="tab.icon" class="w-6 h-6" />
                <span class="text-xs font-medium">{{ tab.name }}</span>
                <span
                    class="h-0.5 w-4 rounded-full transition-all"
                    :class="isActive(tab.path) ? 'bg-white' : 'bg-transparent'"
                />
            </NuxtLink>
        </div>
    </nav>
</template>

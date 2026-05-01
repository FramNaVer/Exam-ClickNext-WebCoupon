<!-- components/AdminSidebar.vue -->
<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const { users, fetchUsers } = useAdminUsers()

const totalUsers = computed(() => users.value.length)

onMounted(fetchUsers)

const navSections = computed(() => [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', icon: 'i-heroicons-squares-2x2', to: '/admin' },
            { label: 'Users', icon: 'i-heroicons-users', to: '/admin/users', badge: totalUsers.value, badgeColor: 'info' },
        ]
    },
    {
        label: 'Rewards',
        items: [
            { label: 'Rewards', icon: 'i-heroicons-gift', to: '/admin/rewards' },
            { label: 'Redemptions', icon: 'i-heroicons-document-text', to: '/admin/redemptions', badge: '7', badgeColor: 'warning' },
            { label: 'Analytics', icon: 'i-heroicons-chart-bar', to: '/admin/analytics' },
            { label: 'Campaigns', icon: 'i-heroicons-megaphone', to: '/admin/campaigns' },
        ]
    },
    {
        label: 'System',
        items: [
            { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/admin/settings' },
            { label: 'Logs', icon: 'i-heroicons-list-bullet', to: '/admin/adminlogs' },
        ]
    },
])

async function handleLogout() {
    await authStore.logout()
    navigateTo('/login')
}
</script>

<template>
    <aside class="w-56 h-screen bg-white border-r border-zinc-100 flex flex-col ">

        <!-- Logo -->
        <div class="px-4 py-4 border-b border-zinc-100">
            <div class="flex items-center gap-2">
                <div class="bg-zinc-900 rounded-xl p-1.5">
                    <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-yellow-400" />
                </div>
                <span class="text-sm font-bold text-zinc-900 tracking-tight">SnapReward</span>
            </div>
            <div class="mt-2 inline-flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-lg">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span class="text-[11px] text-zinc-500">Admin Panel</span>
            </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
            <template v-for="section in navSections" :key="section.label">
                <p class="text-[10px] font-medium text-zinc-400 uppercase tracking-widest px-2 pt-3 pb-1.5 first:pt-1">
                    {{ section.label }}
                </p>
                <NuxtLink v-for="item in section.items" :key="item.to" :to="item.to"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    :class="{ 'bg-zinc-100 text-zinc-900 font-medium': route.path === item.to }">
                    <UIcon :name="item.icon" class="w-4 h-4 " />
                    <span class="text-sm">{{ item.label }}</span>
                    <span v-if="item.badge != null" class="ml-auto text-[10px] px-2 py-0.5 rounded-full" :class="{
                        'bg-blue-50 text-blue-600': item.badgeColor === 'info',
                        'bg-yellow-50 text-yellow-700': item.badgeColor === 'warning',
                    }">{{ item.badge }}</span>
                </NuxtLink>
            </template>
        </nav>

        <!-- User Footer -->
        <div class="p-3 border-t border-zinc-100">
            <div class="flex items-center gap-2.5 px-2.5 py-2 bg-zinc-50 rounded-lg">
                <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center">
                    <span class="text-[11px] font-medium text-white uppercase">
                        {{ authStore.user?.username?.charAt(0) }}
                    </span>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium text-zinc-900 truncate">{{ authStore.user?.username }}</p>
                    <p class="text-[10px] text-zinc-400">Super Admin</p>
                </div>
                <button @click="handleLogout" class="text-zinc-400 hover:text-zinc-700 transition-colors">
                    <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </aside>
</template>
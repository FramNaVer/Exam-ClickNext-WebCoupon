<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'admin' })

const { users, loading: loadingUsers, fetchUsers } = useAdminUsers()
const { rewards, loading: loadingRewards, fetchRewards } = useAdminRewards()

const error = ref('')
const loading = computed(() => loadingUsers.value || loadingRewards.value)

onMounted(async () => {
    try {
        await Promise.all([fetchUsers(), fetchRewards()])
    } catch (e: any) {
        error.value = e?.data?.message || 'Failed to load data'
    }
})

const totalUsers = computed(() => users.value.length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const totalRewards = computed(() => rewards.value.length)
const lowStockItems = computed(() => rewards.value.filter(r => r.stock > 0 && r.stock <= 10))
const outOfStockItems = computed(() => rewards.value.filter(r => r.stock === 0))
const alertItems = computed(() => [...outOfStockItems.value, ...lowStockItems.value])
</script>

<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p class="text-sm text-zinc-400 mt-0.5">ภาพรวม SnapReward</p>
        </div>

        <UAlert v-if="error" color="error" variant="soft" :description="error" />

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-zinc-100 p-5 h-24 animate-pulse" />
        </div>

        <template v-else>
            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl border border-zinc-100 p-5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <UIcon name="i-heroicons-users" class="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-zinc-900">{{ totalUsers }}</p>
                            <p class="text-xs text-zinc-400">Total Users</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-zinc-100 p-5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-zinc-900">{{ adminCount }}</p>
                            <p class="text-xs text-zinc-400">Admins</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-zinc-100 p-5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <UIcon name="i-heroicons-gift" class="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-zinc-900">{{ totalRewards }}</p>
                            <p class="text-xs text-zinc-400">Rewards</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-zinc-100 p-5">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            :class="outOfStockItems.length > 0 ? 'bg-red-50' : 'bg-yellow-50'"
                        >
                            <UIcon
                                name="i-heroicons-exclamation-triangle"
                                class="w-5 h-5"
                                :class="outOfStockItems.length > 0 ? 'text-red-500' : 'text-yellow-500'"
                            />
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-zinc-900">{{ alertItems.length }}</p>
                            <p class="text-xs text-zinc-400">Stock Alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stock alerts -->
            <div v-if="alertItems.length > 0" class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div class="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h2 class="text-sm font-semibold text-zinc-900">Stock Alerts</h2>
                    <NuxtLink to="/admin/rewards" class="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                        Manage →
                    </NuxtLink>
                </div>
                <div class="divide-y divide-zinc-50">
                    <div v-for="r in alertItems" :key="r.id" class="flex items-center gap-3 px-5 py-3">
                        <div class="w-9 h-9 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                            <img v-if="r.image_url" :src="r.image_url" :alt="r.title" class="w-full h-full object-cover" />
                            <UIcon v-else name="i-heroicons-gift" class="w-4 h-4 text-zinc-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-zinc-900 truncate">{{ r.title }}</p>
                            <p class="text-xs text-zinc-400">{{ r.points_required.toLocaleString() }} pts</p>
                        </div>
                        <span
                            class="text-xs px-2.5 py-1 rounded-full font-medium"
                            :class="r.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'"
                        >
                            {{ r.stock === 0 ? 'Out of stock' : `${r.stock} left` }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick navigation -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NuxtLink
                    to="/admin/users"
                    class="bg-white rounded-2xl p-5 border border-zinc-100 hover:border-zinc-300 transition-colors flex items-center justify-between group"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <UIcon name="i-heroicons-users" class="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p class="font-semibold text-zinc-900 text-sm">จัดการ Users</p>
                            <p class="text-xs text-zinc-400 mt-0.5">แก้ไข role และ points</p>
                        </div>
                    </div>
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                </NuxtLink>

                <NuxtLink
                    to="/admin/rewards"
                    class="bg-white rounded-2xl p-5 border border-zinc-100 hover:border-zinc-300 transition-colors flex items-center justify-between group"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <UIcon name="i-heroicons-gift" class="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p class="font-semibold text-zinc-900 text-sm">จัดการ Rewards</p>
                            <p class="text-xs text-zinc-400 mt-0.5">เพิ่ม แก้ไข ลบ rewards</p>
                        </div>
                    </div>
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                </NuxtLink>
            </div>
        </template>
    </div>
</template>

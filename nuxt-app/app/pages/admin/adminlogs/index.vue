<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'admin' })

const { logs, loading, error, total, totalPages, currentPage, filters, fetchLogs, resetFilters } = useAdminLogs()

onMounted(() => fetchLogs(1))

async function applyFilters() {
    await fetchLogs(1)
}

async function clearFilters() {
    resetFilters()
    await fetchLogs(1)
}

const ACTION_OPTIONS = [
    { label: 'All Actions', value: '' },
    { label: 'User Login', value: 'USER_LOGIN' },
    { label: 'User Logout', value: 'USER_LOGOUT' },
    { label: 'User Register', value: 'USER_REGISTER' },
    { label: 'Role Updated', value: 'USER_ROLE_UPDATE' },
    { label: 'Points Updated', value: 'USER_POINTS_UPDATE' },
    { label: 'Reward Created', value: 'REWARD_CREATED' },
    { label: 'Reward Updated', value: 'REWARD_UPDATED' },
    { label: 'Reward Deleted', value: 'REWARD_DELETED' },
]

const hasActiveFilters = computed(() =>
    !!(filters.level || filters.action || filters.startDate || filters.endDate)
)

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

const LEVEL_STYLE: Record<string, string> = {
    info:  'bg-blue-50 text-blue-600',
    warn:  'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-600',
}

const ACTION_STYLE: Record<string, string> = {
    USER_LOGIN:          'bg-green-50 text-green-700',
    USER_LOGOUT:         'bg-zinc-100 text-zinc-600',
    USER_REGISTER:       'bg-purple-50 text-purple-700',
    USER_ROLE_UPDATE:    'bg-orange-50 text-orange-700',
    USER_POINTS_UPDATE:  'bg-blue-50 text-blue-700',
    REWARD_CREATED:      'bg-teal-50 text-teal-700',
    REWARD_UPDATED:      'bg-indigo-50 text-indigo-700',
    REWARD_DELETED:      'bg-red-50 text-red-600',
}
</script>

<template>
    <div class="p-6 space-y-5">

        <!-- Header -->
        <div>
            <h1 class="text-xl font-bold text-zinc-900">Activity Logs</h1>
            <p class="text-sm text-zinc-400 mt-0.5">
                ประวัติการดำเนินการทั้งหมด
                <span v-if="total > 0" class="ml-1">— {{ total.toLocaleString() }} รายการ</span>
            </p>
        </div>

        <!-- Filter bar -->
        <div class="bg-white rounded-2xl border border-zinc-100 p-4 space-y-3">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Level -->
                <div class="space-y-1">
                    <label class="text-xs font-medium text-zinc-500">Level</label>
                    <select
                        v-model="filters.level"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                        <option value="">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                <!-- Action -->
                <div class="space-y-1">
                    <label class="text-xs font-medium text-zinc-500">Action</label>
                    <select
                        v-model="filters.action"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                        <option v-for="opt in ACTION_OPTIONS" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </div>

                <!-- Start date -->
                <div class="space-y-1">
                    <label class="text-xs font-medium text-zinc-500">ตั้งแต่วันที่</label>
                    <input
                        v-model="filters.startDate"
                        type="date"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>

                <!-- End date -->
                <div class="space-y-1">
                    <label class="text-xs font-medium text-zinc-500">ถึงวันที่</label>
                    <input
                        v-model="filters.endDate"
                        type="date"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
            </div>

            <!-- Filter actions -->
            <div class="flex items-center gap-2 pt-1">
                <button
                    @click="applyFilters"
                    class="text-sm px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                >
                    Apply Filters
                </button>
                <button
                    v-if="hasActiveFilters"
                    @click="clearFilters"
                    class="text-sm px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
                >
                    <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                    Clear
                </button>
            </div>
        </div>

        <UAlert v-if="error" color="error" variant="soft" :description="error" />

        <!-- Skeleton -->
        <div v-if="loading" class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div
                v-for="i in 8" :key="i"
                class="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-50 last:border-0 animate-pulse"
            >
                <div class="h-5 w-12 bg-zinc-100 rounded-full shrink-0" />
                <div class="h-5 w-28 bg-zinc-100 rounded-full shrink-0" />
                <div class="flex-1 h-4 bg-zinc-100 rounded" />
                <div class="h-4 w-20 bg-zinc-100 rounded shrink-0" />
            </div>
        </div>

        <!-- Log table -->
        <div v-else class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <!-- Empty -->
            <div v-if="logs.length === 0" class="text-center py-16 text-zinc-400">
                <UIcon name="i-heroicons-list-bullet" class="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p class="text-sm">ไม่พบ logs ที่ตรงกับเงื่อนไข</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-zinc-100 bg-zinc-50">
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Level</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Action</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Message</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actor</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">IP</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">เวลา</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50">
                        <tr v-for="log in logs" :key="log.id" class="hover:bg-zinc-50/50 transition-colors">
                            <!-- Level -->
                            <td class="px-5 py-3">
                                <span
                                    class="text-[11px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide"
                                    :class="LEVEL_STYLE[log.level] ?? 'bg-zinc-100 text-zinc-600'"
                                >
                                    {{ log.level }}
                                </span>
                            </td>

                            <!-- Action -->
                            <td class="px-5 py-3 whitespace-nowrap">
                                <span
                                    class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                    :class="ACTION_STYLE[log.action] ?? 'bg-zinc-100 text-zinc-600'"
                                >
                                    {{ log.action }}
                                </span>
                            </td>

                            <!-- Message -->
                            <td class="px-5 py-3 text-zinc-700 max-w-xs truncate">
                                {{ log.message }}
                            </td>

                            <!-- Actor -->
                            <td class="px-5 py-3 whitespace-nowrap">
                                <span v-if="log.actor_name" class="text-zinc-900 font-medium text-xs">
                                    {{ log.actor_name }}
                                </span>
                                <span v-else class="text-zinc-400 text-xs italic">system</span>
                            </td>

                            <!-- IP -->
                            <td class="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap font-mono">
                                {{ log.ip_address ?? '—' }}
                            </td>

                            <!-- Time -->
                            <td class="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">
                                {{ formatDate(log.created_at) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                <p class="text-xs text-zinc-400">
                    หน้า {{ currentPage }} / {{ totalPages }}
                    ({{ total.toLocaleString() }} รายการ)
                </p>
                <div class="flex items-center gap-1">
                    <button
                        :disabled="currentPage <= 1"
                        @click="fetchLogs(currentPage - 1)"
                        class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
                    </button>

                    <template v-for="p in totalPages" :key="p">
                        <button
                            v-if="p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1"
                            @click="fetchLogs(p)"
                            class="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                            :class="p === currentPage ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'"
                        >
                            {{ p }}
                        </button>
                        <span
                            v-else-if="p === 2 && currentPage > 3"
                            class="text-zinc-300 text-xs px-1"
                        >...</span>
                        <span
                            v-else-if="p === totalPages - 1 && currentPage < totalPages - 2"
                            class="text-zinc-300 text-xs px-1"
                        >...</span>
                    </template>

                    <button
                        :disabled="currentPage >= totalPages"
                        @click="fetchLogs(currentPage + 1)"
                        class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

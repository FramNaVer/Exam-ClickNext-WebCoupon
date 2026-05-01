<script setup lang="ts">
import type { AdminUser } from '~/composables/useAdminUsers'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const { users, loading, error, fetchUsers, updateRole, updatePoints } = useAdminUsers()

const savingId = ref<number | null>(null)
const successId = ref<number | null>(null)
const saveError = ref('')

// UI edit state — separate from source-of-truth in composable
const editedRole = ref<Record<number, string>>({})
const editedPoints = ref<Record<number, string>>({})

onMounted(async () => {
    await fetchUsers()
    initEditState()
})

function initEditState() {
    for (const u of users.value) {
        editedRole.value[u.id] = u.role
        editedPoints.value[u.id] = String(u.points)
    }
}

function isDirty(user: AdminUser) {
    return (
        editedRole.value[user.id] !== user.role ||
        editedPoints.value[user.id] !== String(user.points)
    )
}

function resetUser(user: AdminUser) {
    editedRole.value[user.id] = user.role
    editedPoints.value[user.id] = String(user.points)
}

async function saveUser(user: AdminUser) {
    savingId.value = user.id
    saveError.value = ''
    try {
        const roleChanged = editedRole.value[user.id] !== user.role
        const pointsChanged = editedPoints.value[user.id] !== String(user.points)

        if (roleChanged) {
            await updateRole(user.id, editedRole.value[user.id] ?? user.role)
        }
        if (pointsChanged) {
            const parsed = parseInt(editedPoints.value[user.id] ?? '')
            if (isNaN(parsed) || parsed < 0) {
                saveError.value = 'Points must be a valid non-negative number'
                return
            }
            await updatePoints(user.id, parsed)
        }

        successId.value = user.id
        setTimeout(() => { successId.value = null }, 2000)
    } catch (e: any) {
        saveError.value = e?.data?.message || 'Failed to update user'
    } finally {
        savingId.value = null
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}
</script>

<template>
    <div class="p-6 space-y-5">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-zinc-900">Users</h1>
                <p class="text-sm text-zinc-400 mt-0.5">จัดการ role และ points ของผู้ใช้</p>
            </div>
            <span class="text-sm text-zinc-400">{{ users.length }} users</span>
        </div>

        <UAlert v-if="error || saveError" color="error" variant="soft" :description="error || saveError" />

        <!-- Skeleton -->
        <div v-if="loading" class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div
                v-for="i in 6" :key="i"
                class="flex items-center gap-4 px-5 py-4 border-b border-zinc-50 last:border-0 animate-pulse"
            >
                <div class="w-8 h-8 rounded-full bg-zinc-100 shrink-0" />
                <div class="flex-1 space-y-2">
                    <div class="h-3.5 bg-zinc-100 rounded w-1/4" />
                    <div class="h-3 bg-zinc-100 rounded w-1/6" />
                </div>
                <div class="h-8 bg-zinc-100 rounded-lg w-20" />
                <div class="h-8 bg-zinc-100 rounded-lg w-20" />
                <div class="h-3 bg-zinc-100 rounded w-16" />
            </div>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <!-- Empty -->
            <div v-if="users.length === 0" class="text-center py-16 text-zinc-400">
                <UIcon name="i-heroicons-users" class="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p class="text-sm">No users found</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-zinc-100 bg-zinc-50">
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Provider</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Points</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
                            <th class="px-5 py-3 w-32"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50">
                        <tr v-for="user in users" :key="user.id" class="hover:bg-zinc-50/50 transition-colors">
                            <!-- Avatar + name -->
                            <td class="px-5 py-3.5">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                                        <span class="text-[11px] font-medium text-white uppercase">
                                            {{ user.username?.charAt(0) }}
                                        </span>
                                    </div>
                                    <div>
                                        <p class="font-medium text-zinc-900">{{ user.username }}</p>
                                        <p class="text-xs text-zinc-400">#{{ user.id }}</p>
                                    </div>
                                </div>
                            </td>

                            <!-- Provider -->
                            <td class="px-5 py-3.5">
                                <span class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 capitalize">
                                    {{ user.provider || 'local' }}
                                </span>
                            </td>

                            <!-- Role -->
                            <td class="px-5 py-3.5">
                                <select
                                    v-model="editedRole[user.id]"
                                    class="text-xs rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                                >
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>

                            <!-- Points -->
                            <td class="px-5 py-3.5">
                                <input
                                    v-model="editedPoints[user.id]"
                                    type="number"
                                    min="0"
                                    class="w-24 text-xs rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </td>

                            <!-- Joined -->
                            <td class="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                                {{ formatDate(user.created_at) }}
                            </td>

                            <!-- Actions -->
                            <td class="px-5 py-3.5">
                                <div class="flex items-center gap-1.5">
                                    <template v-if="isDirty(user)">
                                        <button
                                            :disabled="savingId === user.id"
                                            @click="saveUser(user)"
                                            class="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            {{ savingId === user.id ? 'Saving...' : 'Save' }}
                                        </button>
                                        <button
                                            @click="resetUser(user)"
                                            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                                        >
                                            <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                                        </button>
                                    </template>
                                    <span
                                        v-else-if="successId === user.id"
                                        class="text-xs text-green-600 flex items-center gap-1 whitespace-nowrap"
                                    >
                                        <UIcon name="i-heroicons-check" class="w-3.5 h-3.5" /> Saved
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

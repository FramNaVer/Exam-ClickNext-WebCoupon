<script setup lang="ts">
import type { AdminReward } from '~/composables/useAdminRewards'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const { rewards, loading, error, fetchRewards, createReward, updateReward, deleteReward } = useAdminRewards()

// Modal visibility
const showCreate = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)

// Targets
const editTarget = ref<AdminReward | null>(null)
const deleteTarget = ref<AdminReward | null>(null)

// Form state
const form = reactive({
    title: '',
    description: '',
    points_required: '',
    stock: '',
    expiry_date: '',
    redeem_start_date: '',
    redeem_end_date: '',
    terms_condition: '',
    image: null as File | null,
})
const imagePreview = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')

onMounted(fetchRewards)

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFormData() {
    const fd = new FormData()
    fd.append('title', form.title)
    if (form.description) fd.append('description', form.description)
    fd.append('points_required', form.points_required)
    fd.append('stock', form.stock || '0')
    if (form.expiry_date) fd.append('expiry_date', form.expiry_date)
    if (form.redeem_start_date) fd.append('redeem_start_date', form.redeem_start_date)
    if (form.redeem_end_date) fd.append('redeem_end_date', form.redeem_end_date)
    if (form.terms_condition) fd.append('terms_condition', form.terms_condition)
    if (form.image) fd.append('image', form.image)
    return fd
}

function resetForm() {
    Object.assign(form, {
        title: '', description: '', points_required: '', stock: '',
        expiry_date: '', redeem_start_date: '', redeem_end_date: '',
        terms_condition: '', image: null,
    })
    imagePreview.value = null
    formError.value = ''
}

function onImageChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    form.image = file
    imagePreview.value = URL.createObjectURL(file)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

// ── Create ────────────────────────────────────────────────────────────────────

function openCreate() {
    resetForm()
    showCreate.value = true
}

async function submitCreate() {
    if (!form.title || !form.points_required) {
        formError.value = 'Title และ Points Required จำเป็นต้องกรอก'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        await createReward(buildFormData())
        showCreate.value = false
    } catch (e: any) {
        formError.value = e?.data?.message || 'Failed to create reward'
    } finally {
        saving.value = false
    }
}

// ── Edit ──────────────────────────────────────────────────────────────────────

function openEdit(reward: AdminReward) {
    editTarget.value = reward
    Object.assign(form, {
        title: reward.title,
        description: reward.description || '',
        points_required: String(reward.points_required),
        stock: String(reward.stock),
        expiry_date: reward.expiry_date ? reward.expiry_date.slice(0, 10) : '',
        redeem_start_date: reward.redeem_start_date ? reward.redeem_start_date.slice(0, 10) : '',
        redeem_end_date: reward.redeem_end_date ? reward.redeem_end_date.slice(0, 10) : '',
        terms_condition: reward.terms_condition || '',
        image: null,
    })
    imagePreview.value = reward.image_url
    formError.value = ''
    showEdit.value = true
}

async function submitEdit() {
    if (!form.title || !form.points_required) {
        formError.value = 'Title และ Points Required จำเป็นต้องกรอก'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        await updateReward(editTarget.value!.id, buildFormData())
        showEdit.value = false
    } catch (e: any) {
        formError.value = e?.data?.message || 'Failed to update reward'
    } finally {
        saving.value = false
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

function openDelete(reward: AdminReward) {
    deleteTarget.value = reward
    showDeleteConfirm.value = true
}

async function submitDelete() {
    if (!deleteTarget.value) return
    saving.value = true
    try {
        await deleteReward(deleteTarget.value.id)
        showDeleteConfirm.value = false
        deleteTarget.value = null
    } catch (e: any) {
        error.value = e?.data?.message || 'Failed to delete reward'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="p-6 space-y-5">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-zinc-900">Rewards</h1>
                <p class="text-sm text-zinc-400 mt-0.5">จัดการ rewards ทั้งหมด</p>
            </div>
            <button
                @click="openCreate"
                class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
                <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                Add Reward
            </button>
        </div>

        <UAlert v-if="error" color="error" variant="soft" :description="error" />

        <!-- Skeleton -->
        <div v-if="loading" class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div
                v-for="i in 5" :key="i"
                class="flex items-center gap-4 px-5 py-4 border-b border-zinc-50 last:border-0 animate-pulse"
            >
                <div class="w-11 h-11 rounded-xl bg-zinc-100 shrink-0" />
                <div class="flex-1 space-y-2">
                    <div class="h-3.5 bg-zinc-100 rounded w-1/3" />
                    <div class="h-3 bg-zinc-100 rounded w-1/5" />
                </div>
                <div class="h-6 bg-zinc-100 rounded-full w-16" />
                <div class="h-8 bg-zinc-100 rounded-lg w-20" />
            </div>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <!-- Empty -->
            <div v-if="rewards.length === 0" class="text-center py-16 text-zinc-400">
                <UIcon name="i-heroicons-gift" class="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p class="text-sm">No rewards yet</p>
                <p class="text-xs mt-1">Click "Add Reward" to create one</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-zinc-100 bg-zinc-50">
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Reward</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Points</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock</th>
                            <th class="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Expiry</th>
                            <th class="px-5 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50">
                        <tr v-for="reward in rewards" :key="reward.id" class="hover:bg-zinc-50/50 transition-colors">
                            <!-- Image + title -->
                            <td class="px-5 py-3.5">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        <img
                                            v-if="reward.image_url"
                                            :src="reward.image_url"
                                            :alt="reward.title"
                                            class="w-full h-full object-cover"
                                        />
                                        <UIcon v-else name="i-heroicons-gift" class="w-5 h-5 text-zinc-300" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-medium text-zinc-900 truncate max-w-50">{{ reward.title }}</p>
                                        <p class="text-xs text-zinc-400">#{{ reward.id }}</p>
                                    </div>
                                </div>
                            </td>

                            <!-- Points -->
                            <td class="px-5 py-3.5 whitespace-nowrap">
                                <span class="font-semibold text-zinc-900">{{ reward.points_required.toLocaleString() }}</span>
                                <span class="text-xs text-zinc-400 ml-1">pts</span>
                            </td>

                            <!-- Stock -->
                            <td class="px-5 py-3.5">
                                <span
                                    class="text-xs px-2.5 py-1 rounded-full font-medium"
                                    :class="{
                                        'bg-red-50 text-red-600': reward.stock === 0,
                                        'bg-yellow-50 text-yellow-700': reward.stock > 0 && reward.stock <= 10,
                                        'bg-green-50 text-green-700': reward.stock > 10,
                                    }"
                                >
                                    {{ reward.stock === 0 ? 'Out of stock' : reward.stock }}
                                </span>
                            </td>

                            <!-- Expiry -->
                            <td class="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                                {{ formatDate(reward.expiry_date) }}
                            </td>

                            <!-- Actions -->
                            <td class="px-5 py-3.5">
                                <div class="flex items-center gap-1 justify-end">
                                    <button
                                        @click="openEdit(reward)"
                                        class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                                    >
                                        <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="openDelete(reward)"
                                        class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- ── Create Modal ──────────────────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCreate = false" />
                <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <h2 class="font-semibold text-zinc-900">Add Reward</h2>
                        <button @click="showCreate = false" class="text-zinc-400 hover:text-zinc-700 transition-colors">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="px-6 py-5">
                        <AdminRewardForm
                            :form="form"
                            :image-preview="imagePreview"
                            :saving="saving"
                            :error="formError"
                            @image-change="onImageChange"
                            @submit="submitCreate"
                            @cancel="showCreate = false"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- ── Edit Modal ────────────────────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="showEdit" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showEdit = false" />
                <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <h2 class="font-semibold text-zinc-900">Edit Reward</h2>
                        <button @click="showEdit = false" class="text-zinc-400 hover:text-zinc-700 transition-colors">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="px-6 py-5">
                        <AdminRewardForm
                            :form="form"
                            :image-preview="imagePreview"
                            :saving="saving"
                            :error="formError"
                            @image-change="onImageChange"
                            @submit="submitEdit"
                            @cancel="showEdit = false"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- ── Delete Confirm ────────────────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false" />
                <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                            <UIcon name="i-heroicons-trash" class="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 class="font-semibold text-zinc-900">ลบ Reward</h2>
                            <p class="text-sm text-zinc-500 mt-1">
                                ต้องการลบ
                                <strong class="text-zinc-900">{{ deleteTarget?.title }}</strong>
                                ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-3 justify-end pt-2">
                        <button
                            @click="showDeleteConfirm = false"
                            class="text-sm px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            :disabled="saving"
                            @click="submitDelete"
                            class="text-sm px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                            {{ saving ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

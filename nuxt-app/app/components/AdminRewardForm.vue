<script setup lang="ts">
defineProps<{
    form: {
        title: string
        description: string
        points_required: string
        stock: string
        expiry_date: string
        redeem_start_date: string
        redeem_end_date: string
        terms_condition: string
        image: File | null
    }
    imagePreview: string | null
    saving: boolean
    error: string
}>()

defineEmits<{
    imageChange: [event: Event]
    submit: []
    cancel: []
}>()
</script>

<template>
    <form class="space-y-4" @submit.prevent="$emit('submit')">
        <!-- Error -->
        <UAlert v-if="error" color="error" variant="soft" :description="error" />

        <!-- Image upload -->
        <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">รูปภาพ</label>
            <div class="flex items-start gap-4">
                <div class="w-20 h-20 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-200">
                    <img v-if="imagePreview" :src="imagePreview" alt="preview" class="w-full h-full object-cover" />
                    <UIcon v-else name="i-heroicons-photo" class="w-6 h-6 text-zinc-300" />
                </div>
                <div class="flex-1">
                    <label
                        class="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors w-fit"
                    >
                        <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
                        {{ imagePreview ? 'เปลี่ยนรูป' : 'อัปโหลดรูป' }}
                        <input type="file" accept="image/*" class="hidden" @change="$emit('imageChange', $event)" />
                    </label>
                    <p class="text-[11px] text-zinc-400 mt-1.5">PNG, JPG ขนาดไม่เกิน 5 MB</p>
                </div>
            </div>
        </div>

        <!-- Title -->
        <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">
                ชื่อ Reward <span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.title"
                type="text"
                placeholder="เช่น Starbucks Gift Card"
                class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
        </div>

        <!-- Description -->
        <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">คำอธิบาย</label>
            <textarea
                v-model="form.description"
                rows="2"
                placeholder="รายละเอียดของ reward"
                class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
        </div>

        <!-- Points + Stock -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-xs font-medium text-zinc-700 mb-1.5">
                    Points Required <span class="text-red-500">*</span>
                </label>
                <input
                    v-model="form.points_required"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
            </div>
            <div>
                <label class="block text-xs font-medium text-zinc-700 mb-1.5">Stock</label>
                <input
                    v-model="form.stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
            </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 gap-3">
            <div>
                <label class="block text-xs font-medium text-zinc-700 mb-1.5">วันหมดอายุ</label>
                <input
                    v-model="form.expiry_date"
                    type="date"
                    class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-zinc-700 mb-1.5">เริ่มแลก</label>
                    <input
                        v-model="form.redeem_start_date"
                        type="date"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
                <div>
                    <label class="block text-xs font-medium text-zinc-700 mb-1.5">สิ้นสุดการแลก</label>
                    <input
                        v-model="form.redeem_end_date"
                        type="date"
                        class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
            </div>
        </div>

        <!-- Terms -->
        <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">Terms & Conditions</label>
            <textarea
                v-model="form.terms_condition"
                rows="3"
                placeholder="เงื่อนไขการใช้งาน..."
                class="w-full text-sm rounded-xl border border-zinc-200 px-3 py-2 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
            <button
                type="button"
                @click="$emit('cancel')"
                class="flex-1 text-sm py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                :disabled="saving"
                class="flex-1 text-sm py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
                {{ saving ? 'Saving...' : 'Save' }}
            </button>
        </div>
    </form>
</template>

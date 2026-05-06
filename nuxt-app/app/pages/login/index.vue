<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const fieldErrors = reactive({ username: '', password: '' })

const slides = [
    { src: '/WebCoupon01.jpg', alt: 'Reward 1' },
    { src: '/WebCoupon02.jpg', alt: 'Reward 2' },
    { src: '/WebCoupon03.jpg', alt: 'Reward 3' },
    { src: '/WebCoupon04.jpg', alt: 'Reward 4' },
]
const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
    timer = setInterval(() => {
        currentSlide.value = (currentSlide.value + 1) % slides.length
    }, 3500)
})
onUnmounted(() => clearInterval(timer))

function validate() {
    fieldErrors.username = form.username.trim() ? '' : 'กรุณากรอก Username'
    fieldErrors.password = form.password ? '' : 'กรุณากรอก Password'
    return !fieldErrors.username && !fieldErrors.password
}

async function handleLogin() {
    // clear server error on each new submit
    authStore.error = ''
    if (!validate()) return
    await authStore.LoginAction(form.username.trim(), form.password)
}
</script>

<template>
    <div class="min-h-screen flex">

        <!-- ── Left panel ──────────────────────────────────────────────── -->
        <div class="hidden lg:flex lg:w-1/2 bg-zinc-900 flex-col p-10 gap-8">

            <!-- Brand -->
            <div class="flex items-center gap-2.5">
                <div class="bg-zinc-800 rounded-xl p-2">
                    <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-yellow-400" />
                </div>
                <span class="text-white font-bold tracking-tight text-lg">SnapReward</span>
            </div>

            <!-- Headline -->
            <div>
                <h2 class="text-white text-3xl font-bold leading-snug">
                    สะสม Points<br />แลก Rewards
                    <span class="text-zinc-400">ง่ายกว่าที่คิด</span>
                </h2>
                <p class="text-zinc-500 text-sm mt-3 leading-relaxed">
                    แพลตฟอร์มสะสมแต้มและแลกของรางวัลออนไลน์<br />ครบ จบ ในที่เดียว
                </p>
            </div>

            <!-- Carousel -->
            <div class="relative w-full overflow-hidden rounded-2xl aspect-video">
                <template v-for="(slide, i) in slides" :key="i">
                    <img
                        :src="slide.src"
                        :alt="slide.alt"
                        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                        :class="i === currentSlide ? 'opacity-100' : 'opacity-0'"
                    />
                </template>
                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
                <!-- Dots -->
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <button
                        v-for="(_, i) in slides" :key="i"
                        class="h-1.5 rounded-full transition-all duration-300"
                        :class="i === currentSlide ? 'bg-white w-5' : 'bg-white/40 w-1.5'"
                        @click="currentSlide = i"
                    />
                </div>
            </div>

            <!-- Feature bullets -->
            <div class="space-y-3 mt-auto">
                <div
                    v-for="item in [
                        { icon: 'i-heroicons-bolt', text: 'สะสม points จากทุกกิจกรรมได้ทันที' },
                        { icon: 'i-heroicons-gift', text: 'แลก rewards หลากหลายกว่า 100 รายการ' },
                        { icon: 'i-heroicons-clock', text: 'ดูประวัติการแลกและยอดคงเหลือได้ตลอดเวลา' },
                    ]"
                    :key="item.text"
                    class="flex items-center gap-3"
                >
                    <div class="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <UIcon :name="item.icon" class="w-4 h-4 text-zinc-300" />
                    </div>
                    <span class="text-sm text-zinc-400">{{ item.text }}</span>
                </div>
            </div>
        </div>

        <!-- ── Right panel: Login form ─────────────────────────────────── -->
        <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white">
            <div class="w-full max-w-sm">

                <!-- Mobile brand (shown only on small screens) -->
                <div class="flex items-center gap-2 mb-8 lg:hidden">
                    <div class="bg-zinc-900 rounded-xl p-2">
                        <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-yellow-400" />
                    </div>
                    <span class="font-bold tracking-tight text-zinc-900">SnapReward</span>
                </div>

                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-zinc-900">Welcome back</h1>
                    <p class="text-zinc-500 text-sm mt-1">Sign in to your account to continue</p>
                </div>

                <form class="space-y-4" @submit.prevent="handleLogin">

                    <!-- Username -->
                    <div class="space-y-1.5">
                        <label class="text-sm font-medium text-zinc-700">Username</label>
                        <input
                            v-model="form.username"
                            type="text"
                            placeholder="กรอก username ของคุณ"
                            autocomplete="username"
                            class="w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 transition-colors"
                            :class="fieldErrors.username
                                ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                                : 'border-zinc-200 focus:ring-zinc-900'"
                            @input="fieldErrors.username = ''"
                        />
                        <p v-if="fieldErrors.username" class="text-xs text-red-500 flex items-center gap-1">
                            <UIcon name="i-heroicons-exclamation-circle" class="w-3.5 h-3.5" />
                            {{ fieldErrors.username }}
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="space-y-1.5">
                        <label class="text-sm font-medium text-zinc-700">Password</label>
                        <input
                            v-model="form.password"
                            type="password"
                            placeholder="กรอก password ของคุณ"
                            autocomplete="current-password"
                            class="w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 transition-colors"
                            :class="fieldErrors.password
                                ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                                : 'border-zinc-200 focus:ring-zinc-900'"
                            @input="fieldErrors.password = ''"
                        />
                        <p v-if="fieldErrors.password" class="text-xs text-red-500 flex items-center gap-1">
                            <UIcon name="i-heroicons-exclamation-circle" class="w-3.5 h-3.5" />
                            {{ fieldErrors.password }}
                        </p>
                    </div>

                    <!-- Server error (wrong credentials etc.) -->
                    <div
                        v-if="authStore.error"
                        class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                    >
                        <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p class="text-sm text-red-600">{{ authStore.error }}</p>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="authStore.loading"
                        class="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 transition-colors"
                    >
                        <svg
                            v-if="authStore.loading"
                            class="w-4 h-4 animate-spin"
                            fill="none" viewBox="0 0 24 24"
                        >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>

                <p class="text-center text-sm text-zinc-500 mt-6">
                    ยังไม่มีบัญชี?
                    <NuxtLink to="/register" class="text-zinc-900 font-medium hover:underline ml-1">
                        Register
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

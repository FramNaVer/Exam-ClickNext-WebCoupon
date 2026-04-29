<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const form = reactive({ username: '', password: '', role: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
    error.value = ''
    loading.value = true
    try {
        await authStore.login(form.username, form.password)

        const target = authStore.isAdmin ? '/admin' : '/'
        return await navigateTo(target)

    } catch (e: any) {
        if (isNuxtError(e) || e.message?.includes('redirect')) {
            throw e
        }
        console.error("Actual Login Error:", e)
        error.value = e?.data?.message || 'Invalid username or password'
    } finally {
        loading.value = false
    }
}

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
</script>

<template>
    <div class="min-h-screen flex">
        <!-- Left: Branding panel (hidden on mobile) -->
        <div class="hidden lg:flex lg:w-1/2 bg-zinc-900 flex-col justify-between p-12">
            <div class="text-white text-xl font-bold tracking-tight">PointReward</div>

            <!-- Image Slideshow -->
            <div class="relative w-full overflow-hidden rounded-2xl aspect-video mb-1 mt-1">
                <template v-for="(slide, i) in slides" :key="i">
                    <img :src="slide.src" :alt="slide.alt"
                        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                        :class="i === currentSlide ? 'opacity-100' : 'opacity-0'" />
                </template>
                <!-- Dots -->
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <button v-for="(_, i) in slides" :key="i" class="w-1.5 h-1.5 rounded-full transition-all"
                        :class="i === currentSlide ? 'bg-white w-4' : 'bg-white/40'" @click="currentSlide = i" />
                </div>
            </div>

            <!-- Stats + Quote -->
            <div>
                <div class="grid grid-cols-2 gap-4 mb-8">
                    <div class="bg-zinc-800 rounded-2xl p-5">
                        <div class="text-zinc-400 text-sm mb-1">Your Points</div>
                        <div class="text-white text-2xl font-bold">1,250</div>
                    </div>
                    <div class="bg-zinc-800 rounded-2xl p-5">
                        <div class="text-zinc-400 text-sm mb-1">Rewards</div>
                        <div class="text-white text-2xl font-bold">5</div>
                    </div>
                    <div class="bg-zinc-800 rounded-2xl p-5 col-span-2">
                        <div class="text-zinc-400 text-sm mb-2">Latest Reward</div>
                        <div class="text-white font-medium">🎬 Movie Ticket</div>
                        <div class="text-zinc-500 text-sm mt-1">Redeemed 2 days ago</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Login form -->
        <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
            <div class="w-full max-w-sm">
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back</h1>
                    <p class="text-zinc-500 text-sm mt-1">Sign in to your account to continue</p>
                </div>

                <form class="space-y-5" @submit.prevent="handleLogin">
                    <UFormField label="Username">
                        <UInput v-model="form.username" placeholder="Enter your username" required size="lg"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Password">
                        <UInput v-model="form.password" type="password" placeholder="Enter your password" required
                            size="lg" class="w-full" />
                    </UFormField>

                    <UAlert v-if="error" color="error" variant="soft" :description="error" />

                    <UButton type="submit" block size="lg" :loading="loading" class="w-full mt-2">
                        Sign In
                    </UButton>
                </form>

                <p class="text-center text-sm text-zinc-500 mt-6">
                    Don't have an account?
                    <NuxtLink to="/register" class="text-zinc-900 dark:text-white font-medium hover:underline">
                        Register
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

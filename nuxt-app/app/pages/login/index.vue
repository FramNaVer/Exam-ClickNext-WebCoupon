<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
    error.value = ''
    loading.value = true
    try {
        await authStore.login(form.username, form.password)
        await navigateTo('/')
    } catch (e: any) {
        error.value = e?.data?.message || 'Invalid username or password'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-4">
        <UCard class="w-full max-w-sm">
            <template #header>
                <div class="text-center py-2">
                    <h1 class="text-2xl font-bold">Welcome Back</h1>
                    <p class="text-gray-500 text-sm mt-1">Sign in to your account</p>
                </div>
            </template>

            <form class="space-y-4" @submit.prevent="handleLogin">
                <UFormField label="Username">
                    <UInput v-model="form.username" placeholder="Enter your username" required class="w-full" />
                </UFormField>

                <UFormField label="Password">
                    <UInput v-model="form.password" type="password" placeholder="Enter your password" required
                        class="w-full" />
                </UFormField>

                <UAlert v-if="error" color="error" variant="soft" :description="error" />

                <UButton type="submit" block :loading="loading" class="w-full">
                    Sign In
                </UButton>
            </form>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

const form = reactive({ username: '', password: '', confirmPassword: '' })
const error = ref('')
const loading = ref(false)

async function handleRegister() {
    error.value = ''

    if (form.password !== form.confirmPassword) {
        error.value = 'Passwords do not match'
        return
    }
    if (form.password.length < 6) {
        error.value = 'Password must be at least 6 characters'
        return
    }

    loading.value = true
    try {
        await $fetch(`${config.public.apiBaseUrl}/api/auth/register`, {
            method: 'POST',
            body: { username: form.username, password: form.password },
        })
        await authStore.login(form.username, form.password)
        await navigateTo('/')
    } catch (e: any) {
        error.value = e?.data?.message || 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
        <div class="w-full max-w-sm">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Create an account</h1>
                <p class="text-zinc-500 text-sm mt-1">Sign up to start earning rewards</p>
            </div>

            <form class="space-y-5" @submit.prevent="handleRegister">
                <UFormField label="Username">
                    <UInput
                        v-model="form.username"
                        placeholder="Choose a username"
                        required
                        size="lg"
                        class="w-full"
                        autocomplete="username"
                    />
                </UFormField>

                <UFormField label="Password">
                    <UInput
                        v-model="form.password"
                        type="password"
                        placeholder="Create a password"
                        required
                        size="lg"
                        class="w-full"
                        autocomplete="new-password"
                    />
                </UFormField>

                <UFormField label="Confirm Password">
                    <UInput
                        v-model="form.confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        size="lg"
                        class="w-full"
                        autocomplete="new-password"
                    />
                </UFormField>

                <UAlert v-if="error" color="error" variant="soft" :description="error" />

                <UButton
                    type="submit"
                    block
                    size="lg"
                    :loading="loading"
                    class="w-full mt-2"
                >
                    Create Account
                </UButton>
            </form>

            <p class="text-center text-sm text-zinc-500 mt-6">
                Already have an account?
                <NuxtLink to="/login" class="text-zinc-900 dark:text-white font-medium hover:underline">
                    Sign in
                </NuxtLink>
            </p>
        </div>
    </div>
</template>

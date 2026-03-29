<script setup>
const authStore = useAuthStore()
onMounted(() => {
  authStore.fetchCurrentUser()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

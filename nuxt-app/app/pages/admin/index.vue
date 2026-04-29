<script setup>
// ไม่ต้อง import auth จาก middleware เอง Nuxt จัดการให้ผ่าน definePageMeta
definePageMeta({ 
    middleware: 'auth' ,
    layout: 'admin'
})

const authStore = useAuthStore()
const { rewards, loading, error, fetchRewards } = useRewards()

// isAdmin จะเป็น true เสมอถ้าหลุดจาก Middleware มาถึงหน้านี้ได้
onMounted(() => {
    if (authStore.isAdmin) {
        fetchRewards()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <h1 class="text-2xl font-bold">Admin Panel</h1>
        
        <div v-if="loading">กำลังโหลด...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <div v-else>
            <!-- แสดงผล Rewards ตรงนี้ -->
            <pre>{{ rewards }}</pre>
        </div>
    </div>
</template>
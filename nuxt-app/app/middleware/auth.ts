export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // เช็ค isAuthenticated ซึ่งดู ทั้ง auth_token และ refresh_token
  // ทำให้ถ้า auth_token หมดอายุแต่ยังมี refresh_token อยู่ จะไม่ถูก kick ออกทันที
  if (!authStore.isAuthenticated) {
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  // user เป็น null หลัง page refresh → ดึงข้อมูลใหม่ (fetchCurrentUser จะ refresh token ถ้าจำเป็น)
  if (!authStore.user) {
    await authStore.fetchCurrentUser()
  }

  // ถ้าหลัง fetch แล้วยังไม่มี user (token หมดอายุทั้งคู่) → ไป login
  if (!authStore.user) {
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  if (authStore.isAdmin && !to.path.startsWith('/admin')) {
    if (to.path !== '/login') return navigateTo('/admin')
  }

  if (!authStore.isAdmin && to.path.startsWith('/admin')) {
    return navigateTo('/')
  }
})

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  // ใช้ useCookie เพื่อดึงค่าจาก Browser โดยตรง (Nuxt จะจัดการให้ทั้ง Client/Server)
  const token = useCookie('auth_token')

  // 1. ถ้าไม่มี Token เลย แสดงว่าไม่ได้ Login แน่นอน
  if (!token.value) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  // 2. ถ้ามี Token แต่ไม่มีข้อมูล User (กรณี Refresh หน้า)
  // ต้อง await เพื่อเติมข้อมูลกลับเข้า Store ให้เสร็จก่อนเดินหน้าต่อ
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      // ถ้า Token หมดอายุ หรือดึง Profile ไม่ได้ ให้เตะออก
      return navigateTo('/login')
    }
  }

  // 3. เมื่อได้ข้อมูล User มาแล้ว (authStore.user ไม่เป็น null แล้ว)
  // ค่อยเช็คสิทธิ์การเข้าถึงหน้า Admin
  if (authStore.isAdmin && !to.path.startsWith('/admin')) {
    if (to.path !== '/login') {
      return navigateTo('/admin')
    }
  }

  if (!authStore.isAdmin && to.path.startsWith('/admin')) {
    return navigateTo('/')
  }
})
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    if(to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }
  
  if (authStore.isAdmin && !to.path.startsWith('/admin')) {
    return navigateTo('/admin')
  }

  if (!authStore.isAdmin && to.path.startsWith('/admin')) {
    return navigateTo('/')
  }
})



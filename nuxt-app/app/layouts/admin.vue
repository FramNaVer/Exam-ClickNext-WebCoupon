<!-- layouts/admin.vue -->
<template>
    <div class="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main class="flex-1 overflow-y-auto bg-zinc-50">
            <slot />
        </main>
    </div>
</template>
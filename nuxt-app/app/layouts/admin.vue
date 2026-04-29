<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import NavbarAdmin from '~/components/NavbarAdmin.vue';

</script>

<template>
    <div class="min-h-screen bg-blue-100"> <!-- เปลี่ยนสีพื้นหลังเพื่อแยกความแตกต่าง -->
        <!-- อาจจะเพิ่ม Navbar หรือ Sidebar เฉพาะสำหรับ Admin ที่นี่ -->
        <navbar-admin />
        <slot />
    </div>
</template>
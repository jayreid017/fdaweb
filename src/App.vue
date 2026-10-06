<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './lib/supabase';
import { AuthService } from './services/authService';

const router = useRouter();

onMounted(() => {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      AuthService.setRecoveryMode(true);
      if (router.currentRoute.value.path !== '/reset-password') {
        router.push('/reset-password');
      }
    }
  });
});
</script>

<template>
  <div class="min-h-screen relative font-sans text-[#172a1f] selection:bg-[#c5a869]/25 selection:text-[#0f291e]">
    <router-view />
  </div>
</template>

<template>
  <div class="login-card">
    <h1>{{ t("admin.login") }}</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">{{ t("admin.email") }}</label>
        <input id="email" v-model="email" type="email" required placeholder="admin@example.com" />
      </div>
      <div class="form-group">
        <label for="password">{{ t("admin.password") }}</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" class="btn btn-primary" style="width:100%" :disabled="loading">
        {{ loading ? t("admin.loggingIn") : t("admin.loginBtn") }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { t } from "../../i18n/index";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

onMounted(async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;
  try {
    const res = await fetch("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) window.location.href = "/admin";
  } catch {}
});

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("accessToken", data.data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
      window.location.href = "/admin";
    } else {
      error.value = data.error || t("admin.loginFailed");
    }
  } catch {
    error.value = t("admin.networkError");
  } finally {
    loading.value = false;
  }
}
</script>

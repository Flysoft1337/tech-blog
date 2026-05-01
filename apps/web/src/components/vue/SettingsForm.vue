<template>
  <div>
    <!-- Language switcher -->
    <div class="admin-card" style="margin-bottom:1rem">
      <div class="form-group" style="margin-bottom:0">
        <label>{{ t("admin.language") }}</label>
        <div class="lang-switcher">
          <button :class="['lang-btn', { active: currentLocale === 'zh-CN' }]" @click="switchLocale('zh-CN')">
            {{ t("admin.langZh") }}
          </button>
          <button :class="['lang-btn', { active: currentLocale === 'en' }]" @click="switchLocale('en')">
            {{ t("admin.langEn") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Site settings -->
    <div class="admin-card">
    <form @submit.prevent="saveSettings">
      <div class="form-group">
        <label>{{ t("admin.siteName") }}</label>
        <input v-model="form.siteName" />
      </div>
      <div class="form-group">
        <label>{{ t("admin.siteDescription") }}</label>
        <textarea v-model="form.siteDescription" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>{{ t("admin.siteUrl") }}</label>
        <input v-model="form.siteUrl" type="url" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>{{ t("admin.logoUrl") }}</label>
        <input v-model="form.siteLogo" placeholder="/uploads/logo.png" />
      </div>
      <div class="form-group">
        <label>{{ t("admin.postsPerPage") }}</label>
        <input v-model="form.postsPerPage" type="number" min="1" max="50" />
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="form.commentModeration" />
          {{ t("admin.requireModeration") }}
        </label>
      </div>
      <p v-if="message" :class="success ? 'success-msg' : 'error-msg'" style="margin-bottom:0.5rem; font-size:0.85rem">
        {{ message }}
      </p>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? t("admin.savingSettings") : t("admin.saveSettings") }}
      </button>
    </form>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { t, getLocale, setLocale } from "../../i18n/index";
import type { Locale } from "../../i18n/index";

const currentLocale = ref<Locale>(getLocale());

function switchLocale(locale: Locale) {
  setLocale(locale);
  currentLocale.value = locale;
  window.location.reload();
}

const form = ref({
  siteName: "",
  siteDescription: "",
  siteUrl: "",
  siteLogo: "",
  postsPerPage: "10",
  commentModeration: true,
});

const loading = ref(false);
const message = ref("");
const success = ref(false);

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

async function loadSettings() {
  try {
    const res = await fetch("/api/v1/admin/settings", { headers: getHeaders() });
    const data = await res.json();
    if (data.success) {
      form.value = {
        siteName: data.data.siteName || "",
        siteDescription: data.data.siteDescription || "",
        siteUrl: data.data.siteUrl || "",
        siteLogo: data.data.siteLogo || "",
        postsPerPage: data.data.postsPerPage || "10",
        commentModeration: data.data.commentModeration === "true",
      };
    }
  } catch {}
}

async function saveSettings() {
  loading.value = true;
  message.value = "";

  try {
    const payload: Record<string, string> = {
      siteName: form.value.siteName,
      siteDescription: form.value.siteDescription,
      siteUrl: form.value.siteUrl,
      siteLogo: form.value.siteLogo,
      postsPerPage: form.value.postsPerPage,
      commentModeration: form.value.commentModeration.toString(),
    };

    const res = await fetch("/api/v1/admin/settings", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      success.value = true;
      message.value = t("admin.settingsSaved");
      if (typeof window.showToast === "function") window.showToast(t("admin.settingsSaved"));
    } else {
      success.value = false;
      message.value = data.error || t("editor.saveFailed");
    }
  } catch {
    success.value = false;
    message.value = t("admin.networkError");
  } finally {
    loading.value = false;
  }
}

onMounted(loadSettings);
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
.success-msg {
  color: #059669;
}
.lang-switcher {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  width: fit-content;
}
.lang-btn {
  padding: 0.4rem 1.25rem;
  border: none;
  background: var(--color-bg);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid var(--color-border);
}
.lang-btn:last-child {
  border-right: none;
}
.lang-btn.active {
  background: var(--color-primary);
  color: white;
}
.lang-btn:not(.active):hover {
  background: var(--color-bg-secondary);
}
</style>

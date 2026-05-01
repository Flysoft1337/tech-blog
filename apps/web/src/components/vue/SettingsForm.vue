<template>
  <div class="admin-card">
    <form @submit.prevent="saveSettings">
      <div class="form-group">
        <label>Site Name</label>
        <input v-model="form.siteName" />
      </div>
      <div class="form-group">
        <label>Site Description</label>
        <textarea v-model="form.siteDescription" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Site URL</label>
        <input v-model="form.siteUrl" type="url" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>Logo URL</label>
        <input v-model="form.siteLogo" placeholder="/uploads/logo.png" />
      </div>
      <div class="form-group">
        <label>Posts Per Page</label>
        <input v-model="form.postsPerPage" type="number" min="1" max="50" />
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="form.commentModeration" />
          Require comment moderation
        </label>
      </div>
      <p v-if="message" :class="success ? 'success-msg' : 'error-msg'" style="margin-bottom:0.5rem; font-size:0.85rem">
        {{ message }}
      </p>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Saving..." : "Save Settings" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

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
      message.value = "Settings saved!";
    } else {
      success.value = false;
      message.value = data.error || "Failed to save";
    }
  } catch {
    success.value = false;
    message.value = "Network error";
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
</style>

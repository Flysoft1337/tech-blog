<template>
  <div>
    <div v-if="comments.length > 0" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <strong>{{ comment.authorName }}</strong>
          <time>{{ formatDate(comment.createdAt) }}</time>
        </div>
        <p>{{ comment.content }}</p>
      </div>
    </div>

    <form class="comment-form" @submit.prevent="submitComment">
      <h3>Leave a Comment</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Name *</label>
          <input v-model="form.authorName" required />
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input v-model="form.authorEmail" type="email" required />
        </div>
      </div>
      <div class="form-group">
        <label>Website</label>
        <input v-model="form.authorUrl" type="url" placeholder="https://" />
      </div>
      <div class="form-group">
        <label>Comment *</label>
        <textarea v-model="form.content" rows="4" required></textarea>
      </div>
      <p v-if="message" :class="success ? 'success-msg' : 'error-msg'">{{ message }}</p>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Submitting..." : "Submit" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{ slug: string }>();

const comments = ref<any[]>([]);
const loading = ref(false);
const message = ref("");
const success = ref(false);

const form = ref({
  authorName: "",
  authorEmail: "",
  authorUrl: "",
  content: "",
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function loadComments() {
  try {
    const res = await fetch(`/api/v1/posts/${props.slug}/comments`);
    const data = await res.json();
    if (data.success) comments.value = data.data;
  } catch {}
}

async function submitComment() {
  loading.value = true;
  message.value = "";

  try {
    const res = await fetch(`/api/v1/posts/${props.slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });
    const data = await res.json();

    if (data.success) {
      success.value = true;
      message.value = "Comment submitted! It will appear after moderation.";
      form.value = { authorName: "", authorEmail: "", authorUrl: "", content: "" };
    } else {
      success.value = false;
      message.value = data.error || "Failed to submit";
    }
  } catch {
    success.value = false;
    message.value = "Network error";
  } finally {
    loading.value = false;
  }
}

onMounted(loadComments);
</script>

<style scoped>
.comments-list {
  margin-bottom: 2rem;
}
.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}
.comment-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.comment-header time {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}
.comment-form h3 {
  margin-bottom: 1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
  flex: 1;
}
.form-group {
  margin-bottom: 1rem;
}
.success-msg {
  color: #059669;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
</style>

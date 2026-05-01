<template>
  <div>
    <div v-if="comments.length > 0" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <img :src="gravatarUrl(comment.authorEmail)" :alt="comment.authorName" />
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <strong>
              <a v-if="comment.authorUrl" :href="comment.authorUrl" target="_blank" rel="nofollow noopener">{{ comment.authorName }}</a>
              <span v-else>{{ comment.authorName }}</span>
            </strong>
            <time :title="new Date(comment.createdAt).toLocaleString('zh-CN')">{{ relativeTime(comment.createdAt) }}</time>
          </div>
          <p>{{ comment.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="no-comments">
      <p>No comments yet. Be the first!</p>
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

function gravatarUrl(email: string) {
  const hash = email?.trim().toLowerCase() || "";
  return `https://gravatar.com/avatar/${hashCode(hash)}?d=mp&s=80`;
}

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}

function relativeTime(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
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
  display: flex;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--color-border);
}
.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
}
.comment-body {
  flex: 1;
  min-width: 0;
}
.comment-header {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  margin-bottom: 0.375rem;
  font-size: 0.9rem;
}
.comment-header a {
  color: var(--color-text);
  font-weight: 600;
}
.comment-header a:hover {
  color: var(--color-primary);
}
.comment-header time {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}
.comment-body p {
  line-height: 1.6;
  font-size: 0.95rem;
}
.no-comments {
  text-align: center;
  padding: 2rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
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
.error-msg {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>

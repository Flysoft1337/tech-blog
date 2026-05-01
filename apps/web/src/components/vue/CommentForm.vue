<template>
  <div>
    <div v-if="comments.length > 0" class="comments-list">
      <template v-for="comment in topLevelComments" :key="comment.id">
        <div class="comment-item">
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
            <button class="reply-btn" @click="replyTo = replyTo === comment.id ? null : comment.id">
              {{ replyTo === comment.id ? t('comment.cancel') : t('comment.reply') }}
            </button>
          </div>
        </div>
        <!-- Replies -->
        <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="comment-item reply">
          <div class="comment-avatar">
            <img :src="gravatarUrl(reply.authorEmail)" :alt="reply.authorName" />
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <strong>
                <a v-if="reply.authorUrl" :href="reply.authorUrl" target="_blank" rel="nofollow noopener">{{ reply.authorName }}</a>
                <span v-else>{{ reply.authorName }}</span>
              </strong>
              <time :title="new Date(reply.createdAt).toLocaleString('zh-CN')">{{ relativeTime(reply.createdAt) }}</time>
            </div>
            <p>{{ reply.content }}</p>
          </div>
        </div>
        <!-- Inline reply form -->
        <div v-if="replyTo === comment.id" class="reply-form-wrapper">
          <form class="comment-form compact" @submit.prevent="submitComment(comment.id)">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t("comment.name") }} *</label>
                <input v-model="form.authorName" required />
              </div>
              <div class="form-group">
                <label>{{ t("comment.email") }} *</label>
                <input v-model="form.authorEmail" type="email" required />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t("comment.reply") }} *</label>
              <textarea v-model="form.content" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? t("comment.submitting") : t("comment.reply") }}
            </button>
          </form>
        </div>
      </template>
    </div>
    <div v-else class="no-comments">
      <p>{{ t("comment.noComments") }}</p>
    </div>

    <form class="comment-form" @submit.prevent="submitComment(null)">
      <h3>{{ t("comment.leaveComment") }}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>{{ t("comment.name") }} *</label>
          <input v-model="form.authorName" required />
        </div>
        <div class="form-group">
          <label>{{ t("comment.email") }} *</label>
          <input v-model="form.authorEmail" type="email" required />
        </div>
      </div>
      <div class="form-group">
        <label>{{ t("comment.website") }}</label>
        <input v-model="form.authorUrl" type="url" placeholder="https://" />
      </div>
      <div class="form-group">
        <label>{{ t("comment.content") }} *</label>
        <textarea v-model="form.content" rows="4" required></textarea>
      </div>
      <p v-if="message" :class="success ? 'success-msg' : 'error-msg'">{{ message }}</p>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? t("comment.submitting") : t("comment.submit") }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { t } from "../../i18n/index";

const props = defineProps<{ slug: string }>();

const comments = ref<any[]>([]);
const loading = ref(false);
const message = ref("");
const success = ref(false);
const replyTo = ref<number | null>(null);

const form = ref({
  authorName: "",
  authorEmail: "",
  authorUrl: "",
  content: "",
});

const topLevelComments = computed(() =>
  comments.value.filter(c => !c.parentId)
);

function getReplies(parentId: number) {
  return comments.value.filter(c => c.parentId === parentId);
}

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
  if (minutes < 1) return t("comment.justNow");
  if (minutes < 60) return t("comment.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("comment.hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("comment.daysAgo", { n: days });
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

async function loadComments() {
  try {
    const res = await fetch(`/api/v1/posts/${props.slug}/comments`);
    const data = await res.json();
    if (data.success) comments.value = data.data;
  } catch {}
}

async function submitComment(parentId: number | null) {
  loading.value = true;
  message.value = "";

  try {
    const body: any = { ...form.value };
    if (parentId) body.parentId = parentId;

    const res = await fetch(`/api/v1/posts/${props.slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      success.value = true;
      message.value = t("comment.submitted");
      form.value = { authorName: "", authorEmail: "", authorUrl: "", content: "" };
      replyTo.value = null;
    } else {
      success.value = false;
      message.value = data.error || "Failed to submit";
    }
  } catch {
    success.value = false;
    message.value = t("admin.networkError");
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
.comment-item.reply {
  padding-left: 3.5rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius);
  margin: 0.25rem 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-right: 1rem;
}
.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
}
.comment-item.reply .comment-avatar img {
  width: 32px;
  height: 32px;
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
.reply-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  margin-top: 0.25rem;
}
.reply-btn:hover {
  color: var(--color-primary);
}
.reply-form-wrapper {
  padding-left: 3.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}
.comment-form.compact {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius);
}
.comment-form.compact .form-group {
  margin-bottom: 0.5rem;
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
  .comment-item.reply {
    padding-left: 2rem;
  }
  .reply-form-wrapper {
    padding-left: 1rem;
  }
}
</style>

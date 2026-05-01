<template>
  <div class="post-editor">
    <form @submit.prevent="savePost">
      <div class="editor-grid">
        <div class="editor-main">
          <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" required @input="generateSlug" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="form.slug" required />
          </div>
          <div class="form-group">
            <label>Content (Markdown)</label>
            <textarea v-model="form.content" rows="20" style="font-family:monospace; font-size:0.9rem"></textarea>
          </div>
          <div class="form-group">
            <label>Excerpt</label>
            <textarea v-model="form.excerpt" rows="3"></textarea>
          </div>
        </div>
        <div class="editor-sidebar">
          <div class="admin-card">
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="form.pinned" /> Pin this post
              </label>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="form.categoryId">
                <option :value="undefined">None</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tags</label>
              <div class="tag-select">
                <label v-for="tag in tags" :key="tag.id" class="tag-option">
                  <input type="checkbox" :value="tag.id" v-model="form.tagIds" />
                  {{ tag.name }}
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>Cover Image URL</label>
              <input v-model="form.coverImage" placeholder="/uploads/..." />
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%" :disabled="loading">
              {{ loading ? "Saving..." : "Save" }}
            </button>
            <p v-if="message" :class="success ? 'success-msg' : 'error-msg'" style="margin-top:0.5rem; font-size:0.85rem">
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{ postId?: string }>();

const form = ref({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  status: "draft" as "draft" | "published",
  pinned: false,
  categoryId: undefined as number | undefined,
  tagIds: [] as number[],
});

const categories = ref<any[]>([]);
const tags = ref<any[]>([]);
const loading = ref(false);
const message = ref("");
const success = ref(false);

function generateSlug() {
  if (!props.postId) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

function getHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function loadData() {
  const headers = getHeaders();

  const [catRes, tagRes] = await Promise.all([
    fetch("/api/v1/admin/categories", { headers }),
    fetch("/api/v1/admin/tags", { headers }),
  ]);

  const catData = await catRes.json();
  const tagData = await tagRes.json();
  if (catData.success) categories.value = catData.data;
  if (tagData.success) tags.value = tagData.data;

  if (props.postId) {
    const res = await fetch(`/api/v1/admin/posts/${props.postId}`, { headers });
    const data = await res.json();
    if (data.success) {
      const p = data.data;
      form.value = {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt || "",
        coverImage: p.coverImage || "",
        status: p.status,
        pinned: p.pinned,
        categoryId: p.categoryId || undefined,
        tagIds: (p.tags || []).map((t: any) => t.id),
      };
    }
  }
}

async function savePost() {
  loading.value = true;
  message.value = "";

  try {
    const url = props.postId
      ? `/api/v1/admin/posts/${props.postId}`
      : "/api/v1/admin/posts";
    const method = props.postId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(form.value),
    });
    const data = await res.json();

    if (data.success) {
      success.value = true;
      message.value = "Saved!";
      if (!props.postId && data.data?.id) {
        window.location.href = `/admin/posts/${data.data.id}`;
      }
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

onMounted(loadData);
</script>

<style scoped>
.editor-grid {
  display: flex;
  gap: 1.5rem;
}
.editor-main {
  flex: 1;
}
.editor-sidebar {
  width: 300px;
  flex-shrink: 0;
}
.form-group {
  margin-bottom: 1rem;
}
.tag-select {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag-option {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: normal;
}
.success-msg {
  color: #059669;
}
@media (max-width: 768px) {
  .editor-grid {
    flex-direction: column;
  }
  .editor-sidebar {
    width: 100%;
  }
}
</style>

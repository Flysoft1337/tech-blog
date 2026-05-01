<template>
  <div class="post-editor">
    <form @submit.prevent="savePost">
      <div class="editor-grid">
        <div class="editor-main">
          <div class="form-group">
            <label>{{ t("editor.title") }}</label>
            <input v-model="form.title" required @input="generateSlug" />
          </div>
          <div class="form-group">
            <label>{{ t("editor.slug") }}</label>
            <input v-model="form.slug" required />
          </div>
          <div class="form-group">
            <div class="content-header">
              <label>{{ t("editor.content") }}</label>
              <div class="content-actions">
                <div v-if="!showPreview" class="md-toolbar">
                  <button type="button" :title="t('editor.bold')" @click="wrapSelection('**', '**')"><b>B</b></button>
                  <button type="button" :title="t('editor.italic')" @click="wrapSelection('*', '*')"><i>I</i></button>
                  <button type="button" :title="t('editor.code')" @click="wrapSelection('`', '`')"><code>{'<>'}</code></button>
                  <button type="button" :title="t('editor.link')" @click="insertLink">Link</button>
                  <button type="button" :title="t('editor.image')" @click="insertImage">Img</button>
                  <button type="button" :title="t('editor.heading')" @click="insertAtLineStart('## ')">H2</button>
                  <button type="button" :title="t('editor.list')" @click="insertAtLineStart('- ')">List</button>
                  <button type="button" :title="t('editor.codeBlock')" @click="wrapSelection('\n```\n', '\n```\n')">Block</button>
                </div>
                <button type="button" class="btn preview-toggle" @click="showPreview = !showPreview">
                  {{ showPreview ? t("editor.editMode") : t("editor.preview") }}
                </button>
              </div>
            </div>
            <div v-if="showPreview" class="preview-pane prose" v-html="previewHtml"></div>
            <textarea v-else ref="contentArea" v-model="form.content" rows="20" style="font-family:monospace; font-size:0.9rem"
              @keydown.tab.prevent="insertTab" @paste="handlePaste"></textarea>
            <div class="word-count">{{ t("editor.chars", { count: form.content.length }) }} / {{ t("editor.words", { count: wordCount }) }}</div>
          </div>
          <div class="form-group">
            <label>{{ t("editor.excerpt") }}</label>
            <textarea v-model="form.excerpt" rows="3"></textarea>
          </div>
        </div>
        <div class="editor-sidebar">
          <div class="admin-card">
            <div class="form-group">
              <label>{{ t("editor.statusLabel") }}</label>
              <select v-model="form.status">
                <option value="draft">{{ t("editor.draft") }}</option>
                <option value="published">{{ t("editor.publishedStatus") }}</option>
                <option value="scheduled">{{ t("editor.scheduled") }}</option>
              </select>
            </div>
            <div v-if="form.status === 'scheduled'" class="form-group">
              <label>{{ t("editor.scheduledAt") }}</label>
              <input v-model="form.scheduledAt" type="datetime-local" />
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="form.pinned" /> {{ t("editor.pinPost") }}
              </label>
            </div>
            <div class="form-group">
              <label>{{ t("editor.categoryLabel") }}</label>
              <select v-model="form.categoryId">
                <option :value="undefined">{{ t("editor.none") }}</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t("editor.seriesLabel") }}</label>
              <select v-model="form.seriesId">
                <option :value="undefined">{{ t("editor.none") }}</option>
                <option v-for="s in seriesList" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div v-if="form.seriesId" class="form-group">
              <label>{{ t("editor.seriesOrder") }}</label>
              <input v-model.number="form.seriesOrder" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>{{ t("editor.tagsLabel") }}</label>
              <div class="tag-select">
                <label v-for="tag in tags" :key="tag.id" class="tag-option">
                  <input type="checkbox" :value="tag.id" v-model="form.tagIds" />
                  {{ tag.name }}
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t("editor.coverImage") }}</label>
              <input v-model="form.coverImage" placeholder="/uploads/..." />
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%" :disabled="loading">
              {{ loading ? t("editor.saving") : t("editor.saveBtn") }}
            </button>
            <p v-if="message" :class="success ? 'success-msg' : 'error-msg'" style="margin-top:0.5rem; font-size:0.85rem">
              {{ message }}
            </p>
            <p v-if="lastAutoSave" style="margin-top:0.25rem; font-size:0.75rem; color:var(--color-text-secondary)">
              {{ t("editor.autoSaved", { time: lastAutoSave }) }}
            </p>
          </div>
          <div v-if="props.postId" class="admin-card" style="margin-top:1rem">
            <div class="form-group" style="margin-bottom:0">
              <label style="margin-bottom:0.5rem">{{ t("editor.versionHistory") }}</label>
              <button type="button" class="btn" style="width:100%; font-size:0.8rem" @click="loadVersions">
                {{ t("editor.viewVersions") }}
              </button>
              <div v-if="versions.length > 0" class="versions-list">
                <div v-for="v in versions" :key="v.id" class="version-item">
                  <div>
                    <span style="font-size:0.8rem; font-weight:500">{{ v.title }}</span>
                    <span style="font-size:0.7rem; color:var(--color-text-secondary); margin-left:0.5rem">{{ v.editorName }}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem">
                    <span style="font-size:0.7rem; color:var(--color-text-secondary)">{{ formatVersionDate(v.createdAt) }}</span>
                    <button type="button" class="btn" style="font-size:0.7rem; padding:0.15rem 0.4rem" @click="restoreVersion(v.id)">
                      {{ t("editor.restore") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="admin-card" style="margin-top:1rem">
            <div class="form-group" style="margin-bottom:0">
              <label style="margin-bottom:0.5rem">{{ t("editor.shortcuts") }}</label>
              <ul class="shortcuts-list">
                <li><kbd>Tab</kbd> {{ t("editor.insertIndent") }}</li>
                <li><kbd>Ctrl+S</kbd> {{ t("editor.savePost") }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Media picker modal -->
    <div v-if="showMediaPicker" class="modal-overlay" @click.self="showMediaPicker = false">
      <div class="modal-card media-picker">
        <h3>{{ t("editor.selectImage") }}</h3>
        <div class="media-grid">
          <div v-for="file in mediaFiles" :key="file.id" class="media-item" @click="pickMedia(file.url)">
            <img v-if="file.mimeType?.startsWith('image/')" :src="file.url" :alt="file.filename" loading="lazy" />
            <span v-else class="file-name">{{ file.filename }}</span>
          </div>
          <div v-if="mediaFiles.length === 0" style="grid-column:1/-1; text-align:center; color:var(--color-text-secondary); padding:2rem">
            {{ t("admin.noData") }}
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:1rem">
          <button type="button" class="btn" @click="showMediaPicker = false">{{ t("admin.cancelBtn") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { t } from "../../i18n/index";

const props = defineProps<{ postId?: string }>();

const form = ref({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  status: "draft" as "draft" | "published" | "scheduled",
  pinned: false,
  categoryId: undefined as number | undefined,
  tagIds: [] as number[],
  seriesId: undefined as number | undefined,
  seriesOrder: undefined as number | undefined,
  scheduledAt: "",
});

const savedSnapshot = ref("");
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value);

function takeSnapshot() {
  savedSnapshot.value = JSON.stringify(form.value);
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = "";
  }
}

const categories = ref<any[]>([]);
const tags = ref<any[]>([]);
const seriesList = ref<any[]>([]);
const loading = ref(false);
const message = ref("");
const success = ref(false);
const showPreview = ref(false);
const previewHtml = ref("");
const contentArea = ref<HTMLTextAreaElement | null>(null);
const showMediaPicker = ref(false);
const mediaFiles = ref<any[]>([]);

const wordCount = computed(() => {
  const text = form.value.content.replace(/[#*`~>\[\]()!_\-|]/g, "").trim();
  if (!text) return 0;
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const eng = text.replace(/[一-鿿㐀-䶿]/g, " ").split(/\s+/).filter(Boolean).length;
  return cjk + eng;
});

let previewTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => form.value.content, () => {
  if (showPreview.value) renderPreview();
});

watch(showPreview, (val) => {
  if (val) renderPreview();
});

async function renderPreview() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/v1/admin/preview", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content: form.value.content }),
      });
      const data = await res.json();
      if (data.success) previewHtml.value = data.data.html;
    } catch {
      previewHtml.value = `<p style='color:#dc2626'>${t("editor.previewFailed")}</p>`;
    }
  }, 300);
}

function insertTab(e: KeyboardEvent) {
  const target = e.target as HTMLTextAreaElement;
  const start = target.selectionStart;
  const end = target.selectionEnd;
  form.value.content = form.value.content.substring(0, start) + "  " + form.value.content.substring(end);
  requestAnimationFrame(() => {
    target.selectionStart = target.selectionEnd = start + 2;
  });
}

function wrapSelection(before: string, after: string) {
  const ta = contentArea.value;
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = form.value.content.substring(start, end) || "text";
  form.value.content = form.value.content.substring(0, start) + before + selected + after + form.value.content.substring(end);
  requestAnimationFrame(() => {
    ta.focus();
    ta.selectionStart = start + before.length;
    ta.selectionEnd = start + before.length + selected.length;
  });
}

function insertAtLineStart(prefix: string) {
  const ta = contentArea.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  const lineStart = form.value.content.lastIndexOf("\n", pos - 1) + 1;
  form.value.content = form.value.content.substring(0, lineStart) + prefix + form.value.content.substring(lineStart);
  requestAnimationFrame(() => {
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + prefix.length;
  });
}

function insertLink() {
  const ta = contentArea.value;
  if (!ta) return;
  const selected = form.value.content.substring(ta.selectionStart, ta.selectionEnd);
  const text = selected || "link text";
  wrapSelection("[", "](url)");
}

function insertImage() {
  showMediaPicker.value = true;
  loadMediaFiles();
}

async function loadMediaFiles() {
  try {
    const res = await fetch("/api/v1/admin/media?pageSize=50", { headers: getHeaders() });
    const data = await res.json();
    if (data.success) mediaFiles.value = data.data.items || [];
  } catch {}
}

function pickMedia(url: string) {
  const ta = contentArea.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  const snippet = `![image](${url})`;
  form.value.content = form.value.content.substring(0, pos) + snippet + form.value.content.substring(pos);
  showMediaPicker.value = false;
  requestAnimationFrame(() => {
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + snippet.length;
  });
}

async function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/v1/admin/media/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          const url = data.data.url;
          const ta = contentArea.value;
          if (!ta) return;
          const pos = ta.selectionStart;
          const snippet = `![image](${url})`;
          form.value.content = form.value.content.substring(0, pos) + snippet + form.value.content.substring(pos);
          if (typeof window.showToast === "function") window.showToast(t("admin.uploadComplete"));
        }
      } catch {}
      return;
    }
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    savePost();
  }
}

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

  const [catRes, tagRes, seriesRes] = await Promise.all([
    fetch("/api/v1/admin/categories", { headers }),
    fetch("/api/v1/admin/tags", { headers }),
    fetch("/api/v1/admin/series", { headers }),
  ]);

  const catData = await catRes.json();
  const tagData = await tagRes.json();
  const seriesData = await seriesRes.json();
  if (catData.success) categories.value = catData.data;
  if (tagData.success) tags.value = tagData.data;
  if (seriesData.success) seriesList.value = seriesData.data;

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
        tagIds: (p.tags || []).map((tag: any) => tag.id),
        seriesId: p.seriesId || undefined,
        seriesOrder: p.seriesOrder || undefined,
        scheduledAt: p.scheduledAt ? p.scheduledAt.replace(" ", "T").substring(0, 16) : "",
      };
    }
  }
  takeSnapshot();
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
      message.value = t("editor.saved");
      takeSnapshot();
      if (typeof window.showToast === "function") window.showToast(t("editor.postSaved"));
      if (!props.postId && data.data?.id) {
        window.location.href = `/admin/posts/${data.data.id}`;
      }
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

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
const lastAutoSave = ref("");
const versions = ref<any[]>([]);

function formatVersionDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

async function loadVersions() {
  if (!props.postId) return;
  try {
    const res = await fetch(`/api/v1/admin/posts/${props.postId}/versions`, { headers: getHeaders() });
    const data = await res.json();
    if (data.success) versions.value = data.data;
  } catch {}
}

async function restoreVersion(versionId: number) {
  if (!props.postId || !confirm(t("editor.confirmRestore"))) return;
  try {
    const res = await fetch(`/api/v1/admin/posts/${props.postId}/versions/${versionId}/restore`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      form.value.title = data.data.title;
      form.value.content = data.data.content;
      takeSnapshot();
      if (typeof window.showToast === "function") window.showToast(t("editor.restored"));
    }
  } catch {}
}

async function autoSave() {
  if (!props.postId || !isDirty.value || loading.value) return;
  try {
    await fetch(`/api/v1/admin/posts/${props.postId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(form.value),
    });
    takeSnapshot();
    lastAutoSave.value = new Date().toLocaleTimeString();
  } catch {}
}

onMounted(() => {
  loadData();
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("beforeunload", handleBeforeUnload);
  autoSaveTimer = setInterval(autoSave, 30_000);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("beforeunload", handleBeforeUnload);
  if (autoSaveTimer) clearInterval(autoSaveTimer);
});
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
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}
.content-header label {
  margin-bottom: 0;
}
.content-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.md-toolbar {
  display: flex;
  gap: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.md-toolbar button {
  border: none;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid var(--color-border);
}
.md-toolbar button:last-child {
  border-right: none;
}
.md-toolbar button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}
.word-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}
.preview-toggle {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
}
.preview-pane {
  min-height: 400px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  overflow-y: auto;
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
.shortcuts-list {
  list-style: none;
  padding: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
.shortcuts-list li {
  padding: 0.2rem 0;
}
.shortcuts-list kbd {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  font-size: 0.75rem;
  font-family: monospace;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  margin-right: 0.25rem;
}
@media (max-width: 768px) {
  .editor-grid {
    flex-direction: column;
  }
  .editor-sidebar {
    width: 100%;
  }
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: var(--color-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  max-width: 700px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}
.media-picker h3 {
  margin-bottom: 1rem;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}
.media-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.15s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
}
.media-item:hover {
  border-color: var(--color-primary);
}
.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-name {
  font-size: 0.75rem;
  padding: 0.5rem;
  text-align: center;
  word-break: break-all;
  color: var(--color-text-secondary);
}
.versions-list {
  margin-top: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}
.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  gap: 0.5rem;
}
.version-item:last-child {
  border-bottom: none;
}
</style>

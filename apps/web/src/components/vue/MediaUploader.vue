<template>
  <div>
    <!-- Upload area -->
    <div class="admin-card upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*,video/*,application/pdf" multiple style="display:none" />
      <p>Drag files here or <a href="#" @click.prevent="fileInput?.click()">browse</a></p>
      <p v-if="uploading" style="margin-top:0.5rem; color:var(--color-text-secondary)">Uploading...</p>
    </div>

    <!-- Media grid -->
    <div class="media-grid">
      <div v-for="item in items" :key="item.id" class="media-item">
        <div class="media-preview">
          <img v-if="item.mimeType.startsWith('image/')" :src="item.url" :alt="item.originalName" loading="lazy" />
          <div v-else class="file-icon">{{ item.mimeType.split('/')[1]?.toUpperCase() }}</div>
        </div>
        <div class="media-info">
          <span class="media-name" :title="item.originalName">{{ item.originalName }}</span>
          <span class="media-size">{{ formatSize(item.size) }}</span>
        </div>
        <div class="media-actions">
          <button class="btn" style="font-size:0.75rem; padding:0.2rem 0.4rem" @click="copyUrl(item.url)">Copy URL</button>
          <button class="btn" style="font-size:0.75rem; padding:0.2rem 0.4rem; color:#dc2626" @click="deleteItem(item.id)">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button v-if="page > 1" class="btn" @click="page--; loadData()">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button v-if="page < totalPages" class="btn" @click="page++; loadData()">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const items = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("accessToken")}` };
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function loadData() {
  const res = await fetch(`/api/v1/admin/media?page=${page.value}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (data.success) {
    items.value = data.data.items;
    totalPages.value = data.data.totalPages;
  }
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  await fetch("/api/v1/admin/media/upload", {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
}

async function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  uploading.value = true;
  for (const file of files) {
    await uploadFile(file);
  }
  uploading.value = false;
  if (typeof window.showToast === "function") window.showToast("Upload complete!");
  loadData();
}

async function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files;
  if (!files) return;
  uploading.value = true;
  for (const file of files) {
    await uploadFile(file);
  }
  uploading.value = false;
  if (typeof window.showToast === "function") window.showToast("Upload complete!");
  loadData();
}

async function deleteItem(id: number) {
  if (!confirm("Delete this file?")) return;
  await fetch(`/api/v1/admin/media/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  loadData();
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(window.location.origin + url);
  if (typeof window.showToast === "function") window.showToast("URL copied!");
}

onMounted(loadData);
</script>

<style scoped>
.upload-area {
  text-align: center;
  border: 2px dashed var(--color-border);
  padding: 2rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
}
.upload-area:hover {
  border-color: var(--color-primary);
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.media-item {
  background: var(--color-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.media-preview {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
}
.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-icon {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
.media-info {
  padding: 0.5rem;
}
.media-name {
  display: block;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-size {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}
.media-actions {
  padding: 0 0.5rem 0.5rem;
  display: flex;
  gap: 0.25rem;
}
</style>

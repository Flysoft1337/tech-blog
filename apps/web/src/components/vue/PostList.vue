<template>
  <div>
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button :class="['tab', { active: filter === '' }]" @click="setFilter('')">{{ t("admin.all") }}</button>
        <button :class="['tab', { active: filter === 'published' }]" @click="setFilter('published')">{{ t("admin.published") }}</button>
        <button :class="['tab', { active: filter === 'draft' }]" @click="setFilter('draft')">{{ t("admin.drafts") }}</button>
      </div>
      <div class="search-box">
        <input v-model="searchQuery" type="search" :placeholder="t('admin.searchPosts')" @input="debouncedSearch" @keyup.enter="loadData" />
      </div>
    </div>

    <!-- Bulk actions bar -->
    <div v-if="selectedIds.size > 0" class="bulk-bar">
      <span>{{ t("admin.selected", { count: selectedIds.size }) }}</span>
      <button class="btn" style="font-size:0.75rem; color:#059669" @click="bulkAction('published')">{{ t("admin.publish") }}</button>
      <button class="btn" style="font-size:0.75rem; color:#d97706" @click="bulkAction('draft')">{{ t("admin.setDraft") }}</button>
      <button class="btn" style="font-size:0.75rem; color:#dc2626" @click="bulkDelete">{{ t("admin.delete") }}</button>
      <button class="btn" style="font-size:0.75rem" @click="selectedIds.clear()">{{ t("admin.cancelBtn") }}</button>
    </div>

    <!-- Table -->
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width:36px"><input type="checkbox" :checked="allChecked" @change="toggleAll" /></th>
          <th>{{ t("admin.title") }}</th>
          <th>{{ t("admin.status") }}</th>
          <th>{{ t("admin.category") }}</th>
          <th>{{ t("admin.author") }}</th>
          <th>{{ t("admin.created") }}</th>
          <th>{{ t("admin.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 5" :key="n" class="skeleton-row">
            <td><div class="skeleton" style="width:16px;height:16px"></div></td>
            <td><div class="skeleton" style="width:60%"></div></td>
            <td><div class="skeleton" style="width:50px"></div></td>
            <td><div class="skeleton" style="width:60px"></div></td>
            <td><div class="skeleton" style="width:50px"></div></td>
            <td><div class="skeleton" style="width:70px"></div></td>
            <td><div class="skeleton" style="width:80px"></div></td>
          </tr>
        </template>
        <tr v-else-if="items.length === 0">
          <td colspan="7" style="text-align:center">{{ t("admin.noPosts") }}</td>
        </tr>
        <tr v-for="item in items" :key="item.id" :class="{ 'row-selected': selectedIds.has(item.id) }">
          <td><input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" /></td>
          <td>
            <a :href="`/admin/posts/${item.id}`" style="font-weight:500">{{ item.title }}</a>
            <div v-if="item.pinned" style="font-size:0.7rem; color:var(--color-primary)">{{ t("post.pinned") }}</div>
          </td>
          <td><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
          <td>{{ item.categoryName || '-' }}</td>
          <td>{{ item.authorName || '-' }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>
            <div style="display:flex; gap:0.5rem">
              <a :href="`/post/${item.slug}`" target="_blank" class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem">{{ t("admin.view") }}</a>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deletePost(item.id)">{{ t("admin.delete") }}</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-if="page > 1" class="btn" @click="page--; loadData()">{{ t("admin.prev") }}</button>
      <span style="font-size:0.875rem; padding:0.375rem 0.5rem">{{ page }} / {{ totalPages }}</span>
      <button v-if="page < totalPages" class="btn" @click="page++; loadData()">{{ t("admin.next") }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { t } from "../../i18n/index";

const items = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const filter = ref("");
const searchQuery = ref("");
const selectedIds = ref<Set<number>>(new Set());

let searchTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 400);
}

const allChecked = computed(() =>
  items.value.length > 0 && items.value.every(i => selectedIds.value.has(i.id))
);

function toggleAll() {
  if (allChecked.value) {
    selectedIds.value.clear();
  } else {
    for (const item of items.value) selectedIds.value.add(item.id);
  }
}

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("zh-CN");
}

function setFilter(status: string) {
  filter.value = status;
  page.value = 1;
  loadData();
}

async function loadData() {
  loading.value = true;
  selectedIds.value.clear();
  try {
    const params = new URLSearchParams({ page: String(page.value), pageSize: "20" });
    if (filter.value) params.set("status", filter.value);
    if (searchQuery.value) params.set("q", searchQuery.value);

    const res = await fetch(`/api/v1/admin/posts?${params}`, { headers: getHeaders() });
    const data = await res.json();
    if (data.success) {
      items.value = data.data.items;
      totalPages.value = data.data.totalPages;
    }
  } catch {}
  loading.value = false;
}

async function deletePost(id: number) {
  if (!confirm(t("admin.deletePost"))) return;
  try {
    await fetch(`/api/v1/admin/posts/${id}`, { method: "DELETE", headers: getHeaders() });
    loadData();
  } catch {}
}

async function bulkAction(status: string) {
  const ids = Array.from(selectedIds.value);
  if (!confirm(t("admin.bulkPublish", { count: ids.length, status }))) return;
  try {
    await Promise.all(ids.map(id =>
      fetch(`/api/v1/admin/posts/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })
    ));
    if (typeof window.showToast === "function") window.showToast(t("admin.postsUpdated", { count: ids.length }));
    loadData();
  } catch {}
}

async function bulkDelete() {
  const ids = Array.from(selectedIds.value);
  if (!confirm(t("admin.bulkDeletePosts", { count: ids.length }))) return;
  try {
    await Promise.all(ids.map(id =>
      fetch(`/api/v1/admin/posts/${id}`, { method: "DELETE", headers: getHeaders() })
    ));
    if (typeof window.showToast === "function") window.showToast(t("admin.postsDeleted", { count: ids.length }));
    loadData();
  } catch {}
}

onMounted(loadData);
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.filter-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.tab {
  padding: 0.4rem 0.85rem;
  border: none;
  background: var(--color-bg);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid var(--color-border);
}
.tab:last-child {
  border-right: none;
}
.tab.active {
  background: var(--color-primary);
  color: white;
}
.tab:not(.active):hover {
  background: var(--color-bg-secondary);
}
.search-box input {
  width: 220px;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.85rem;
}
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.85rem;
}
.row-selected {
  background: rgba(37, 99, 235, 0.05);
}
.skeleton {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-row td {
  padding: 0.75rem 0.5rem;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>

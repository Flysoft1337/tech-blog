<template>
  <div>
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button :class="['tab', { active: filter === '' }]" @click="setFilter('')">All</button>
        <button :class="['tab', { active: filter === 'published' }]" @click="setFilter('published')">Published</button>
        <button :class="['tab', { active: filter === 'draft' }]" @click="setFilter('draft')">Drafts</button>
      </div>
      <div class="search-box">
        <input v-model="searchQuery" type="search" placeholder="Search posts..." @keyup.enter="loadData" />
      </div>
    </div>

    <!-- Table -->
    <table class="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Category</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5" style="text-align:center">Loading...</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td colspan="5" style="text-align:center">No posts found</td>
        </tr>
        <tr v-for="item in items" :key="item.id">
          <td>
            <a :href="`/admin/posts/${item.id}`" style="font-weight:500">{{ item.title }}</a>
            <div v-if="item.pinned" style="font-size:0.7rem; color:var(--color-primary)">📌 Pinned</div>
          </td>
          <td><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
          <td>{{ item.categoryId || '-' }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>
            <div style="display:flex; gap:0.5rem">
              <a :href="`/post/${item.slug}`" target="_blank" class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem">View</a>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deletePost(item.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-if="page > 1" class="btn" @click="page--; loadData()">Prev</button>
      <span style="font-size:0.875rem; padding:0.375rem 0.5rem">{{ page }} / {{ totalPages }}</span>
      <button v-if="page < totalPages" class="btn" @click="page++; loadData()">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const items = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const filter = ref("");
const searchQuery = ref("");

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
  if (!confirm("Delete this post?")) return;
  try {
    await fetch(`/api/v1/admin/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
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
</style>

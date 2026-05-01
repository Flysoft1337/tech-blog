<template>
  <div>
    <div class="toolbar">
      <div class="filter-tabs">
        <button :class="['tab', { active: statusFilter === '' }]" @click="setFilter('')">
          {{ t("admin.all") }} <span v-if="counts.total" class="tab-count">{{ counts.total }}</span>
        </button>
        <button :class="['tab', { active: statusFilter === 'pending' }]" @click="setFilter('pending')">
          {{ t("admin.pending") }} <span v-if="counts.pending" class="tab-count pending">{{ counts.pending }}</span>
        </button>
        <button :class="['tab', { active: statusFilter === 'approved' }]" @click="setFilter('approved')">{{ t("admin.approved") }}</button>
        <button :class="['tab', { active: statusFilter === 'spam' }]" @click="setFilter('spam')">{{ t("admin.spam") }}</button>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <div v-if="selectedIds.size > 0" class="bulk-bar">
      <span>{{ t("admin.selected", { count: selectedIds.size }) }}</span>
      <button class="btn" style="font-size:0.75rem; color:#059669" @click="bulkStatus('approved')">{{ t("admin.approve") }}</button>
      <button class="btn" style="font-size:0.75rem; color:#d97706" @click="bulkStatus('spam')">{{ t("admin.markSpam") }}</button>
      <button class="btn" style="font-size:0.75rem; color:#dc2626" @click="bulkDelete">{{ t("admin.delete") }}</button>
      <button class="btn" style="font-size:0.75rem" @click="selectedIds.clear()">{{ t("admin.cancelBtn") }}</button>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th style="width:36px"><input type="checkbox" :checked="allChecked" @change="toggleAll" /></th>
          <th>{{ t("admin.author") }}</th>
          <th>{{ t("admin.commentCol") }}</th>
          <th>{{ t("admin.postCol") }}</th>
          <th>{{ t("admin.status") }}</th>
          <th>{{ t("admin.date") }}</th>
          <th>{{ t("admin.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 5" :key="n" class="skeleton-row">
            <td><div class="skeleton" style="width:16px;height:16px"></div></td>
            <td><div class="skeleton" style="width:80px"></div><div class="skeleton" style="width:100px;margin-top:4px"></div></td>
            <td><div class="skeleton" style="width:90%"></div></td>
            <td><div class="skeleton" style="width:80px"></div></td>
            <td><div class="skeleton" style="width:50px"></div></td>
            <td><div class="skeleton" style="width:60px"></div></td>
            <td><div class="skeleton" style="width:100px"></div></td>
          </tr>
        </template>
        <tr v-else-if="items.length === 0">
          <td colspan="7" style="text-align:center">{{ t("admin.noComments") }}</td>
        </tr>
        <tr v-for="item in items" :key="item.id" :class="{ 'row-selected': selectedIds.has(item.id) }">
          <td><input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" /></td>
          <td>
            <div style="font-weight:500">{{ item.authorName }}</div>
            <div style="font-size:0.75rem; color:var(--color-text-secondary)">{{ item.authorEmail }}</div>
          </td>
          <td style="max-width:300px">
            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">{{ item.content }}</div>
          </td>
          <td>
            <a v-if="item.postSlug" :href="`/post/${item.postSlug}`" target="_blank" style="font-size:0.85rem">
              {{ item.postTitle }}
            </a>
            <span v-else>-</span>
          </td>
          <td><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
          <td style="font-size:0.85rem; white-space:nowrap">{{ formatDate(item.createdAt) }}</td>
          <td>
            <div style="display:flex; gap:0.35rem; flex-wrap:nowrap">
              <button v-if="item.status !== 'approved'" class="btn"
                style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#059669"
                @click="updateStatus(item.id, 'approved')">{{ t("admin.approve") }}</button>
              <button v-if="item.status !== 'spam'" class="btn"
                style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#d97706"
                @click="updateStatus(item.id, 'spam')">{{ t("admin.markSpam") }}</button>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deleteComment(item.id)">{{ t("admin.delete") }}</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

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
const statusFilter = ref("");
const counts = ref({ total: 0, pending: 0 });
const selectedIds = ref<Set<number>>(new Set());

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
  statusFilter.value = status;
  page.value = 1;
  loadData();
}

async function loadData() {
  loading.value = true;
  selectedIds.value.clear();
  try {
    const params = new URLSearchParams({ page: String(page.value), pageSize: "20" });
    if (statusFilter.value) params.set("status", statusFilter.value);

    const res = await fetch(`/api/v1/admin/comments?${params}`, { headers: getHeaders() });
    const data = await res.json();
    if (data.success) {
      items.value = data.data.items;
      totalPages.value = data.data.totalPages;
      counts.value.total = data.data.total;
    }

    if (!statusFilter.value) {
      const pendingRes = await fetch("/api/v1/admin/comments?status=pending&pageSize=1", { headers: getHeaders() });
      const pendingData = await pendingRes.json();
      if (pendingData.success) counts.value.pending = pendingData.data.total;
    }
  } catch {}
  loading.value = false;
}

async function updateStatus(id: number, status: string) {
  try {
    await fetch(`/api/v1/admin/comments/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (typeof window.showToast === "function") window.showToast(t("admin.commentUpdated", { status }));
    loadData();
  } catch {}
}

async function deleteComment(id: number) {
  if (!confirm(t("admin.deleteComment"))) return;
  try {
    await fetch(`/api/v1/admin/comments/${id}`, { method: "DELETE", headers: getHeaders() });
    loadData();
  } catch {}
}

async function bulkStatus(status: string) {
  const ids = Array.from(selectedIds.value);
  if (!confirm(t("admin.bulkApprove", { count: ids.length, status }))) return;
  try {
    await Promise.all(ids.map(id =>
      fetch(`/api/v1/admin/comments/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })
    ));
    if (typeof window.showToast === "function") window.showToast(t("admin.commentsUpdated", { count: ids.length }));
    loadData();
  } catch {}
}

async function bulkDelete() {
  const ids = Array.from(selectedIds.value);
  if (!confirm(t("admin.bulkDeleteComments", { count: ids.length }))) return;
  try {
    await Promise.all(ids.map(id =>
      fetch(`/api/v1/admin/comments/${id}`, { method: "DELETE", headers: getHeaders() })
    ));
    if (typeof window.showToast === "function") window.showToast(t("admin.commentsDeleted", { count: ids.length }));
    loadData();
  } catch {}
}

onMounted(loadData);
</script>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.35rem;
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
.tab-count {
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: 10px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}
.tab.active .tab-count {
  background: rgba(255,255,255,0.2);
  color: white;
}
.tab-count.pending {
  background: #fef3c7;
  color: #92400e;
}
.tab.active .tab-count.pending {
  background: rgba(255,255,255,0.2);
  color: white;
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

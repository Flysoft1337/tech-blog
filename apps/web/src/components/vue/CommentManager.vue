<template>
  <div>
    <div class="toolbar">
      <div class="filter-tabs">
        <button :class="['tab', { active: statusFilter === '' }]" @click="setFilter('')">
          All <span v-if="counts.total" class="tab-count">{{ counts.total }}</span>
        </button>
        <button :class="['tab', { active: statusFilter === 'pending' }]" @click="setFilter('pending')">
          Pending <span v-if="counts.pending" class="tab-count pending">{{ counts.pending }}</span>
        </button>
        <button :class="['tab', { active: statusFilter === 'approved' }]" @click="setFilter('approved')">Approved</button>
        <button :class="['tab', { active: statusFilter === 'spam' }]" @click="setFilter('spam')">Spam</button>
      </div>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>Author</th>
          <th>Comment</th>
          <th>Post</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" style="text-align:center">Loading...</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td colspan="6" style="text-align:center">No comments</td>
        </tr>
        <tr v-for="item in items" :key="item.id">
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
                @click="updateStatus(item.id, 'approved')">Approve</button>
              <button v-if="item.status !== 'spam'" class="btn"
                style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#d97706"
                @click="updateStatus(item.id, 'spam')">Spam</button>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deleteComment(item.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

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
const statusFilter = ref("");
const counts = ref({ total: 0, pending: 0 });

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
    if (typeof window.showToast === "function") window.showToast(`Comment ${status}!`);
    loadData();
  } catch {}
}

async function deleteComment(id: number) {
  if (!confirm("Delete this comment?")) return;
  try {
    await fetch(`/api/v1/admin/comments/${id}`, {
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
</style>

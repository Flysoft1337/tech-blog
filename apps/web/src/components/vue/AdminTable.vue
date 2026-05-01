<template>
  <div>
    <!-- Create form -->
    <div v-if="createFields && createFields.length > 0" class="admin-card" style="margin-bottom:1rem">
      <form @submit.prevent="createItem" style="display:flex; gap:0.75rem; align-items:flex-end; flex-wrap:wrap">
        <div v-for="field in createFields" :key="field.key" class="form-group" style="margin-bottom:0; flex:1; min-width:150px">
          <label>{{ field.label }}</label>
          <input v-model="newItem[field.key]" :required="field.required" :placeholder="field.label" />
        </div>
        <button type="submit" class="btn btn-primary">Add</button>
      </form>
    </div>

    <!-- Table -->
    <table class="admin-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + 1" style="text-align:center">Loading...</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td :colspan="columns.length + 1" style="text-align:center">No data</td>
        </tr>
        <tr v-for="item in items" :key="item.id">
          <td v-for="col in columns" :key="col.key">
            <span v-if="col.type === 'badge'" :class="`badge badge-${item[col.key]}`">{{ item[col.key] }}</span>
            <span v-else-if="col.type === 'date'">{{ formatDate(item[col.key]) }}</span>
            <a v-else-if="editPath" :href="`${editPath}/${item.id}`">{{ item[col.key] }}</a>
            <span v-else>{{ item[col.key] }}</span>
          </td>
          <td>
            <div style="display:flex; gap:0.5rem">
              <template v-if="actions?.includes('approve')">
                <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem"
                  @click="updateStatus(item.id, 'approved')">Approve</button>
              </template>
              <template v-if="actions?.includes('spam')">
                <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem"
                  @click="updateStatus(item.id, 'spam')">Spam</button>
              </template>
              <button v-if="createFields && createFields.length > 0" class="btn"
                style="font-size:0.75rem; padding:0.25rem 0.5rem"
                @click="openEdit(item)">Edit</button>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deleteItem(item.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-if="page > 1" class="btn" @click="page--; loadData()">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button v-if="page < totalPages" class="btn" @click="page++; loadData()">Next</button>
    </div>

    <!-- Edit modal -->
    <div v-if="editItem" class="modal-overlay" @click.self="editItem = null">
      <div class="modal-card">
        <h3>Edit</h3>
        <form @submit.prevent="saveEdit">
          <div v-for="field in createFields" :key="field.key" class="form-group">
            <label>{{ field.label }}</label>
            <input v-model="editForm[field.key]" :required="field.required" />
          </div>
          <div style="display:flex; gap:0.5rem; justify-content:flex-end">
            <button type="button" class="btn" @click="editItem = null">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Column {
  key: string;
  label: string;
  type?: "badge" | "date";
}

interface CreateField {
  key: string;
  label: string;
  required?: boolean;
}

const props = defineProps<{
  endpoint: string;
  columns: Column[];
  editPath?: string;
  createFields?: CreateField[];
  actions?: string[];
}>();

const items = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const newItem = ref<Record<string, string>>({});
const editItem = ref<any>(null);
const editForm = ref<Record<string, string>>({});

function getHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("zh-CN");
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetch(`${props.endpoint}?page=${page.value}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.data)) {
        items.value = data.data;
        totalPages.value = 1;
      } else {
        items.value = data.data.items;
        totalPages.value = data.data.totalPages;
      }
    }
  } catch {}
  loading.value = false;
}

async function createItem() {
  try {
    const res = await fetch(props.endpoint, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newItem.value),
    });
    const data = await res.json();
    if (data.success) {
      newItem.value = {};
      if (typeof window.showToast === "function") window.showToast("Created!");
      loadData();
    } else {
      if (typeof window.showToast === "function") window.showToast(data.error || "Failed", "error");
    }
  } catch {}
}

async function deleteItem(id: number) {
  if (!confirm("Are you sure?")) return;
  try {
    await fetch(`${props.endpoint}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (typeof window.showToast === "function") window.showToast("Deleted!");
    loadData();
  } catch {}
}

async function updateStatus(id: number, status: string) {
  try {
    await fetch(`${props.endpoint}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (typeof window.showToast === "function") window.showToast("Updated!");
    loadData();
  } catch {}
}

function openEdit(item: any) {
  editItem.value = item;
  const form: Record<string, string> = {};
  for (const field of props.createFields || []) {
    form[field.key] = item[field.key] || "";
  }
  editForm.value = form;
}

async function saveEdit() {
  try {
    const res = await fetch(`${props.endpoint}/${editItem.value.id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(editForm.value),
    });
    const data = await res.json();
    if (data.success) {
      editItem.value = null;
      if (typeof window.showToast === "function") window.showToast("Updated!");
      loadData();
    } else {
      if (typeof window.showToast === "function") window.showToast(data.error || "Failed", "error");
    }
  } catch {}
}

onMounted(loadData);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.modal-card h3 {
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
</style>

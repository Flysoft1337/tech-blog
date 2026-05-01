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
      loadData();
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
    loadData();
  } catch {}
}

onMounted(loadData);
</script>

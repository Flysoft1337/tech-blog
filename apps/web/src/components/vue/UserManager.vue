<template>
  <div>
    <!-- Create user form -->
    <div class="admin-card" style="margin-bottom:1.5rem">
      <h3 style="margin-bottom:1rem">{{ t("admin.addUser") }}</h3>
      <form @submit.prevent="createUser" style="display:flex; gap:0.75rem; align-items:flex-end; flex-wrap:wrap">
        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px">
          <label>{{ t("admin.email") }}</label>
          <input v-model="newUser.email" type="email" required placeholder="user@example.com" />
        </div>
        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px">
          <label>{{ t("admin.displayName") }}</label>
          <input v-model="newUser.displayName" required placeholder="Name" />
        </div>
        <div class="form-group" style="margin-bottom:0; flex:1; min-width:120px">
          <label>{{ t("admin.password") }}</label>
          <input v-model="newUser.password" type="password" required placeholder="Password" />
        </div>
        <div class="form-group" style="margin-bottom:0; min-width:100px">
          <label>{{ t("admin.role") }}</label>
          <select v-model="newUser.role">
            <option value="editor">{{ t("admin.editor") }}</option>
            <option value="admin">{{ t("admin.adminRole") }}</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">{{ t("admin.add") }}</button>
      </form>
    </div>

    <!-- Users table -->
    <table class="admin-table">
      <thead>
        <tr>
          <th>{{ t("admin.name") }}</th>
          <th>{{ t("admin.email") }}</th>
          <th>{{ t("admin.role") }}</th>
          <th>{{ t("admin.created") }}</th>
          <th>{{ t("admin.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5" style="text-align:center">{{ t("admin.loading") }}</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td colspan="5" style="text-align:center">{{ t("admin.noUsers") }}</td>
        </tr>
        <tr v-for="user in items" :key="user.id">
          <td>{{ user.displayName }}</td>
          <td>{{ user.email }}</td>
          <td><span :class="`badge badge-${user.role === 'admin' ? 'published' : 'draft'}`">{{ user.role }}</span></td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td>
            <div style="display:flex; gap:0.5rem">
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem"
                @click="openEdit(user)">{{ t("admin.edit") }}</button>
              <button class="btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#dc2626"
                @click="deleteUser(user.id)">{{ t("admin.delete") }}</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit modal -->
    <div v-if="editUser" class="modal-overlay" @click.self="editUser = null">
      <div class="modal-card">
        <h3>{{ t("admin.editUser") }}</h3>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label>{{ t("admin.displayName") }}</label>
            <input v-model="editForm.displayName" required />
          </div>
          <div class="form-group">
            <label>{{ t("admin.role") }}</label>
            <select v-model="editForm.role">
              <option value="editor">{{ t("admin.editor") }}</option>
              <option value="admin">{{ t("admin.adminRole") }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t("admin.newPassword") }}</label>
            <input v-model="editForm.password" type="password" placeholder="••••••" />
          </div>
          <div style="display:flex; gap:0.5rem; justify-content:flex-end">
            <button type="button" class="btn" @click="editUser = null">{{ t("admin.cancelBtn") }}</button>
            <button type="submit" class="btn btn-primary">{{ t("admin.save") }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { t } from "../../i18n/index";

const items = ref<any[]>([]);
const loading = ref(true);
const editUser = ref<any>(null);
const editForm = ref({ displayName: "", role: "editor", password: "" });
const newUser = ref({ email: "", displayName: "", password: "", role: "editor" });

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

async function loadData() {
  loading.value = true;
  try {
    const res = await fetch("/api/v1/admin/users", { headers: getHeaders() });
    const data = await res.json();
    if (data.success) items.value = data.data;
  } catch {}
  loading.value = false;
}

async function createUser() {
  try {
    const res = await fetch("/api/v1/admin/users", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newUser.value),
    });
    const data = await res.json();
    if (data.success) {
      newUser.value = { email: "", displayName: "", password: "", role: "editor" };
      if (typeof window.showToast === "function") window.showToast(t("admin.userCreated"));
      loadData();
    } else {
      if (typeof window.showToast === "function") window.showToast(data.error || t("admin.userCreateFailed"), "error");
    }
  } catch {}
}

function openEdit(user: any) {
  editUser.value = user;
  editForm.value = { displayName: user.displayName, role: user.role, password: "" };
}

async function saveEdit() {
  const body: Record<string, string> = {
    displayName: editForm.value.displayName,
    role: editForm.value.role,
  };
  if (editForm.value.password) body.password = editForm.value.password;

  try {
    const res = await fetch(`/api/v1/admin/users/${editUser.value.id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      editUser.value = null;
      if (typeof window.showToast === "function") window.showToast(t("admin.userUpdated"));
      loadData();
    } else {
      if (typeof window.showToast === "function") window.showToast(data.error || t("admin.userUpdateFailed"), "error");
    }
  } catch {}
}

async function deleteUser(id: number) {
  if (!confirm(t("admin.deleteUser"))) return;
  try {
    const res = await fetch(`/api/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      if (typeof window.showToast === "function") window.showToast(t("admin.userDeleted"));
      loadData();
    } else {
      if (typeof window.showToast === "function") window.showToast(data.error || t("admin.userDeleteFailed"), "error");
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
  background: var(--color-bg);
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

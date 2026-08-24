<template>
  <div class="users-page">
    <AdminAppHeader />

    <main>
      <section class="hero-section">
        <div class="hero-container">
          <div>
            <div class="page-badge">
              <span />
              GESTIÓN DE USUARIOS
            </div>

            <h1>
              Administra tu
              <strong>comunidad.</strong>
            </h1>

            <p>
              Consulta los usuarios registrados, modifica sus roles
              y controla el estado de sus cuentas.
            </p>
          </div>

          <div class="hero-summary">
            <span>Usuarios registrados</span>

            <strong>
              {{ users.length }}
            </strong>

            <small>
              {{ activeUsers }} cuentas activas
            </small>
          </div>
        </div>
      </section>

      <section class="users-section">
        <div class="container">
          <header class="section-header">
            <div>
              <span>
                ADMINISTRACIÓN
              </span>

              <h2>
                Usuarios
                <strong>registrados.</strong>
              </h2>
            </div>

            <p>
              Cambia el rol de los usuarios o activa y desactiva
              sus cuentas cuando sea necesario.
            </p>
          </header>

          <div class="toolbar">
            <div class="search-field">
              <span aria-hidden="true">
                ⌕
              </span>

              <input
                v-model.trim="searchQuery"
                type="search"
                placeholder="Buscar por nombre o correo..."
                aria-label="Buscar usuarios"
              >
            </div>

            <button
              class="refresh-button"
              type="button"
              :disabled="isLoading"
              @click="loadUsers"
            >
              {{ isLoading ? "Actualizando..." : "Actualizar" }}
            </button>
          </div>

          <div
            v-if="message"
            class="message"
            :class="messageType"
            role="status"
          >
            <span aria-hidden="true">
              {{ messageType === "success" ? "✓" : "!" }}
            </span>

            <p>
              {{ message }}
            </p>
          </div>

          <div
            v-if="isLoading"
            class="loading-state"
          >
            <div class="loader" />

            <p>
              Cargando usuarios...
            </p>
          </div>

          <div
            v-else-if="filteredUsers.length === 0"
            class="empty-state"
          >
            <span aria-hidden="true">
              ⌕
            </span>

            <h3>
              No se encontraron usuarios
            </h3>

            <p>
              Intenta utilizar otro nombre o correo electrónico.
            </p>
          </div>

          <div
            v-else
            class="table-container"
          >
            <table class="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                >
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">
                        <img
                          v-if="user.profilePicture"
                          :src="user.profilePicture"
                          alt="Foto de perfil"
                        >

                        <span v-else>
                          {{ getUserInitial(user) }}
                        </span>
                      </div>

                      <div class="user-name">
                        <strong>
                          {{ user.firstName }}
                          {{ user.lastName }}
                        </strong>

                        <small>
                          {{ user.id }}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class="email">
                      {{ user.email }}
                    </span>
                  </td>

                  <td>
                    <select
                      class="role-select"
                      :value="user.role"
                      :disabled="updatingUserId === user.id"
                      @change="handleRoleChange(user, $event)"
                    >
                      <option value="user">
                        Usuario
                      </option>

                      <option value="organizer">
                        Organizador
                      </option>

                      <option value="admin">
                        Administrador
                      </option>
                    </select>
                  </td>

                  <td>
                    <span
                      class="status"
                      :class="{
                        active: user.isActive,
                        inactive: !user.isActive
                      }"
                    >
                      <span />

                      {{ user.isActive ? "Activo" : "Inactivo" }}
                    </span>
                  </td>

                  <td>
                    <button
                      class="status-button"
                      :class="{
                        deactivate: user.isActive,
                        activate: !user.isActive
                      }"
                      type="button"
                      :disabled="updatingUserId === user.id"
                      @click="handleStatusChange(user)"
                    >
                      {{
                        updatingUserId === user.id
                          ? "Guardando..."
                          : user.isActive
                            ? "Desactivar"
                            : "Activar"
                      }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="!isLoading && users.length > 0"
            class="table-footer"
          >
            <p>
              Mostrando
              <strong>{{ filteredUsers.length }}</strong>
              de
              <strong>{{ users.length }}</strong>
              usuarios.
            </p>
          </div>
        </div>
      </section>
    </main>

    <AdminAppFooter />
  </div>
</template>

<script setup lang="ts">
import {
  adminService,
  type AdminUser
} from "~/services/adminService"

type UserRole = "admin" | "organizer" | "user"

definePageMeta({
  middleware: "auth"
})

const users = ref<AdminUser[]>([])
const searchQuery = ref("")
const isLoading = ref(false)
const updatingUserId = ref<string | null>(null)
const message = ref("")
const messageType = ref<"success" | "error">("success")

const activeUsers = computed(() => {
  return users.value.filter(
    user => user.isActive
  ).length
})

const filteredUsers = computed(() => {
  const search = searchQuery.value
    .trim()
    .toLowerCase()

  if (!search) {
    return users.value
  }

  return users.value.filter(user => {
    const fullName =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()

    return (
      fullName.includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    )
  })
})

function getUserInitial(user: AdminUser) {
  return (
    user.firstName
      ?.charAt(0)
      .toUpperCase() || "U"
  )
}

async function loadUsers() {
  isLoading.value = true
  message.value = ""

  try {
    const response =
      await adminService.getUsers()

    users.value =
      response.data.users
  } catch (error: any) {
    messageType.value = "error"

    message.value =
      error?.data?.message ||
      "No fue posible obtener los usuarios."
  } finally {
    isLoading.value = false
  }
}

async function handleRoleChange(
  user: AdminUser,
  event: Event
) {
  const select =
    event.target as HTMLSelectElement

  const previousRole =
    user.role as UserRole

  const newRole =
    select.value as UserRole

  if (newRole === previousRole) {
    return
  }

  updatingUserId.value = user.id
  message.value = ""

  try {
    const response =
      await adminService.updateUserRole(
        user.id,
        newRole
      )

    Object.assign(
      user,
      response.data.user
    )

    messageType.value = "success"

    message.value =
      `El rol de ${user.firstName} se actualizó correctamente.`
  } catch (error: any) {
    select.value = previousRole

    messageType.value = "error"

    message.value =
      error?.data?.message ||
      "No fue posible cambiar el rol del usuario."
  } finally {
    updatingUserId.value = null
  }
}

async function handleStatusChange(
  user: AdminUser
) {
  updatingUserId.value = user.id
  message.value = ""

  try {
    const newStatus =
      !user.isActive

    const response =
      await adminService.updateUserStatus(
        user.id,
        newStatus
      )

    Object.assign(
      user,
      response.data.user
    )

    messageType.value = "success"

    message.value =
      newStatus
        ? `La cuenta de ${user.firstName} fue activada correctamente.`
        : `La cuenta de ${user.firstName} fue desactivada correctamente.`
  } catch (error: any) {
    messageType.value = "error"

    message.value =
      error?.data?.message ||
      "No fue posible actualizar el estado del usuario."
  } finally {
    updatingUserId.value = null
  }
}

onMounted(() => {
  loadUsers()
})

useHead({
  title: "Gestión de usuarios | CommunityHub"
})
</script>

<style scoped>
:global(html),
:global(body),
:global(#__nuxt) {
  width: 100%;
  min-width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
}

:global(body) {
  overflow-x: hidden;
  background: #f4f2f8;
}

* {
  box-sizing: border-box;
}

.users-page {
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;
  --gray-background: #f4f2f8;
  --gray-border: #ddd8e7;
  --gray-text: #716b7d;
  --text-dark: #17131f;

  min-height: 100vh;
  font-family: Inter, Arial, Helvetica, sans-serif;
  color: var(--text-dark);
  background: var(--gray-background);
}

.hero-section {
  color: var(--white);
  background:
    radial-gradient(
      circle at 88% 10%,
      rgba(124, 58, 237, 0.25),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #09090b,
      #1d1031
    );
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 60px;
  align-items: center;
  width: min(1200px, calc(100% - 48px));
  min-height: 340px;
  margin: auto;
  padding: 55px 0;
}

.page-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 13px;
  margin-bottom: 20px;
  font-size: 9px;
  font-weight: 900;
  color: #ddd6fe;
  letter-spacing: 1.4px;
  border: 1px solid rgba(167, 139, 250, 0.23);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.11);
}

.page-badge span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--purple-light);
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.8);
}

.hero-container h1 {
  max-width: 700px;
  margin: 0;
  font-size: clamp(42px, 5vw, 62px);
  line-height: 1;
  letter-spacing: -2px;
}

.hero-container h1 strong {
  display: block;
  color: var(--purple-light);
}

.hero-container > div > p {
  max-width: 600px;
  margin: 22px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #aaa3b2;
}

.hero-summary {
  padding: 25px;
  border: 1px solid rgba(167, 139, 250, 0.22);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.07);
}

.hero-summary span,
.hero-summary small,
.hero-summary strong {
  display: block;
}

.hero-summary span {
  font-size: 9px;
  font-weight: 800;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-summary strong {
  margin: 9px 0 4px;
  font-size: 42px;
}

.hero-summary small {
  font-size: 10px;
  color: #aaa3b2;
}

.container {
  width: min(1200px, calc(100% - 48px));
  margin: auto;
  padding: 70px 0 90px;
}

.section-header {
  display: flex;
  gap: 40px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-header > div > span {
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  letter-spacing: 1.6px;
}

.section-header h2 {
  margin: 10px 0 0;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -1.5px;
}

.section-header h2 strong {
  color: var(--purple);
}

.section-header > p {
  max-width: 360px;
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: var(--gray-text);
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-field {
  position: relative;
  flex: 1;
}

.search-field span {
  position: absolute;
  top: 50%;
  left: 16px;
  font-size: 18px;
  color: var(--purple);
  transform: translateY(-50%);
}

.search-field input {
  width: 100%;
  min-height: 52px;
  padding: 12px 16px 12px 47px;
  font: inherit;
  font-size: 12px;
  color: var(--text-dark);
  outline: none;
  border: 1px solid var(--gray-border);
  border-radius: 13px;
  background: var(--white);
}

.search-field input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

.refresh-button {
  min-width: 125px;
  padding: 12px 18px;
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  cursor: pointer;
  border: 0;
  border-radius: 12px;
  background: var(--purple);
}

.refresh-button:hover:not(:disabled) {
  background: var(--purple-dark);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 13px 15px;
  margin-bottom: 18px;
  border-radius: 12px;
}

.message span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
}

.message p {
  margin: 0;
  font-size: 11px;
}

.message.success {
  color: #4c287d;
  border: 1px solid #d8cced;
  background: #f5f1fc;
}

.message.success span {
  background: var(--purple);
}

.message.error {
  color: #8a2d3c;
  border: 1px solid #eccbd1;
  background: #fff4f5;
}

.message.error span {
  background: #b93d52;
}

.table-container {
  overflow-x: auto;
  border: 1px solid var(--gray-border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 35px rgba(33, 21, 50, 0.06);
}

.users-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.users-table th {
  padding: 15px 18px;
  font-size: 9px;
  font-weight: 900;
  color: #88818f;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #faf9fc;
}

.users-table td {
  padding: 16px 18px;
  border-top: 1px solid #eeeaf2;
}

.users-table tbody tr {
  transition: background 160ms ease;
}

.users-table tbody tr:hover {
  background: #fcfaff;
}

.user-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  overflow: hidden;
  font-size: 14px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple-dark)
    );
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  display: grid;
  gap: 3px;
}

.user-name strong {
  font-size: 12px;
}

.user-name small {
  max-width: 150px;
  overflow: hidden;
  font-size: 8px;
  color: #aaa3b2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  font-size: 11px;
  color: var(--gray-text);
}

.role-select {
  min-width: 135px;
  padding: 9px 10px;
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dark);
  outline: none;
  cursor: pointer;
  border: 1px solid #d8d1e1;
  border-radius: 9px;
  background: var(--white);
}

.role-select:focus {
  border-color: var(--purple);
}

.status {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 7px 10px;
  font-size: 9px;
  font-weight: 800;
  border-radius: 999px;
}

.status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status.active {
  color: #4f3577;
  background: #f0eafd;
}

.status.active > span {
  background: var(--purple);
}

.status.inactive {
  color: #766f7d;
  background: #efedf1;
}

.status.inactive > span {
  background: #928b99;
}

.status-button {
  min-width: 100px;
  padding: 9px 12px;
  font: inherit;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 9px;
  transition: all 160ms ease;
}

.status-button.deactivate {
  color: #6b6670;
  border: 1px solid #d7d2db;
  background: var(--white);
}

.status-button.deactivate:hover:not(:disabled) {
  color: var(--white);
  border-color: #17131f;
  background: #17131f;
}

.status-button.activate {
  color: var(--white);
  border: 1px solid var(--purple);
  background: var(--purple);
}

.status-button.activate:hover:not(:disabled) {
  background: var(--purple-dark);
}

.status-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.table-footer {
  margin-top: 14px;
}

.table-footer p {
  margin: 0;
  font-size: 10px;
  color: var(--gray-text);
}

.loading-state,
.empty-state {
  display: grid;
  min-height: 280px;
  padding: 40px;
  text-align: center;
  place-items: center;
  border: 1px solid var(--gray-border);
  border-radius: 18px;
  background: var(--white);
}

.loading-state {
  align-content: center;
  gap: 14px;
}

.loading-state p,
.empty-state p {
  margin: 0;
  font-size: 11px;
  color: var(--gray-text);
}

.loader {
  width: 34px;
  height: 34px;
  border: 3px solid #e1d9ed;
  border-top-color: var(--purple);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.empty-state > span {
  font-size: 35px;
  color: var(--purple);
}

.empty-state h3 {
  margin: 8px 0 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-summary {
    max-width: 350px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-header > p {
    max-width: 500px;
  }
}

@media (max-width: 600px) {
  .hero-container,
  .container {
    width: calc(100% - 36px);
  }

  .hero-container {
    min-height: auto;
    padding: 45px 0;
  }

  .hero-container h1 {
    font-size: 42px;
  }

  .toolbar {
    flex-direction: column;
  }

  .refresh-button {
    min-height: 47px;
  }

  .container {
    padding: 55px 0 70px;
  }

  .section-header h2 {
    font-size: 34px;
  }
}
</style>
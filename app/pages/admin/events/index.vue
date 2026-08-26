<template>
  <div class="admin-events-page">
    <AdminAppHeader />

    <main>
    <section class="page-shell">
      <header class="page-header">
        <div class="brand">
          <div class="brand-icon" aria-hidden="true">C</div>
          <div>
            <p class="brand-subtitle">PLATAFORMA COMUNITARIA</p>
            <h1>CommunityHub</h1>
          </div>
        </div>

        <div class="header-text">
          <span class="section-label">Administración</span>
          <h2>Actividades</h2>
          <p>Gestioná todas las actividades registradas en la plataforma.</p>
        </div>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver las actividades tenés que iniciar sesión con tu cuenta.
            <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
          </p>
        </div>
      </div>

      <!-- Con sesión pero rol distinto de admin -->
      <div v-else-if="!isAdmin" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Esta sección es solo para administradores</strong>
          <p>
            Tu cuenta no tiene permisos de administrador, así que no podés
            ver ni gestionar las actividades desde acá.
          </p>
        </div>
      </div>

      <template v-else>
        <section class="panel">
          <header class="panel-header">
            <h3>Todas las actividades</h3>
            <span v-if="store.pagination" class="total-badge">
              {{ store.pagination.totalEvents }} actividades
            </span>
          </header>

          <div v-if="store.error" class="error-message">
            <span aria-hidden="true">!</span>
            <p>{{ store.error }}</p>
          </div>

          <div v-if="store.loading" class="loading-row">
            Cargando actividades...
          </div>

          <div
            v-else-if="!store.events.length && !store.error"
            class="empty-row"
          >
            No hay actividades registradas.
          </div>

          <div v-else class="event-list">
            <article
              v-for="event in store.events"
              :key="event.id"
              class="event-row"
            >
              <template v-if="editingId === event.id">
                <form class="event-form" @submit.prevent="handleSaveEdit(event.id)">
                  <div class="form-group">
                    <label>Título</label>
                    <input v-model.trim="editForm.title" type="text" required>
                  </div>

                  <div class="form-group span-2">
                    <label>Descripción</label>
                    <input v-model.trim="editForm.description" type="text" required>
                  </div>

                  <div class="form-group">
                    <label>Categoría</label>
                    <select v-model="editForm.category" required>
                      <option
                        v-for="category in categoriesStore.categories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Modalidad</label>
                    <select v-model="editForm.modality">
                      <option value="in-person">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="hybrid">Híbrida</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Fecha de inicio</label>
                    <input v-model="editForm.startDate" type="datetime-local" required>
                  </div>

                  <div class="form-group">
                    <label>Fecha de finalización</label>
                    <input v-model="editForm.endDate" type="datetime-local" required>
                  </div>

                  <div class="form-group">
                    <label>Cupos</label>
                    <input v-model.number="editForm.capacity" type="number" min="1" required>
                  </div>

                  <div class="form-group">
                    <label>Estado</label>
                    <select v-model="editForm.status">
                      <option value="draft">Borrador</option>
                      <option value="published">Publicada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="completed">Finalizada</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Lugar</label>
                    <input v-model.trim="editForm.locationName" type="text">
                  </div>

                  <div class="form-group">
                    <label>Dirección</label>
                    <input v-model.trim="editForm.locationAddress" type="text">
                  </div>

                  <div class="form-group">
                    <label>Enlace virtual</label>
                    <input v-model.trim="editForm.locationVirtualUrl" type="text">
                  </div>

                  <div class="form-group span-2">
                    <label>Imagen (URL)</label>
                    <input v-model.trim="editForm.imageUrl" type="text">
                  </div>

                  <div class="row-actions">
                    <button class="action-button save-button" type="submit" :disabled="savingEdit">
                      {{ savingEdit ? "Guardando..." : "Guardar" }}
                    </button>
                    <button class="action-button cancel-button" type="button" @click="cancelEdit">
                      Cancelar
                    </button>
                  </div>
                </form>
              </template>

              <template v-else>
                <div class="event-row-top">
                  <span class="category-pill">{{ categoryName(event.category) }}</span>
                  <span class="status-pill" :class="`is-${event.status}`">
                    {{ statusLabel(event.status) }}
                  </span>
                  <span v-if="!event.isActive" class="inactive-pill">Inactiva</span>
                </div>

                <h4>{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>

                <div class="event-meta">
                  <span>📅 {{ formatDate(event.startDate) }} — {{ formatDate(event.endDate) }}</span>
                  <span>📍 {{ modalityLabel(event.modality) }}</span>
                  <span>👥 {{ event.capacity }} cupos</span>
                </div>

                <div class="row-actions">
                  <button class="action-button edit-button" type="button" @click="startEdit(event)">
                    Editar
                  </button>
                  <button
                    v-if="event.isActive"
                    class="action-button delete-button"
                    type="button"
                    :disabled="deletingId === event.id"
                    @click="handleDelete(event)"
                  >
                    {{ deletingId === event.id ? "Eliminando..." : "Eliminar" }}
                  </button>
                  <button
                    v-else
                    class="action-button reactivate-button"
                    type="button"
                    :disabled="reactivatingId === event.id"
                    @click="handleReactivate(event)"
                  >
                    {{ reactivatingId === event.id ? "Reactivando..." : "Reactivar" }}
                  </button>
                </div>
              </template>
            </article>
          </div>
        </section>
      </template>
    </section>
    </main>

    <AdminAppFooter />
  </div>
</template>

<script setup lang="ts">
import { useEventsStore } from "~/stores/events"
import { useCategoriesStore } from "~/stores/categories"
import { useAuthStore } from "~/stores/auth"
import type { EventItem } from "~/types/event"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Actividades | Admin | CommunityHub"
})

const store = useEventsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === "admin")

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  cancelled: "Cancelada",
  completed: "Finalizada"
}

const modalityLabels: Record<string, string> = {
  "in-person": "Presencial",
  virtual: "Virtual",
  hybrid: "Híbrida"
}

function statusLabel(status: string) {
  return statusLabels[status] ?? status
}

function modalityLabel(modality: string) {
  return modalityLabels[modality] ?? modality
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

function categoryName(categoryId: string) {
  const category = categoriesStore.categories.find(item => item.id === categoryId)
  return category?.name ?? "Sin categoría"
}

function toDatetimeLocal(value: string) {
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function emptyForm() {
  return {
    title: "",
    description: "",
    category: "",
    modality: "in-person" as EventItem["modality"],
    startDate: "",
    endDate: "",
    capacity: 1,
    status: "draft" as EventItem["status"],
    locationName: "",
    locationAddress: "",
    locationVirtualUrl: "",
    imageUrl: ""
  }
}

const editingId = ref<string | null>(null)
const editForm = reactive(emptyForm())
const savingEdit = ref(false)
const deletingId = ref<string | null>(null)
const reactivatingId = ref<string | null>(null)

function buildPayload(form: ReturnType<typeof emptyForm>) {
  return {
    title: form.title,
    description: form.description,
    category: form.category,
    startDate: form.startDate,
    endDate: form.endDate,
    modality: form.modality,
    capacity: form.capacity,
    status: form.status,
    imageUrl: form.imageUrl || undefined,
    location: {
      name: form.locationName || undefined,
      address: form.locationAddress || undefined,
      virtualUrl: form.locationVirtualUrl || undefined
    }
  }
}

function startEdit(event: EventItem) {
  editingId.value = event.id
  editForm.title = event.title
  editForm.description = event.description
  editForm.category = event.category
  editForm.modality = event.modality
  editForm.startDate = toDatetimeLocal(event.startDate)
  editForm.endDate = toDatetimeLocal(event.endDate)
  editForm.capacity = event.capacity
  editForm.status = event.status
  editForm.locationName = event.location?.name ?? ""
  editForm.locationAddress = event.location?.address ?? ""
  editForm.locationVirtualUrl = event.location?.virtualUrl ?? ""
  editForm.imageUrl = event.imageUrl ?? ""
}

function cancelEdit() {
  editingId.value = null
}

async function handleSaveEdit(id: string) {
  savingEdit.value = true

  const result = await store.updateEvent(id, buildPayload(editForm))

  savingEdit.value = false

  if (result.success) {
    editingId.value = null
  } else {
    store.error = result.message
  }
}

async function handleDelete(event: EventItem) {
  const confirmed = confirm(
    `¿Seguro que querés eliminar la actividad "${event.title}"? Quedará marcada como inactiva.`
  )

  if (!confirmed) {
    return
  }

  deletingId.value = event.id

  const result = await store.deleteEvent(event.id)

  deletingId.value = null

  if (!result.success) {
    store.error = result.message
  }
}

async function handleReactivate(event: EventItem) {
  reactivatingId.value = event.id

  const result = await store.updateEvent(event.id, { isActive: true })

  reactivatingId.value = null

  if (!result.success) {
    store.error = result.message
  }
}

async function loadEvents() {
  await store.fetchEvents({})
}

onMounted(async () => {
  if (!authStore.isAuthenticated || !isAdmin.value) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100, includeInactive: true })
  await loadEvents()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-events-page {
  --black: #09090b;
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;
  --gray-background: #f3f1f7;
  --gray-border: #ddd8e7;
  --gray-text: #716b7d;
  --text-dark: #17131f;
  --red: #b91c1c;
  --red-soft: #fdeceb;
  --red-border: #f3c7c2;
  --green: #15803d;
  --green-soft: #eafbf1;
  --green-border: #bfe6cf;

  min-height: 100vh;
  font-family: Inter, Arial, Helvetica, sans-serif;
  background:
    radial-gradient(
      circle at 10% 15%,
      rgba(124, 58, 237, 0.12),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(124, 58, 237, 0.1),
      transparent 28%
    ),
    var(--gray-background);
}

.admin-events-page > main {
  padding: 40px 24px 60px;
}

.page-shell {
  width: min(960px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.page-header {
  display: grid;
  gap: 24px;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
}

.brand-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  font-size: 21px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 15px;
  background: linear-gradient(145deg, #8b5cf6, var(--purple));
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.25);
}

.brand-subtitle {
  margin: 0 0 3px;
  font-size: 10px;
  font-weight: 800;
  color: var(--purple-dark);
  letter-spacing: 1.7px;
}

.brand h1 {
  margin: 0;
  font-size: 18px;
  color: var(--black);
}

.header-text h2 {
  margin: 0 0 8px;
  font-size: 32px;
  color: var(--text-dark);
  letter-spacing: -1px;
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: var(--gray-text);
}

.section-label {
  display: inline-block;
  padding: 6px 11px;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 900;
  color: var(--purple-dark);
  text-transform: uppercase;
  letter-spacing: 1.6px;
  border-radius: 999px;
  background: var(--purple-soft);
}

.state-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid var(--gray-border);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 20px 50px rgba(24, 14, 40, 0.1);
}

.state-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: var(--purple);
}

.state-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  color: var(--text-dark);
}

.state-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-text);
}

.state-card code {
  padding: 1px 5px;
  font-size: 12px;
  border-radius: 5px;
  background: var(--purple-soft);
  color: var(--purple-dark);
}

.state-card a {
  color: var(--purple-dark);
  font-weight: 800;
  text-decoration: underline;
}

.panel {
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #fdfcff 100%);
  box-shadow: 0 24px 60px rgba(24, 14, 40, 0.12);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-dark);
  letter-spacing: -0.4px;
}

.total-badge {
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 800;
  color: var(--purple-dark);
  border-radius: 999px;
  background: var(--purple-soft);
}

.event-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group.span-2 {
  grid-column: span 2;
}

.form-group label {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-dark);
}

.form-group input,
.form-group select {
  width: 100%;
  min-height: 46px;
  padding: 10px 13px;
  font: inherit;
  font-size: 13px;
  color: var(--text-dark);
  outline: none;
  border: 1px solid var(--gray-border);
  border-radius: 12px;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
}

.error-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 13px 14px;
  margin-bottom: 16px;
  color: var(--red);
  border: 1px solid var(--red-border);
  border-radius: 13px;
  background: var(--red-soft);
}

.error-message span {
  display: grid;
  width: 21px;
  height: 21px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: var(--red);
}

.error-message p {
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.loading-row,
.empty-row {
  padding: 30px 0;
  font-size: 13px;
  color: var(--gray-text);
  text-align: center;
}

.event-list {
  display: grid;
  gap: 14px;
}

.event-row {
  padding: 18px 20px;
  border: 1px solid var(--gray-border);
  border-radius: 16px;
  background: var(--white);
}

.event-row-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.category-pill {
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 800;
  color: var(--purple-dark);
  border-radius: 999px;
  background: var(--purple-soft);
}

.status-pill {
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 800;
  border-radius: 999px;
  color: #77707f;
  background: #f0edf3;
}

.status-pill.is-published {
  color: var(--green);
  background: var(--green-soft);
}

.status-pill.is-cancelled {
  color: var(--red);
  background: var(--red-soft);
}

.inactive-pill {
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 800;
  color: var(--red);
  border-radius: 999px;
  background: var(--red-soft);
}

.event-row h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--text-dark);
}

.event-description {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-text);
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
  color: var(--gray-text);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px 14px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 9px;
  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.edit-button,
.save-button,
.cancel-button {
  color: var(--purple-dark);
  border: 1px solid #d5c8eb;
  background: var(--white);
}

.edit-button:hover:not(:disabled),
.save-button:hover:not(:disabled),
.cancel-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.delete-button {
  color: var(--red);
  border: 1px solid var(--red-border);
  background: var(--white);
}

.delete-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--red);
  background: var(--red);
}

.reactivate-button {
  color: var(--green);
  border: 1px solid var(--green-border);
  background: var(--white);
}

.reactivate-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--green);
  background: var(--green);
}

.event-form .row-actions {
  grid-column: span 2;
  margin-top: 6px;
}

@media (max-width: 640px) {
  .event-form {
    grid-template-columns: 1fr;
  }

  .form-group.span-2,
  .event-form .row-actions {
    grid-column: span 1;
  }
}
</style>

<template>
  <main class="my-activities-page">
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
          <span class="section-label">Organizador</span>
          <h2>Mis actividades</h2>
          <p>Creá y gestioná las actividades que organizás.</p>
        </div>
      </header>

      <!-- Sin token: no hay sesión iniciada -->
      <div v-if="!hasToken" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para gestionar tus actividades tenés que iniciar sesión con una
            cuenta de organizador. Pegá un token válido en
            <code>localStorage</code> (clave <code>token</code>) y recargá la
            página.
          </p>
        </div>
      </div>

      <!-- Con token pero rol distinto de organizer -->
      <div v-else-if="roleChecked && !isOrganizer" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Esta sección es solo para organizadores</strong>
          <p>
            Tu cuenta no tiene el rol de organizador, así que no podés crear
            ni gestionar actividades desde acá.
          </p>
        </div>
      </div>

      <template v-else-if="isOrganizer">
        <!-- Formulario de creación -->
        <section class="panel">
          <header class="panel-header">
            <h3>Nueva actividad</h3>
          </header>

          <form class="event-form" @submit.prevent="handleCreate">
            <div class="form-group">
              <label for="title">Título</label>
              <input
                id="title"
                v-model.trim="createForm.title"
                type="text"
                placeholder="Ej. Torneo de fútbol"
                required
              >
            </div>

            <div class="form-group span-2">
              <label for="description">Descripción</label>
              <input
                id="description"
                v-model.trim="createForm.description"
                type="text"
                placeholder="Descripción de la actividad"
                required
              >
            </div>

            <div class="form-group">
              <label for="category">Categoría</label>
              <select id="category" v-model="createForm.category" required>
                <option value="" disabled>Seleccioná una categoría</option>
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
              <label for="modality">Modalidad</label>
              <select id="modality" v-model="createForm.modality">
                <option value="in-person">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Híbrida</option>
              </select>
            </div>

            <div class="form-group">
              <label for="startDate">Fecha de inicio</label>
              <input
                id="startDate"
                v-model="createForm.startDate"
                type="datetime-local"
                required
              >
            </div>

            <div class="form-group">
              <label for="endDate">Fecha de finalización</label>
              <input
                id="endDate"
                v-model="createForm.endDate"
                type="datetime-local"
                required
              >
            </div>

            <div class="form-group">
              <label for="capacity">Cupos</label>
              <input
                id="capacity"
                v-model.number="createForm.capacity"
                type="number"
                min="1"
                required
              >
            </div>

            <div class="form-group">
              <label for="status">Estado</label>
              <select id="status" v-model="createForm.status">
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
              </select>
            </div>

            <div class="form-group">
              <label for="locationName">Lugar</label>
              <input
                id="locationName"
                v-model.trim="createForm.locationName"
                type="text"
                placeholder="Nombre del lugar"
              >
            </div>

            <div class="form-group">
              <label for="locationAddress">Dirección</label>
              <input
                id="locationAddress"
                v-model.trim="createForm.locationAddress"
                type="text"
                placeholder="Dirección"
              >
            </div>

            <div class="form-group">
              <label for="locationVirtualUrl">Enlace virtual</label>
              <input
                id="locationVirtualUrl"
                v-model.trim="createForm.locationVirtualUrl"
                type="text"
                placeholder="https://..."
              >
            </div>

            <div class="form-group span-2">
              <label for="imageUrl">Imagen (URL)</label>
              <input
                id="imageUrl"
                v-model.trim="createForm.imageUrl"
                type="text"
                placeholder="https://..."
              >
            </div>

            <button class="submit-button" type="submit" :disabled="creating">
              {{ creating ? "Creando..." : "Crear actividad" }}
            </button>
          </form>

          <div v-if="createError" class="error-message">
            <span aria-hidden="true">!</span>
            <p>{{ createError }}</p>
          </div>

          <div v-if="createSuccess" class="information-message">
            <span aria-hidden="true">✓</span>
            <p>{{ createSuccess }}</p>
          </div>
        </section>

        <!-- Listado -->
        <section class="panel">
          <header class="panel-header">
            <h3>Mis actividades</h3>
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
            Todavía no creaste ninguna actividad.
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
                </div>
              </template>
            </article>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useEventsStore } from "~/stores/events"
import { useCategoriesStore } from "~/stores/categories"
import type { EventItem } from "~/types/event"

useHead({
  title: "Mis actividades | CommunityHub"
})

const store = useEventsStore()
const categoriesStore = useCategoriesStore()

const hasToken = ref(false)
const isOrganizer = ref(false)
const roleChecked = ref(false)

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
    modality: "in-person" as const,
    startDate: "",
    endDate: "",
    capacity: 1,
    status: "draft" as const,
    locationName: "",
    locationAddress: "",
    locationVirtualUrl: "",
    imageUrl: ""
  }
}

const createForm = reactive(emptyForm())
const creating = ref(false)
const createError = ref("")
const createSuccess = ref("")

const editingId = ref<string | null>(null)
const editForm = reactive(emptyForm())
const savingEdit = ref(false)

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

async function handleCreate() {
  creating.value = true
  createError.value = ""
  createSuccess.value = ""

  const result = await store.createEvent(buildPayload(createForm))

  if (result.success) {
    createSuccess.value = `Actividad "${createForm.title}" creada correctamente.`
    Object.assign(createForm, emptyForm())
  } else {
    createError.value = result.message
  }

  creating.value = false
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

async function loadEvents() {
  await store.fetchEvents({ mine: true })
}

onMounted(async () => {
  const token = localStorage.getItem("token")
  hasToken.value = !!token

  if (!token) {
    return
  }

  const config = useRuntimeConfig()

  try {
    const response = await $fetch<{
      success: boolean
      data: { user: { role: string } }
    }>("/api/auth/me", {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    isOrganizer.value = response.data.user.role === "organizer"
  } catch {
    isOrganizer.value = false
  }

  roleChecked.value = true

  if (!isOrganizer.value) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100 })
  await loadEvents()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.my-activities-page {
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

  min-height: 100vh;
  padding: 40px 24px 60px;
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

.submit-button {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  margin-top: 6px;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 12px;
  background: var(--purple);
  box-shadow: 0 11px 25px rgba(124, 58, 237, 0.25);
  transition: background 180ms ease, transform 180ms ease;
}

.submit-button:hover:not(:disabled) {
  background: var(--purple-dark);
  transform: translateY(-2px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.information-message,
.error-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 13px 14px;
  margin-top: 16px;
  border-radius: 13px;
}

.information-message {
  color: #4c287d;
  border: 1px solid #d8cced;
  background: #f5f1fc;
}

.information-message span {
  display: grid;
  width: 21px;
  height: 21px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: var(--purple);
}

.error-message {
  color: var(--red);
  border: 1px solid var(--red-border);
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

.information-message p,
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

.event-form .row-actions {
  grid-column: span 2;
  margin-top: 6px;
}

@media (max-width: 640px) {
  .event-form {
    grid-template-columns: 1fr;
  }

  .form-group.span-2,
  .submit-button,
  .event-form .row-actions {
    grid-column: span 1;
  }
}
</style>

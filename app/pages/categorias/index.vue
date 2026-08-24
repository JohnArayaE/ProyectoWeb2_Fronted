<template>
  <div class="categories-page">
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
          <h2>Categorías</h2>
          <p>Gestioná las categorías disponibles para las actividades.</p>
        </div>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver las categorías tenés que iniciar sesión con tu cuenta.
            <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Usuario logueado pero sin permisos de administrador -->
        <div v-if="!isAdmin" class="information-message">
          <span aria-hidden="true">i</span>
          <p>
            Tu cuenta no tiene permisos de administrador. Podés ver el
            listado de categorías, pero crear, editar y desactivar están
            deshabilitados.
          </p>
        </div>

        <!-- Formulario de creación (solo admin) -->
        <section v-if="isAdmin" class="panel">
          <header class="panel-header">
            <h3>Nueva categoría</h3>
          </header>

          <form class="category-form" @submit.prevent="handleCreate">
            <div class="form-group">
              <label for="name">Nombre</label>
              <input
                id="name"
                v-model.trim="createForm.name"
                type="text"
                placeholder="Ej. Deportes"
                required
              >
            </div>

            <div class="form-group">
              <label for="description">Descripción</label>
              <input
                id="description"
                v-model.trim="createForm.description"
                type="text"
                placeholder="Descripción opcional"
              >
            </div>

            <button
              class="submit-button"
              type="submit"
              :disabled="creating"
            >
              {{ creating ? "Creando..." : "Crear categoría" }}
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
            <h3>Listado</h3>
            <span v-if="store.pagination" class="total-badge">
              {{ store.pagination.totalCategories }} categorías
            </span>
          </header>

          <div v-if="store.error" class="error-message">
            <span aria-hidden="true">!</span>
            <p>{{ store.error }}</p>
          </div>

          <div v-if="store.loading" class="loading-row">
            Cargando categorías...
          </div>

          <div v-else-if="!store.categories.length && !store.error" class="empty-row">
            No hay categorías para mostrar.
          </div>

          <div v-else class="category-table">
            <div class="table-head">
              <span>Nombre</span>
              <span>Slug</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <div
              v-for="category in store.categories"
              :key="category.id"
              class="table-row"
            >
              <template v-if="editingId === category.id">
                <div class="edit-fields">
                  <input
                    v-model.trim="editForm.name"
                    type="text"
                    class="inline-input"
                    placeholder="Nombre"
                  >
                  <input
                    v-model.trim="editForm.description"
                    type="text"
                    class="inline-input"
                    placeholder="Descripción"
                  >
                </div>

                <span class="slug-cell">{{ category.slug }}</span>

                <span
                  class="status-pill"
                  :class="category.isActive ? 'is-active' : 'is-inactive'"
                >
                  {{ category.isActive ? "Activa" : "Inactiva" }}
                </span>

                <div class="row-actions">
                  <button
                    class="action-button save-button"
                    type="button"
                    :disabled="savingEdit"
                    @click="handleSaveEdit(category.id)"
                  >
                    {{ savingEdit ? "Guardando..." : "Guardar" }}
                  </button>
                  <button
                    class="action-button cancel-button"
                    type="button"
                    @click="cancelEdit"
                  >
                    Cancelar
                  </button>
                </div>
              </template>

              <template v-else>
                <span class="name-cell">{{ category.name }}</span>
                <span class="slug-cell">{{ category.slug }}</span>

                <span
                  class="status-pill"
                  :class="category.isActive ? 'is-active' : 'is-inactive'"
                >
                  {{ category.isActive ? "Activa" : "Inactiva" }}
                </span>

                <div class="row-actions">
                  <button
                    class="action-button edit-button"
                    type="button"
                    :disabled="!isAdmin"
                    :title="!isAdmin ? 'Requiere permisos de administrador' : ''"
                    @click="startEdit(category)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="category.isActive"
                    class="action-button deactivate-button"
                    type="button"
                    :disabled="!isAdmin"
                    :title="!isAdmin ? 'Requiere permisos de administrador' : ''"
                    @click="handleToggleActive(category)"
                  >
                    Desactivar
                  </button>
                  <button
                    v-else
                    class="action-button reactivate-button"
                    type="button"
                    :disabled="!isAdmin"
                    :title="!isAdmin ? 'Requiere permisos de administrador' : ''"
                    @click="handleToggleActive(category)"
                  >
                    Reactivar
                  </button>
                </div>
              </template>
            </div>
          </div>

          <div v-if="store.pagination && store.pagination.totalPages > 1" class="pagination">
            <button
              type="button"
              :disabled="page <= 1"
              @click="changePage(page - 1)"
            >
              Anterior
            </button>

            <span>Página {{ page }} de {{ store.pagination.totalPages }}</span>

            <button
              type="button"
              :disabled="page >= store.pagination.totalPages"
              @click="changePage(page + 1)"
            >
              Siguiente
            </button>
          </div>
        </section>
      </template>
    </section>
    </main>

    <AdminAppFooter />
  </div>
</template>

<script setup lang="ts">
import { useCategoriesStore } from "~/stores/categories"
import { useAuthStore } from "~/stores/auth"
import type { Category } from "~/types/category"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Categorías | CommunityHub",
  meta: [
    {
      name: "description",
      content: "Gestión de categorías de actividades en CommunityHub."
    }
  ]
})

const store = useCategoriesStore()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === "admin")

const page = ref(1)
const limit = 20

const createForm = reactive({
  name: "",
  description: ""
})
const creating = ref(false)
const createError = ref("")
const createSuccess = ref("")

const editingId = ref<string | null>(null)
const editForm = reactive({
  name: "",
  description: ""
})
const savingEdit = ref(false)

async function loadCategories() {
  await store.fetchCategories({
    page: page.value,
    limit,
    includeInactive: isAdmin.value
  })
}

async function changePage(next: number) {
  page.value = next
  await loadCategories()
}

async function handleCreate() {
  creating.value = true
  createError.value = ""
  createSuccess.value = ""

  const result = await store.createCategory({
    name: createForm.name,
    description: createForm.description || undefined
  })

  if (result.success) {
    createSuccess.value = `Categoría "${createForm.name}" creada correctamente.`
    createForm.name = ""
    createForm.description = ""
  } else {
    createError.value = result.message
  }

  creating.value = false
}

function startEdit(category: Category) {
  editingId.value = category.id
  editForm.name = category.name
  editForm.description = category.description ?? ""
}

function cancelEdit() {
  editingId.value = null
}

async function handleSaveEdit(id: string) {
  savingEdit.value = true

  const result = await store.updateCategory(id, {
    name: editForm.name,
    description: editForm.description
  })

  savingEdit.value = false

  if (result.success) {
    editingId.value = null
  } else {
    store.error = result.message
  }
}

async function handleToggleActive(category: Category) {
  if (category.isActive) {
    const confirmed = confirm(
      "¿Seguro que querés desactivar esta categoría? Podrás reactivarla luego."
    )

    if (!confirmed) {
      return
    }
  }

  const result = await store.updateCategory(category.id, {
    isActive: !category.isActive
  })

  if (!result.success) {
    store.error = result.message
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  await loadCategories()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.categories-page {
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

.categories-page > main {
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

/* Tarjetas de estado / panel */

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

/* Formulario */

.category-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;
  align-items: end;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-dark);
}

.form-group input,
.inline-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  font: inherit;
  font-size: 14px;
  color: var(--text-dark);
  outline: none;
  border: 1px solid var(--gray-border);
  border-radius: 12px;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.form-group input::placeholder,
.inline-input::placeholder {
  color: #aba5b4;
}

.form-group input:focus,
.inline-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 12px;
  background: var(--purple);
  box-shadow: 0 11px 25px rgba(124, 58, 237, 0.25);
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
  white-space: nowrap;
}

.submit-button:hover:not(:disabled) {
  border-color: var(--purple-dark);
  background: var(--purple-dark);
  transform: translateY(-2px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Mensajes */

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

/* Tabla */

.loading-row,
.empty-row {
  padding: 30px 0;
  font-size: 13px;
  color: var(--gray-text);
  text-align: center;
}

.category-table {
  display: grid;
  gap: 2px;
  overflow: hidden;
  border: 1px solid var(--gray-border);
  border-radius: 16px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 0.8fr 1.3fr;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
}

.table-head {
  font-size: 11px;
  font-weight: 800;
  color: var(--gray-text);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: #faf9fc;
}

.table-row {
  background: var(--white);
  border-top: 1px solid var(--gray-border);
}

.name-cell {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
}

.slug-cell {
  font-size: 13px;
  color: var(--gray-text);
}

.status-pill {
  display: inline-flex;
  width: fit-content;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
}

.status-pill.is-active {
  color: var(--purple-dark);
  background: var(--purple-soft);
}

.status-pill.is-inactive {
  color: #77707f;
  background: #f0edf3;
}

.row-actions {
  display: flex;
  gap: 8px;
}

.edit-fields {
  display: grid;
  gap: 8px;
}

.action-button {
  padding: 7px 12px;
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

.deactivate-button {
  color: var(--red);
  border: 1px solid var(--red-border);
  background: var(--white);
}

.deactivate-button:hover:not(:disabled) {
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

/* Paginación */

.pagination {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--gray-text);
}

.pagination button {
  padding: 8px 14px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--purple-dark);
  cursor: pointer;
  border: 1px solid #d5c8eb;
  border-radius: 9px;
  background: var(--white);
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

/* Responsive */

@media (max-width: 720px) {
  .category-form {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .row-actions {
    margin-top: 8px;
  }
}
</style>

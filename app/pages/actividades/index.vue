<template>
  <div class="activities-page">
    <AppHeader />

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
          <span class="section-label">Comunidad</span>
          <h2>Actividades</h2>
          <p>Descubrí las actividades disponibles y sumate a las que te interesen.</p>
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

      <template v-else>
        <section class="panel">
          <header class="panel-header">
            <h3>Listado</h3>
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
            No hay actividades para mostrar.
          </div>

          <div v-else class="event-grid">
            <div
              v-for="event in store.events"
              :key="event.id"
              class="event-card"
            >
              <NuxtLink
                :to="`/actividades/${event.id}`"
                class="event-card-link"
              >
                <div class="event-card-top">
                  <span class="category-pill">
                    {{ categoryName(event.category) }}
                  </span>

                  <div class="event-card-top-right">
                    <span
                      class="status-pill"
                      :class="`is-${event.status}`"
                    >
                      {{ statusLabel(event.status) }}
                    </span>

                    <button
                      v-if="!isOrganizer"
                      type="button"
                      class="favorite-toggle"
                      :class="{ 'is-active': favoritesStore.isFavorite(event.id) }"
                      :disabled="togglingFavorites[event.id]"
                      :aria-pressed="favoritesStore.isFavorite(event.id)"
                      :aria-label="
                        favoritesStore.isFavorite(event.id)
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      "
                      @click.stop.prevent="toggleFavorite(event.id)"
                    >
                      <span aria-hidden="true">
                        {{ favoritesStore.isFavorite(event.id) ? "♥" : "♡" }}
                      </span>
                    </button>
                  </div>
                </div>

                <h4>{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>

                <div class="event-meta">
                  <span>📅 {{ formatDate(event.startDate) }}</span>
                  <span>📍 {{ modalityLabel(event.modality) }}</span>
                  <span>👥 {{ event.capacity }} cupos</span>
                </div>
              </NuxtLink>

              <div v-if="!isOrganizer" class="event-card-actions">
                <button
                  type="button"
                  class="registration-button"
                  :class="{
                    'is-registered': registrationsStore.isRegistered(event.id)
                  }"
                  :disabled="registrationButtonDisabled(event.id)"
                  @click="toggleRegistration(event.id)"
                >
                  {{ registrationButtonLabel(event.id) }}
                </button>

                <p v-if="registrationErrors[event.id]" class="registration-error">
                  {{ registrationErrors[event.id] }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="store.pagination && store.pagination.totalPages > 1"
            class="pagination"
          >
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

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useEventsStore } from "~/stores/events"
import { useCategoriesStore } from "~/stores/categories"
import { useAuthStore } from "~/stores/auth"
import { useFavoritesStore } from "~/stores/favorites"
import { useRegistrationsStore } from "~/stores/registrations"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Actividades | CommunityHub",
  meta: [
    {
      name: "description",
      content: "Descubrí las actividades disponibles en CommunityHub."
    }
  ]
})

const store = useEventsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const registrationsStore = useRegistrationsStore()

const isOrganizer = computed(() => authStore.user?.role === "organizer")

const page = ref(1)
const limit = 12

const togglingFavorites = reactive<Record<string, boolean>>({})

async function toggleFavorite(eventId: string) {
  if (togglingFavorites[eventId]) {
    return
  }

  togglingFavorites[eventId] = true
  await favoritesStore.toggleFavorite(eventId)
  togglingFavorites[eventId] = false
}

const togglingRegistrations = reactive<Record<string, boolean>>({})
const registrationErrors = reactive<Record<string, string>>({})
const fullCapacityEvents = reactive<Record<string, boolean>>({})

function registrationButtonLabel(eventId: string) {
  if (registrationsStore.isRegistered(eventId)) {
    return "Cancelar inscripción"
  }

  if (fullCapacityEvents[eventId]) {
    return "Sin cupo disponible"
  }

  return "Inscribirme"
}

function registrationButtonDisabled(eventId: string) {
  if (togglingRegistrations[eventId]) {
    return true
  }

  return !registrationsStore.isRegistered(eventId) && !!fullCapacityEvents[eventId]
}

async function toggleRegistration(eventId: string) {
  if (togglingRegistrations[eventId]) {
    return
  }

  togglingRegistrations[eventId] = true
  registrationErrors[eventId] = ""

  const result = await registrationsStore.toggleRegistration(eventId)

  if (result.success) {
    fullCapacityEvents[eventId] = false
  } else {
    registrationErrors[eventId] = result.message

    if (result.status === 409 && /capacidad|cupo/i.test(result.message)) {
      fullCapacityEvents[eventId] = true
    }
  }

  togglingRegistrations[eventId] = false
}

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
  const category = categoriesStore.categories.find(
    item => item.id === categoryId
  )

  return category?.name ?? "Sin categoría"
}

async function loadEvents() {
  await store.fetchEvents({
    page: page.value,
    limit
  })
}

async function changePage(next: number) {
  page.value = next
  await loadEvents()
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100, includeInactive: true })

  if (isOrganizer.value) {
    await loadEvents()
    return
  }

  await Promise.all([
    loadEvents(),
    favoritesStore.fetchFavorites(),
    registrationsStore.fetchMyRegistrations()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.activities-page {
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

.activities-page > main {
  padding: 40px 24px 60px;
}

.page-shell {
  width: min(1080px, 100%);
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

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.event-card {
  display: grid;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--gray-border);
  border-radius: 16px;
  background: var(--white);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.event-card:hover {
  border-color: var(--purple-light);
  box-shadow: 0 16px 30px rgba(124, 58, 237, 0.16);
  transform: translateY(-3px);
}

.event-card-link {
  display: grid;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.event-card-actions {
  display: grid;
  gap: 8px;
  padding-top: 10px;
  margin-top: 2px;
  border-top: 1px solid var(--gray-border);
}

.registration-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 14px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 10px;
  background: var(--purple);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.registration-button:hover:not(:disabled) {
  background: var(--purple-dark);
}

.registration-button.is-registered {
  color: var(--red);
  border-color: var(--red-border);
  background: var(--red-soft);
}

.registration-button.is-registered:hover:not(:disabled) {
  border-color: var(--red);
  background: var(--red);
  color: var(--white);
}

.registration-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.registration-error {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--red);
}

.event-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-card-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorite-toggle {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  font-size: 15px;
  line-height: 1;
  color: var(--red);
  cursor: pointer;
  place-items: center;
  border: 1px solid var(--gray-border);
  border-radius: 50%;
  background: var(--white);
  transition:
    transform 150ms ease,
    background 150ms ease,
    border-color 150ms ease;
}

.favorite-toggle:hover:not(:disabled) {
  border-color: var(--red-border);
  background: var(--red-soft);
  transform: scale(1.06);
}

.favorite-toggle.is-active {
  color: var(--white);
  border-color: var(--red);
  background: var(--red);
}

.favorite-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.event-card h4 {
  margin: 0;
  font-size: 16px;
  color: var(--text-dark);
}

.event-description {
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: var(--gray-text);
}

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
</style>

<template>
  <div class="activities-page">
    <AppHeader />

    <main>
      <section class="page-shell">
        <header class="page-header">
          <div class="brand">
            <div
              class="brand-icon"
              aria-hidden="true"
            >
              C
            </div>

            <div>
              <p class="brand-subtitle">
                PLATAFORMA COMUNITARIA
              </p>

              <h1>
                CommunityHub
              </h1>
            </div>
          </div>

          <div class="header-text">
            <span class="section-label">
              Comunidad
            </span>

            <h2>
              Actividades
            </h2>

            <p>
              Descubrí las actividades disponibles y sumate a las que te interesen.
            </p>
          </div>
        </header>

        <div
          v-if="!authStore.isAuthenticated"
          class="state-card"
        >
          <span
            class="state-icon"
            aria-hidden="true"
          >
            i
          </span>

          <div>
            <strong>
              Necesitás iniciar sesión
            </strong>

            <p>
              Para ver las actividades tenés que iniciar sesión con tu cuenta.
              <NuxtLink to="/login">
                Ir a iniciar sesión
              </NuxtLink>
            </p>
          </div>
        </div>

        <template v-else>
          <div
            v-if="store.isOffline"
            class="offline-message"
          >
            <div
              class="offline-icon"
              aria-hidden="true"
            >
              !
            </div>

            <div>
              <strong>
                Estás sin conexión
              </strong>

              <p v-if="store.usingCachedEvents">
                Estás viendo las actividades previamente cargadas.
                Algunas acciones no están disponibles hasta recuperar la conexión.
              </p>

              <p v-else>
                No hay conexión a Internet y todavía no existen actividades guardadas.
              </p>
            </div>
          </div>

          <section class="panel">
            <header class="panel-header">
              <h3>
                Listado
              </h3>

              <span
                v-if="store.pagination"
                class="total-badge"
              >
                {{ store.pagination.totalEvents }} actividades
              </span>
            </header>

            <form
              v-if="!isOrganizer && !store.isOffline"
              class="filters-bar"
              @submit.prevent="applyFilters"
            >
              <div class="filter-field">
                <label for="filter-search">
                  Buscar
                </label>

                <input
                  id="filter-search"
                  v-model="filters.search"
                  type="text"
                  placeholder="Título o descripción"
                >
              </div>

              <div class="filter-field">
                <label for="filter-category">
                  Categoría
                </label>

                <select
                  id="filter-category"
                  v-model="filters.category"
                >
                  <option value="">
                    Todas
                  </option>

                  <option
                    v-for="category in categoriesStore.categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="filter-field">
                <label for="filter-date">
                  Desde
                </label>

                <input
                  id="filter-date"
                  v-model="filters.date"
                  type="date"
                >
              </div>

              <div class="filter-field">
                <label for="filter-location">
                  Ubicación
                </label>

                <input
                  id="filter-location"
                  v-model="filters.location"
                  type="text"
                  placeholder="Nombre o dirección"
                >
              </div>

              <label class="filter-checkbox">
                <input
                  v-model="filters.availableOnly"
                  type="checkbox"
                >

                Solo con cupo disponible
              </label>

              <div class="filter-actions">
                <button
                  type="submit"
                  class="filter-apply"
                >
                  Buscar
                </button>

                <button
                  type="button"
                  class="filter-clear"
                  @click="clearFilters"
                >
                  Limpiar filtros
                </button>
              </div>
            </form>

            <div
              v-if="store.error"
              class="error-message"
            >
              <span aria-hidden="true">
                !
              </span>

              <p>
                {{ store.error }}
              </p>
            </div>

            <div
              v-if="store.loading"
              class="loading-row"
            >
              Cargando actividades...
            </div>

            <div
              v-else-if="!store.events.length && !store.error"
              class="empty-row"
            >
              No hay actividades para mostrar.
            </div>

            <div
              v-else
              class="event-grid"
            >
              <div
                v-for="event in store.events"
                :key="event.id"
                class="event-card"
              >
                <NuxtLink
                  :to="`/actividades/${event.id}`"
                  class="event-card-link"
                  :class="{
                    'offline-event-link': store.isOffline
                  }"
                  :aria-disabled="store.isOffline"
                  @click="handleEventNavigation"
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
                        :class="{
                          'is-active': favoritesStore.isFavorite(event.id)
                        }"
                        :disabled="
                          store.isOffline ||
                          togglingFavorites[event.id]
                        "
                        :aria-pressed="favoritesStore.isFavorite(event.id)"
                        :aria-label="
                          favoritesStore.isFavorite(event.id)
                            ? 'Quitar de favoritos'
                            : 'Agregar a favoritos'
                        "
                        @click.stop.prevent="toggleFavorite(event.id)"
                      >
                        <span aria-hidden="true">
                          {{
                            favoritesStore.isFavorite(event.id)
                              ? "♥"
                              : "♡"
                          }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <h4>
                    {{ event.title }}
                  </h4>

                  <p class="event-description">
                    {{ event.description }}
                  </p>

                  <div class="event-meta">
                    <span>
                      📅 {{ formatDate(event.startDate) }}
                    </span>

                    <span>
                      📍 {{ modalityLabel(event.modality) }}
                    </span>

                    <span>
                      👥 {{ event.capacity }} cupos
                    </span>
                  </div>
                </NuxtLink>

                <div
                  v-if="!isOrganizer"
                  class="event-card-actions"
                >
                  <button
                    type="button"
                    class="registration-button"
                    :class="{
                      'is-registered':
                        registrationsStore.isRegistered(event.id)
                    }"
                    :disabled="registrationButtonDisabled(event.id)"
                    @click="toggleRegistration(event.id)"
                  >
                    {{ registrationButtonLabel(event.id) }}
                  </button>

                  <p
                    v-if="store.isOffline"
                    class="offline-action-message"
                  >
                    Disponible nuevamente cuando tengas conexión.
                  </p>

                  <p
                    v-else-if="registrationErrors[event.id]"
                    class="registration-error"
                  >
                    {{ registrationErrors[event.id] }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="
                !store.isOffline &&
                store.pagination &&
                store.pagination.totalPages > 1
              "
              class="pagination"
            >
              <button
                type="button"
                :disabled="page <= 1"
                @click="changePage(page - 1)"
              >
                Anterior
              </button>

              <span>
                Página {{ page }} de {{ store.pagination.totalPages }}
              </span>

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

import type { ListEventsParams } from "~/types/event"

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

const route = useRoute()
const router = useRouter()

const isOrganizer = computed(() => {
  return authStore.user?.role === "organizer"
})

const page = ref(1)

const limit = 12

const filters = reactive({
  search: "",
  category: "",
  date: "",
  location: "",
  availableOnly: false
})

function initFiltersFromRoute() {
  const query = route.query

  filters.search =
    typeof query.search === "string"
      ? query.search
      : ""

  filters.category =
    typeof query.category === "string"
      ? query.category
      : ""

  filters.date =
    typeof query.date === "string"
      ? query.date
      : ""

  filters.location =
    typeof query.location === "string"
      ? query.location
      : ""

  filters.availableOnly =
    query.available === "true"

  const parsedPage =
    Number(query.page)

  page.value =
    Number.isFinite(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1
}

function buildEventParams(): ListEventsParams {
  const params: ListEventsParams = {
    page: page.value,
    limit
  }

  if (filters.search.trim()) {
    params.search =
      filters.search.trim()
  }

  if (filters.category) {
    params.category =
      filters.category
  }

  if (filters.date) {
    params.date =
      filters.date
  }

  if (filters.location.trim()) {
    params.location =
      filters.location.trim()
  }

  if (filters.availableOnly) {
    params.available = true
  }

  return params
}

function syncRouteQuery() {
  const query: Record<string, string> = {}

  if (page.value > 1) {
    query.page =
      String(page.value)
  }

  if (filters.search.trim()) {
    query.search =
      filters.search.trim()
  }

  if (filters.category) {
    query.category =
      filters.category
  }

  if (filters.date) {
    query.date =
      filters.date
  }

  if (filters.location.trim()) {
    query.location =
      filters.location.trim()
  }

  if (filters.availableOnly) {
    query.available = "true"
  }

  router.replace({
    query
  })
}

async function applyFilters() {
  if (store.isOffline) {
    return
  }

  page.value = 1

  syncRouteQuery()

  await loadEvents()
}

async function clearFilters() {
  if (store.isOffline) {
    return
  }

  filters.search = ""
  filters.category = ""
  filters.date = ""
  filters.location = ""
  filters.availableOnly = false

  await applyFilters()
}

const togglingFavorites =
  reactive<Record<string, boolean>>({})

async function toggleFavorite(
  eventId: string
) {
  if (
    store.isOffline ||
    togglingFavorites[eventId]
  ) {
    return
  }

  togglingFavorites[eventId] = true

  await favoritesStore.toggleFavorite(
    eventId
  )

  togglingFavorites[eventId] = false
}

const togglingRegistrations =
  reactive<Record<string, boolean>>({})

const registrationErrors =
  reactive<Record<string, string>>({})

const fullCapacityEvents =
  reactive<Record<string, boolean>>({})

function registrationButtonLabel(
  eventId: string
) {
  if (
    registrationsStore.isRegistered(eventId)
  ) {
    return "Cancelar inscripción"
  }

  if (fullCapacityEvents[eventId]) {
    return "Sin cupo disponible"
  }

  return "Inscribirme"
}

function registrationButtonDisabled(
  eventId: string
) {
  if (store.isOffline) {
    return true
  }

  if (
    togglingRegistrations[eventId]
  ) {
    return true
  }

  return (
    !registrationsStore.isRegistered(eventId) &&
    !!fullCapacityEvents[eventId]
  )
}

async function toggleRegistration(
  eventId: string
) {
  if (
    store.isOffline ||
    togglingRegistrations[eventId]
  ) {
    return
  }

  togglingRegistrations[eventId] = true

  registrationErrors[eventId] = ""

  const result =
    await registrationsStore.toggleRegistration(
      eventId
    )

  if (result.success) {
    fullCapacityEvents[eventId] = false
  } else {
    registrationErrors[eventId] =
      result.message

    if (
      result.status === 409 &&
      /capacidad|cupo/i.test(result.message)
    ) {
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

function statusLabel(
  status: string
) {
  return statusLabels[status] ?? status
}

function modalityLabel(
  modality: string
) {
  return modalityLabels[modality] ?? modality
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "es-CR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  )
}

function categoryName(
  categoryId: string
) {
  const category =
    categoriesStore.categories.find(
      item => item.id === categoryId
    )

  return (
    category?.name ??
    "Sin categoría"
  )
}

function handleEventNavigation(
  event: MouseEvent
) {
  if (!store.isOffline) {
    return
  }

  event.preventDefault()
}

async function loadEvents() {
  await store.fetchEvents(
    buildEventParams()
  )
}

async function changePage(
  next: number
) {
  if (store.isOffline) {
    return
  }

  page.value = next

  syncRouteQuery()

  await loadEvents()
}

function handleOffline() {
  store.updateConnectionStatus()

  store.loadEventsFromCache()
}

async function handleOnline() {
  store.updateConnectionStatus()

  if (store.isOffline) {
    return
  }

  await categoriesStore.fetchCategories({
    limit: 100,
    includeInactive: true
  })

  if (isOrganizer.value) {
    await loadEvents()
    return
  }

  await Promise.all([
    loadEvents(),
    favoritesStore.fetchFavorites(),
    registrationsStore.fetchMyRegistrations()
  ])
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  window.addEventListener(
    "offline",
    handleOffline
  )

  window.addEventListener(
    "online",
    handleOnline
  )

  initFiltersFromRoute()

  store.updateConnectionStatus()

  if (store.isOffline) {
    await loadEvents()
    return
  }

  await categoriesStore.fetchCategories({
    limit: 100,
    includeInactive: true
  })

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

onBeforeUnmount(() => {
  window.removeEventListener(
    "offline",
    handleOffline
  )

  window.removeEventListener(
    "online",
    handleOnline
  )
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
  display: grid;
  gap: 24px;
  width: min(1080px, 100%);
  margin: 0 auto;
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
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple)
    );
  box-shadow:
    0 10px 24px rgba(124, 58, 237, 0.25);
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
  box-shadow:
    0 20px 50px rgba(24, 14, 40, 0.1);
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

.offline-message {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 17px 19px;
  color: #4f3870;
  border: 1px solid #cfc0e8;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      #f4effc,
      #ffffff
    );
  box-shadow:
    0 10px 25px rgba(91, 33, 182, 0.08);
}

.offline-icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: var(--purple);
}

.offline-message strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--purple-dark);
}

.offline-message p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--gray-text);
}

.panel {
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #fdfcff 100%
    );
  box-shadow:
    0 24px 60px rgba(24, 14, 40, 0.12);
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

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--gray-border);
  border-radius: 16px;
  background: #faf9fc;
}

.filter-field {
  display: grid;
  gap: 6px;
  min-width: 160px;
}

.filter-field label {
  font-size: 11px;
  font-weight: 800;
  color: var(--gray-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-field input,
.filter-field select {
  padding: 9px 11px;
  font: inherit;
  font-size: 13px;
  color: var(--text-dark);
  border: 1px solid var(--gray-border);
  border-radius: 10px;
  background: var(--white);
}

.filter-checkbox {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dark);
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.filter-apply,
.filter-clear {
  padding: 10px 16px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 10px;
}

.filter-apply {
  color: var(--white);
  border: 1px solid var(--purple);
  background: var(--purple);
}

.filter-apply:hover {
  background: var(--purple-dark);
}

.filter-clear {
  color: var(--purple-dark);
  border: 1px solid #d5c8eb;
  background: var(--white);
}

.filter-clear:hover {
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
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(260px, 1fr)
    );
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
  box-shadow:
    0 16px 30px rgba(124, 58, 237, 0.16);
  transform: translateY(-3px);
}

.event-card-link {
  display: grid;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.offline-event-link {
  cursor: default;
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
  color: var(--white);
  border-color: var(--red);
  background: var(--red);
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

.offline-action-message {
  margin: 0;
  font-size: 9px;
  line-height: 1.5;
  color: var(--gray-text);
  text-align: center;
}

.event-card-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.event-card-top-right {
  display: flex;
  gap: 8px;
  align-items: center;
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
  opacity: 0.45;
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
  color: #77707f;
  border-radius: 999px;
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
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-text);
  line-clamp: 2;
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

@media (max-width: 640px) {
  .activities-page > main {
    padding: 30px 16px 50px;
  }

  .panel {
    padding: 20px;
  }

  .offline-message {
    padding: 15px;
  }

  .filters-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-field {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    margin-left: 0;
  }

  .filter-apply,
  .filter-clear {
    flex: 1;
  }
}
</style>
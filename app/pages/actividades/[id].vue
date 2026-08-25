<template>
  <div class="activity-detail-page">
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

        <NuxtLink to="/actividades" class="back-link">
          ← Volver a actividades
        </NuxtLink>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver esta actividad tenés que iniciar sesión con tu cuenta.
            <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
          </p>
        </div>
      </div>

      <template v-else>
        <div v-if="store.selectedLoading" class="state-card">
          <span class="state-icon" aria-hidden="true">i</span>
          <div>
            <strong>Cargando actividad...</strong>
          </div>
        </div>

        <div
          v-else-if="store.selectedErrorStatus === 404"
          class="state-card"
        >
          <span class="state-icon" aria-hidden="true">i</span>
          <div>
            <strong>Esta actividad no existe o no está disponible</strong>
            <p>
              Es posible que haya sido eliminada, cancelada o que todavía no
              esté publicada.
            </p>
          </div>
        </div>

        <div v-else-if="store.selectedError" class="error-message">
          <span aria-hidden="true">!</span>
          <p>{{ store.selectedError }}</p>
        </div>

        <section v-else-if="event" class="panel">
          <div class="event-top">
            <span class="category-pill">{{ categoryName }}</span>
            <span
              v-if="showStatus"
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
              :disabled="togglingFavorite"
              :aria-pressed="favoritesStore.isFavorite(event.id)"
              :aria-label="
                favoritesStore.isFavorite(event.id)
                  ? 'Quitar de favoritos'
                  : 'Agregar a favoritos'
              "
              @click="toggleFavorite"
            >
              <span aria-hidden="true">
                {{ favoritesStore.isFavorite(event.id) ? "♥" : "♡" }}
              </span>
            </button>
          </div>

          <h2>{{ event.title }}</h2>
          <p class="description">{{ event.description }}</p>

          <div class="details-grid">
            <div class="detail-item">
              <span>Fecha de inicio</span>
              <strong>{{ formatDateTime(event.startDate) }}</strong>
            </div>

            <div class="detail-item">
              <span>Fecha de finalización</span>
              <strong>{{ formatDateTime(event.endDate) }}</strong>
            </div>

            <div class="detail-item">
              <span>Modalidad</span>
              <strong>{{ modalityLabel(event.modality) }}</strong>
            </div>

            <div class="detail-item">
              <span>Cupos</span>
              <strong>{{ event.capacity }}</strong>
            </div>

            <div v-if="event.location?.name" class="detail-item">
              <span>Lugar</span>
              <strong>{{ event.location.name }}</strong>
            </div>

            <div v-if="event.location?.address" class="detail-item">
              <span>Dirección</span>
              <strong>{{ event.location.address }}</strong>
            </div>

            <div v-if="event.location?.virtualUrl" class="detail-item">
              <span>Enlace virtual</span>
              <a :href="event.location.virtualUrl" target="_blank" rel="noopener">
                {{ event.location.virtualUrl }}
              </a>
            </div>
          </div>

          <img
            v-if="event.imageUrl"
            :src="event.imageUrl"
            :alt="event.title"
            class="event-image"
          >

          <div v-if="!isOrganizer" class="registration-section">
            <button
              type="button"
              class="registration-button"
              :class="{ 'is-registered': registrationsStore.isRegistered(event.id) }"
              :disabled="registrationButtonDisabled"
              @click="toggleRegistration"
            >
              {{ registrationButtonLabel }}
            </button>

            <p v-if="registrationError" class="registration-error">
              {{ registrationError }}
            </p>
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

const route = useRoute()
const store = useEventsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const registrationsStore = useRegistrationsStore()

const togglingFavorite = ref(false)

async function toggleFavorite() {
  if (togglingFavorite.value || !event.value) {
    return
  }

  togglingFavorite.value = true
  await favoritesStore.toggleFavorite(event.value.id)
  togglingFavorite.value = false
}

const togglingRegistration = ref(false)
const registrationError = ref("")
const fullCapacity = ref(false)

const registrationButtonLabel = computed(() => {
  if (!event.value) {
    return "Inscribirme"
  }

  if (registrationsStore.isRegistered(event.value.id)) {
    return "Cancelar inscripción"
  }

  if (fullCapacity.value) {
    return "Sin cupo disponible"
  }

  return "Inscribirme"
})

const registrationButtonDisabled = computed(() => {
  if (togglingRegistration.value) {
    return true
  }

  if (!event.value) {
    return true
  }

  return !registrationsStore.isRegistered(event.value.id) && fullCapacity.value
})

async function toggleRegistration() {
  if (togglingRegistration.value || !event.value) {
    return
  }

  togglingRegistration.value = true
  registrationError.value = ""

  const result = await registrationsStore.toggleRegistration(event.value.id)

  if (result.success) {
    fullCapacity.value = false
  } else {
    registrationError.value = result.message

    if (result.status === 409 && /capacidad|cupo/i.test(result.message)) {
      fullCapacity.value = true
    }
  }

  togglingRegistration.value = false
}

const currentUserId = computed(() => authStore.user?.id ?? null)
const currentUserRole = computed(() => authStore.user?.role ?? null)
const isOrganizer = computed(() => currentUserRole.value === "organizer")

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

const event = computed(() => store.selectedEvent)

const categoryName = computed(() => {
  if (!event.value) {
    return ""
  }

  const category = categoriesStore.categories.find(
    item => item.id === event.value?.category
  )

  return category?.name ?? "Sin categoría"
})

const showStatus = computed(() => {
  if (!event.value) {
    return false
  }

  return (
    currentUserRole.value === "admin" ||
    currentUserId.value === event.value.organizer
  )
})

function statusLabel(status: string) {
  return statusLabels[status] ?? status
}

function modalityLabel(modality: string) {
  return modalityLabels[modality] ?? modality
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

useHead(() => ({
  title: event.value
    ? `${event.value.title} | CommunityHub`
    : "Actividad | CommunityHub"
}))

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100, includeInactive: true })

  if (isOrganizer.value) {
    await store.fetchEvent(route.params.id as string)
    return
  }

  await Promise.all([
    store.fetchEvent(route.params.id as string),
    favoritesStore.fetchFavorites(),
    registrationsStore.fetchMyRegistrations()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.activity-detail-page {
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

.activity-detail-page > main {
  padding: 40px 24px 60px;
}

.page-shell {
  width: min(760px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.back-link {
  font-size: 13px;
  font-weight: 800;
  color: var(--purple-dark);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
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

.error-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 13px 14px;
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

.panel {
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #fdfcff 100%);
  box-shadow: 0 24px 60px rgba(24, 14, 40, 0.12);
}

.event-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.favorite-toggle {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 16px;
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
  font-size: 11px;
  font-weight: 800;
  color: var(--purple-dark);
  border-radius: 999px;
  background: var(--purple-soft);
}

.status-pill {
  padding: 5px 10px;
  font-size: 11px;
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

.panel h2 {
  margin: 0 0 12px;
  font-size: 28px;
  color: var(--text-dark);
  letter-spacing: -0.6px;
}

.description {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--gray-text);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--gray-border);
  border-radius: 14px;
  background: var(--white);
}

.detail-item span {
  font-size: 10px;
  font-weight: 800;
  color: var(--gray-text);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.detail-item strong,
.detail-item a {
  font-size: 14px;
  color: var(--text-dark);
}

.detail-item a {
  color: var(--purple-dark);
  word-break: break-all;
}

.event-image {
  width: 100%;
  max-height: 360px;
  margin-top: 8px;
  object-fit: cover;
  border-radius: 16px;
}

.registration-section {
  display: grid;
  gap: 8px;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--gray-border);
}

.registration-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 44px;
  padding: 10px 20px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 12px;
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
  font-size: 12px;
  line-height: 1.5;
  color: var(--red);
}
</style>

<template>
  <div class="favorites-page">
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
          <h2>Favoritos</h2>
          <p>Las actividades que guardaste para no perderlas de vista.</p>
        </div>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver tus favoritos tenés que iniciar sesión con tu cuenta.
            <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
          </p>
        </div>
      </div>

      <!-- Con sesión pero rol organizador -->
      <div v-else-if="isOrganizer" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Esta sección no está disponible para organizadores</strong>
          <p>
            Los favoritos son una función para usuarios que participan en
            actividades, no para quienes las organizan.
          </p>
        </div>
      </div>

      <template v-else>
        <section class="panel">
          <header class="panel-header">
            <h3>Mis favoritos</h3>
            <span v-if="!store.loading" class="total-badge">
              {{ store.favorites.length }} guardados
            </span>
          </header>

          <div v-if="store.error" class="error-message">
            <span aria-hidden="true">!</span>
            <p>{{ store.error }}</p>
          </div>

          <div v-if="store.loading" class="loading-row">
            Cargando favoritos...
          </div>

          <div
            v-else-if="!store.favorites.length && !store.error"
            class="empty-row"
          >
            <span class="empty-icon" aria-hidden="true">♡</span>
            <strong>Todavía no tenés favoritos</strong>
            <p>
              Explorá las
              <NuxtLink to="/actividades">actividades</NuxtLink>
              disponibles y guardá las que te interesen.
            </p>
          </div>

          <div v-else class="favorite-grid">
            <div
              v-for="favorite in store.favorites"
              :key="favorite.id"
              class="favorite-card"
            >
              <NuxtLink
                :to="`/actividades/${favorite.event.id}`"
                class="favorite-card-link"
              >
                <div class="favorite-card-top">
                  <span class="category-pill">
                    {{ categoryName(favorite.event.category) }}
                  </span>
                  <span
                    class="status-pill"
                    :class="`is-${favorite.event.status}`"
                  >
                    {{ statusLabel(favorite.event.status) }}
                  </span>
                </div>

                <h4>{{ favorite.event.title }}</h4>
                <p class="event-description">{{ favorite.event.description }}</p>

                <div class="event-meta">
                  <span>📅 {{ formatDate(favorite.event.startDate) }}</span>
                  <span>📍 {{ modalityLabel(favorite.event.modality) }}</span>
                  <span>👥 {{ favorite.event.capacity }} cupos</span>
                </div>
              </NuxtLink>

              <div class="favorite-card-actions">
                <button
                  type="button"
                  class="favorite-toggle is-active"
                  :disabled="removingIds[favorite.event.id]"
                  aria-label="Quitar de favoritos"
                  @click="removeFavorite(favorite.event.id)"
                >
                  <span aria-hidden="true">♥</span>
                </button>

                <span class="remove-hint">Quitar de favoritos</span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useFavoritesStore } from "~/stores/favorites"
import { useCategoriesStore } from "~/stores/categories"
import { useAuthStore } from "~/stores/auth"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Favoritos | CommunityHub",
  meta: [
    {
      name: "description",
      content: "Tus actividades favoritas en CommunityHub."
    }
  ]
})

const store = useFavoritesStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()

const isOrganizer = computed(() => authStore.user?.role === "organizer")

const removingIds = reactive<Record<string, boolean>>({})

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

async function removeFavorite(eventId: string) {
  if (removingIds[eventId]) {
    return
  }

  removingIds[eventId] = true
  await store.removeFavorite(eventId)
  removingIds[eventId] = false
}

onMounted(async () => {
  if (!authStore.isAuthenticated || isOrganizer.value) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100, includeInactive: true })
  await store.fetchFavorites()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.favorites-page {
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

.favorites-page > main {
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

.loading-row {
  padding: 30px 0;
  font-size: 13px;
  color: var(--gray-text);
  text-align: center;
}

.empty-row {
  display: grid;
  gap: 8px;
  justify-items: center;
  padding: 48px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  color: var(--purple-light);
}

.empty-row strong {
  font-size: 15px;
  color: var(--text-dark);
}

.empty-row p {
  margin: 0;
  max-width: 360px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-text);
}

.empty-row a {
  color: var(--purple-dark);
  font-weight: 800;
  text-decoration: underline;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.favorite-card {
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

.favorite-card:hover {
  border-color: var(--purple-light);
  box-shadow: 0 16px 30px rgba(124, 58, 237, 0.16);
  transform: translateY(-3px);
}

.favorite-card-link {
  display: grid;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.favorite-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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

.favorite-card h4 {
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

.favorite-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--gray-border);
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

.remove-hint {
  font-size: 11px;
  color: var(--gray-text);
}
</style>

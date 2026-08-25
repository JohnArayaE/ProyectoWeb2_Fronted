<template>
  <div class="registrations-page">
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
          <h2>Mis inscripciones</h2>
          <p>Las actividades a las que te inscribiste, activas o pasadas.</p>
        </div>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver tus inscripciones tenés que iniciar sesión con tu cuenta.
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
            Las inscripciones son una función para usuarios que participan en
            actividades, no para quienes las organizan.
          </p>
        </div>
      </div>

      <template v-else>
        <section class="panel">
          <header class="panel-header">
            <h3>Mis inscripciones</h3>
            <span v-if="!store.loading" class="total-badge">
              {{ store.registrations.length }} en total
            </span>
          </header>

          <div v-if="store.error" class="error-message">
            <span aria-hidden="true">!</span>
            <p>{{ store.error }}</p>
          </div>

          <div v-if="store.loading" class="loading-row">
            Cargando inscripciones...
          </div>

          <div
            v-else-if="!store.registrations.length && !store.error"
            class="empty-row"
          >
            <span class="empty-icon" aria-hidden="true">✓</span>
            <strong>Todavía no te inscribiste a ninguna actividad</strong>
            <p>
              Explorá las
              <NuxtLink to="/actividades">actividades</NuxtLink>
              disponibles e inscribite a las que te interesen.
            </p>
          </div>

          <div v-else class="registration-grid">
            <div
              v-for="registration in store.registrations"
              :key="registration.id"
              class="registration-card"
            >
              <NuxtLink
                :to="`/actividades/${registration.event.id}`"
                class="registration-card-link"
              >
                <div class="registration-card-top">
                  <span class="category-pill">
                    {{ categoryName(registration.event.category) }}
                  </span>
                  <span
                    class="status-pill"
                    :class="`is-${registration.status}`"
                  >
                    {{ registrationStatusLabel(registration.status) }}
                  </span>
                </div>

                <h4>{{ registration.event.title }}</h4>
                <p class="event-description">{{ registration.event.description }}</p>

                <div class="event-meta">
                  <span>📅 {{ formatDate(registration.event.startDate) }}</span>
                  <span>📍 {{ modalityLabel(registration.event.modality) }}</span>
                  <span>👥 {{ registration.event.capacity }} cupos</span>
                </div>
              </NuxtLink>

              <div v-if="registration.status === 'registered'" class="registration-card-actions">
                <button
                  type="button"
                  class="cancel-button"
                  :disabled="cancellingIds[registration.event.id]"
                  @click="cancel(registration.event.id)"
                >
                  {{ cancellingIds[registration.event.id] ? "Cancelando..." : "Cancelar inscripción" }}
                </button>

                <p v-if="cancelErrors[registration.event.id]" class="registration-error">
                  {{ cancelErrors[registration.event.id] }}
                </p>
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
import { useRegistrationsStore } from "~/stores/registrations"
import { useCategoriesStore } from "~/stores/categories"
import { useAuthStore } from "~/stores/auth"
import type { RegistrationStatus } from "~/types/registration"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Mis inscripciones | CommunityHub",
  meta: [
    {
      name: "description",
      content: "Las actividades a las que estás inscripto en CommunityHub."
    }
  ]
})

const store = useRegistrationsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()

const isOrganizer = computed(() => authStore.user?.role === "organizer")

const cancellingIds = reactive<Record<string, boolean>>({})
const cancelErrors = reactive<Record<string, string>>({})

const registrationStatusLabels: Record<RegistrationStatus, string> = {
  registered: "Inscripto",
  cancelled: "Cancelada",
  attended: "Asististe"
}

const modalityLabels: Record<string, string> = {
  "in-person": "Presencial",
  virtual: "Virtual",
  hybrid: "Híbrida"
}

function registrationStatusLabel(status: RegistrationStatus) {
  return registrationStatusLabels[status] ?? status
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

async function cancel(eventId: string) {
  if (cancellingIds[eventId]) {
    return
  }

  cancellingIds[eventId] = true
  cancelErrors[eventId] = ""

  const result = await store.cancelRegistration(eventId)

  if (!result.success) {
    cancelErrors[eventId] = result.message
  }

  cancellingIds[eventId] = false
}

onMounted(async () => {
  if (!authStore.isAuthenticated || isOrganizer.value) {
    return
  }

  await categoriesStore.fetchCategories({ limit: 100, includeInactive: true })
  await store.fetchMyRegistrations()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.registrations-page {
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

.registrations-page > main {
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

.registration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.registration-card {
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

.registration-card:hover {
  border-color: var(--purple-light);
  box-shadow: 0 16px 30px rgba(124, 58, 237, 0.16);
  transform: translateY(-3px);
}

.registration-card-link {
  display: grid;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.registration-card-top {
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

.status-pill.is-registered {
  color: var(--green);
  background: var(--green-soft);
}

.status-pill.is-cancelled {
  color: var(--red);
  background: var(--red-soft);
}

.registration-card h4 {
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

.registration-card-actions {
  display: grid;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--gray-border);
}

.cancel-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 14px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--red);
  cursor: pointer;
  border: 1px solid var(--red-border);
  border-radius: 10px;
  background: var(--red-soft);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.cancel-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--red);
  background: var(--red);
}

.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.registration-error {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--red);
}
</style>

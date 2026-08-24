<template>
  <div class="organizer-page">
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
          <span class="section-label">Organizador</span>
          <h2>Hola, {{ authStore.user?.firstName || "Organizador" }}</h2>
          <p>Este es el resumen de tus actividades como organizador.</p>
        </div>
      </header>

      <!-- Sin sesión iniciada -->
      <div v-if="!authStore.isAuthenticated" class="state-card">
        <span class="state-icon" aria-hidden="true">i</span>
        <div>
          <strong>Necesitás iniciar sesión</strong>
          <p>
            Para ver tu panel de organizador tenés que iniciar sesión.
            <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Usuario logueado pero sin rol de organizador -->
        <div v-if="!isOrganizer" class="information-message">
          <span aria-hidden="true">i</span>
          <p>
            Tu cuenta no tiene el rol de organizador. Este panel muestra
            estadísticas de las actividades que vos organizás, así que es
            normal que veas todo en cero si nunca creaste ninguna.
          </p>
        </div>

        <div v-if="store.error" class="error-message">
          <span aria-hidden="true">!</span>
          <p>{{ store.error }}</p>
        </div>

        <div v-if="store.loading" class="loading-row">
          Cargando resumen...
        </div>

        <template v-else>
          <!-- Métricas -->
          <section class="panel">
            <header class="panel-header">
              <h3>Resumen de actividades</h3>
            </header>

            <div class="stats-grid">
              <article class="stat-card">
                <div class="stat-icon" aria-hidden="true">📅</div>
                <p>Actividades creadas</p>
                <strong>{{ totalCreated }}</strong>
              </article>

              <article class="stat-card">
                <div class="stat-icon" aria-hidden="true">⏳</div>
                <p>Actividades próximas</p>
                <strong>{{ upcomingCount }}</strong>
              </article>

              <article class="stat-card">
                <div class="stat-icon" aria-hidden="true">✕</div>
                <p>Actividades canceladas</p>
                <strong>{{ cancelledCount }}</strong>
              </article>

              <article class="stat-card">
                <div class="stat-icon" aria-hidden="true">👥</div>
                <p>Capacidad total configurada</p>
                <strong>{{ totalCapacity }}</strong>
                <small>Suma de cupos de tus actividades activas/próximas</small>
              </article>

              <article class="stat-card stat-card-muted">
                <div class="stat-icon" aria-hidden="true">✓</div>
                <p>
                  Participantes
                  <span class="soon-badge">Próximamente</span>
                </p>
                <strong>—</strong>
                <small>
                  Se habilitará cuando el módulo de inscripciones esté
                  disponible.
                </small>
              </article>
            </div>
          </section>

          <!-- Accesos directos -->
          <section class="panel">
            <header class="panel-header">
              <h3>Accesos directos</h3>
            </header>

            <div class="shortcuts">
              <NuxtLink to="/mis-actividades" class="shortcut-button">
                Ver mis actividades
              </NuxtLink>

              <NuxtLink
                v-if="isOrganizer"
                to="/mis-actividades"
                class="shortcut-button shortcut-primary"
              >
                Crear nueva actividad
              </NuxtLink>
              <button
                v-else
                class="shortcut-button shortcut-primary"
                type="button"
                disabled
                title="Requiere rol de organizador"
              >
                Crear nueva actividad
              </button>
            </div>
          </section>
        </template>
      </template>
    </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useEventsStore } from "~/stores/events"
import { useAuthStore } from "~/stores/auth"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Panel Organizador | CommunityHub"
})

const store = useEventsStore()
const authStore = useAuthStore()

const isOrganizer = computed(() => authStore.user?.role === "organizer")

const totalCreated = computed(() => store.events.length)

const upcomingCount = computed(() => {
  const now = Date.now()

  return store.events.filter(event => {
    return new Date(event.startDate).getTime() > now && event.status !== "cancelled"
  }).length
})

const cancelledCount = computed(() => {
  return store.events.filter(event => event.status === "cancelled").length
})

const totalCapacity = computed(() => {
  return store.events
    .filter(event => event.status === "draft" || event.status === "published")
    .reduce((sum, event) => sum + (event.capacity || 0), 0)
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  await store.fetchEvents({ mine: true })
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.organizer-page {
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

.organizer-page > main {
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

.information-message,
.error-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 13px 14px;
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

.loading-row {
  padding: 30px 0;
  font-size: 13px;
  color: var(--gray-text);
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border: 1px solid var(--gray-border);
  border-radius: 16px;
  background: var(--white);
}

.stat-card-muted {
  background: #faf9fc;
  border-style: dashed;
}

.stat-icon {
  margin-bottom: 8px;
  font-size: 22px;
}

.stat-card p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--gray-text);
}

.stat-card strong {
  display: block;
  font-size: 30px;
  color: var(--text-dark);
}

.stat-card small {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray-text);
}

.soon-badge {
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--purple-dark);
  border-radius: 999px;
  background: var(--purple-soft);
}

.shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.shortcut-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 20px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  color: var(--purple-dark);
  text-decoration: none;
  cursor: pointer;
  border: 1px solid #d5c8eb;
  border-radius: 12px;
  background: var(--white);
  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.shortcut-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.shortcut-primary {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
  box-shadow: 0 11px 25px rgba(124, 58, 237, 0.25);
}

.shortcut-primary:hover:not(:disabled) {
  background: var(--purple-dark);
}

.shortcut-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

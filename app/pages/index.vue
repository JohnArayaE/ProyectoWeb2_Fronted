<template>
  <div class="home-page">
    <AppHeader />

    <main class="home-content">
      <!-- Hero -->
      <section class="hero-section">
        <div class="hero-background hero-background-one" />
        <div class="hero-background hero-background-two" />

        <div class="hero-container">
          <div class="hero-information">
            <div class="welcome-badge">
              <span class="status-dot" />
              Tu comunidad te espera
            </div>

            <h1>
              Hola,
              <span>{{ authStore.user?.firstName || "Usuario" }}.</span>
            </h1>

            <h2>
              Descubre algo nuevo
              <strong>cerca de ti.</strong>
            </h2>

            <p class="hero-description">
              Explora actividades, encuentra nuevas experiencias
              y participa en los eventos que hacen crecer tu comunidad.
            </p>

            <!-- Buscador -->
            <form
              class="search-form"
              @submit.prevent="handleSearch"
            >
              <div class="search-field">
                <span
                  class="search-icon"
                  aria-hidden="true"
                >
                  ⌕
                </span>

                <input
                  v-model.trim="searchQuery"
                  type="search"
                  placeholder="¿Qué actividad estás buscando?"
                  aria-label="Buscar actividades"
                >
              </div>

              <button type="submit">
                Buscar
              </button>
            </form>

            <div class="hero-links">
              <NuxtLink
                class="primary-action"
                to="/actividades"
              >
                Explorar actividades

                <span aria-hidden="true">
                  →
                </span>
              </NuxtLink>

              <NuxtLink
                class="secondary-action"
                to="/mis-inscripciones"
              >
                Mis inscripciones
              </NuxtLink>
            </div>
          </div>

          <!-- Tarjeta usuario -->
          <div class="hero-profile-wrapper">
            <div class="profile-decoration" />

            <article class="profile-card">
              <div class="profile-top">
                <span class="profile-label">
                  Tu espacio
                </span>

                <span class="active-label">
                  <span />
                  Activo
                </span>
              </div>

              <div class="profile-avatar">
                <img
                  v-if="authStore.user?.profilePicture"
                  :src="authStore.user.profilePicture"
                  alt="Foto de perfil"
                >

                <span v-else>
                  {{ userInitial }}
                </span>
              </div>

              <div class="profile-information">
                <small>Bienvenido a CommunityHub</small>

                <h3>
                  {{ fullName }}
                </h3>

                <p>
                  {{ authStore.user?.email }}
                </p>
              </div>

              <div class="profile-divider" />

              <div class="profile-message">
                <span aria-hidden="true">
                  ◆
                </span>

                <p>
                  Encuentra actividades que conecten
                  con tus intereses y tu comunidad.
                </p>
              </div>

              <NuxtLink
                class="profile-action"
                to="/actividades"
              >
                Comenzar a explorar

                <span aria-hidden="true">
                  →
                </span>
              </NuxtLink>
            </article>
          </div>
        </div>
      </section>

      <!-- Acciones rápidas -->
      <section class="quick-section">
        <div class="section-container">
          <header class="section-header">
            <div>
              <span class="section-eyebrow">
                ACCESO RÁPIDO
              </span>

              <h2>
                Todo lo que necesitas
                <span>en un solo lugar.</span>
              </h2>
            </div>

            <p>
              Accede rápidamente a las principales
              funciones de tu cuenta.
            </p>
          </header>

          <div class="quick-grid">
            <NuxtLink
              v-for="item in quickActions"
              :key="item.to"
              :to="item.to"
              class="quick-card"
            >
              <div class="quick-card-top">
                <span
                  class="quick-icon"
                  aria-hidden="true"
                >
                  {{ item.icon }}
                </span>

                <span
                  class="quick-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>

              <div class="quick-card-content">
                <h3>
                  {{ item.title }}
                </h3>

                <p>
                  {{ item.description }}
                </p>
              </div>

              <span class="quick-card-link">
                {{ item.action }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>
      <!-- Dashboard de usuario -->
      <section
        v-if="isUserRole"
        class="dashboard-section"
      >
        <div class="section-container dashboard-container">
          <!-- a) Próximas actividades -->
          <div class="dashboard-block">
            <div class="dashboard-block-header">
              <h3>Próximas actividades</h3>

              <NuxtLink to="/actividades">
                Ver todas
              </NuxtLink>
            </div>

            <div
              v-if="upcoming.loading"
              class="dashboard-loading"
            >
              Cargando actividades...
            </div>

            <div
              v-else-if="upcoming.error"
              class="dashboard-error"
            >
              {{ upcoming.error }}
            </div>

            <div
              v-else-if="!upcoming.items.length"
              class="dashboard-empty"
            >
              No hay actividades próximas por el momento.
            </div>

            <ul
              v-else
              class="dashboard-list"
            >
              <li
                v-for="event in upcoming.items"
                :key="event.id"
              >
                <NuxtLink :to="`/actividades/${event.id}`">
                  <strong>{{ event.title }}</strong>
                  <span>{{ formatEventDate(event.startDate) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- b) Actividades inscritas -->
          <div class="dashboard-block">
            <div class="dashboard-block-header">
              <h3>Actividades inscritas</h3>

              <NuxtLink to="/mis-inscripciones">
                Ver todas
              </NuxtLink>
            </div>

            <div
              v-if="registrationsStore.loading"
              class="dashboard-loading"
            >
              Cargando inscripciones...
            </div>

            <div
              v-else-if="registrationsStore.error"
              class="dashboard-error"
            >
              {{ registrationsStore.error }}
            </div>

            <div
              v-else-if="!activeRegistrations.length"
              class="dashboard-empty"
            >
              Todavía no te inscribiste a ninguna actividad.
            </div>

            <ul
              v-else
              class="dashboard-list"
            >
              <li
                v-for="registration in activeRegistrations"
                :key="registration.id"
              >
                <NuxtLink :to="`/actividades/${registration.event.id}`">
                  <strong>{{ registration.event.title }}</strong>
                  <span>{{ formatEventDate(registration.event.startDate) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- c) Favoritos -->
          <div class="dashboard-block">
            <div class="dashboard-block-header">
              <h3>Favoritos</h3>

              <NuxtLink to="/favoritos">
                Ver todos
              </NuxtLink>
            </div>

            <div
              v-if="favoritesStore.loading"
              class="dashboard-loading"
            >
              Cargando favoritos...
            </div>

            <div
              v-else-if="favoritesStore.error"
              class="dashboard-error"
            >
              {{ favoritesStore.error }}
            </div>

            <div
              v-else-if="!favoritesPreview.length"
              class="dashboard-empty"
            >
              Todavía no tenés favoritos.
            </div>

            <ul
              v-else
              class="dashboard-list"
            >
              <li
                v-for="favorite in favoritesPreview"
                :key="favorite.id"
              >
                <NuxtLink :to="`/actividades/${favorite.event.id}`">
                  <strong>{{ favorite.event.title }}</strong>
                  <span>{{ formatEventDate(favorite.event.startDate) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- d) Historial -->
          <div class="dashboard-block">
            <div class="dashboard-block-header">
              <h3>Historial</h3>
            </div>

            <div
              v-if="registrationsStore.loading"
              class="dashboard-loading"
            >
              Cargando historial...
            </div>

            <div
              v-else-if="registrationsStore.error"
              class="dashboard-error"
            >
              {{ registrationsStore.error }}
            </div>

            <div
              v-else-if="!historyRegistrations.length"
              class="dashboard-empty"
            >
              Todavía no tenés actividades completadas en tu historial.
            </div>

            <ul
              v-else
              class="dashboard-list"
            >
              <li
                v-for="registration in historyRegistrations"
                :key="registration.id"
              >
                <NuxtLink :to="`/actividades/${registration.event.id}`">
                  <strong>{{ registration.event.title }}</strong>
                  <span>Completada · {{ formatEventDate(registration.event.startDate) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- e) Notificaciones -->
          <div class="dashboard-block dashboard-block-wide">
            <div class="dashboard-block-header">
              <h3>Notificaciones</h3>

              <NuxtLink to="/notifications">
                Ver todas
              </NuxtLink>
            </div>

            <div
              v-if="notificationsStore.loading"
              class="dashboard-loading"
            >
              Cargando notificaciones...
            </div>

            <div
              v-else-if="notificationsStore.error"
              class="dashboard-error"
            >
              {{ notificationsStore.error }}
            </div>

            <div
              v-else-if="!notificationsStore.notifications.length"
              class="dashboard-empty"
            >
              No tenés notificaciones todavía.
            </div>

            <ul
              v-else
              class="dashboard-notification-list"
            >
              <li
                v-for="notification in notificationsStore.notifications.slice(0, 5)"
                :key="notification.id"
                :class="{ unread: !notification.isRead }"
              >
                <div class="dashboard-notification-content">
                  <strong>{{ notification.title }}</strong>
                  <p>{{ notification.message }}</p>
                  <span class="dashboard-notification-date">
                    {{ formatNotificationDate(notification.createdAt) }}
                  </span>
                </div>

                <button
                  v-if="!notification.isRead"
                  type="button"
                  class="mark-read-button"
                  :disabled="notificationsStore.markingAsReadId === notification.id"
                  @click="handleMarkAsRead(notification.id)"
                >
                  {{
                    notificationsStore.markingAsReadId === notification.id
                      ? "Marcando..."
                      : "Marcar como leída"
                  }}
                </button>

                <span
                  v-else
                  class="dashboard-read-label"
                >
                  Leída
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth"
import { useRegistrationsStore } from "~/stores/registrations"
import { useFavoritesStore } from "~/stores/favorites"
import { useNotificationsStore } from "~/stores/notifications"
import { listEvents } from "~/services/eventService"
import type { EventItem } from "~/types/event"

definePageMeta({
  middleware: "auth"
})

type QuickAction = {
  title: string
  description: string
  action: string
  icon: string
  to: string
}

const authStore = useAuthStore()
const registrationsStore = useRegistrationsStore()
const favoritesStore = useFavoritesStore()
const notificationsStore = useNotificationsStore()

const searchQuery = ref("")

const isUserRole = computed(() => {
  return authStore.user?.role === "user"
})

const upcoming = reactive({
  items: [] as EventItem[],
  loading: false,
  error: ""
})

const activeRegistrations = computed(() => {
  return registrationsStore.registrations.filter(
    registration => registration.status === "registered"
  )
})

const historyRegistrations = computed(() => {
  return registrationsStore.registrations.filter(
    registration => registration.event?.status === "completed"
  )
})

const favoritesPreview = computed(() => {
  return favoritesStore.favorites.slice(0, 5)
})

const userInitial = computed(() => {
  return (
    authStore.user?.firstName
      ?.charAt(0)
      .toUpperCase() || "U"
  )
})

const fullName = computed(() => {
  if (!authStore.user) {
    return "Usuario"
  }

  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const quickActions: QuickAction[] = [
  {
    title: "Explorar actividades",
    description:
      "Descubre eventos y actividades disponibles en tu comunidad.",
    action: "Ver actividades",
    icon: "⌕",
    to: "/actividades"
  },
  {
    title: "Mis inscripciones",
    description:
      "Consulta las actividades en las que ya reservaste tu espacio.",
    action: "Ver inscripciones",
    icon: "✓",
    to: "/mis-inscripciones"
  },
  {
    title: "Mis favoritos",
    description:
      "Encuentra rápidamente las actividades que guardaste.",
    action: "Ver favoritos",
    icon: "★",
    to: "/favoritos"
  }
]

async function handleSearch() {
  if (!searchQuery.value) {
    await navigateTo("/actividades")
    return
  }

  await navigateTo({
    path: "/actividades",
    query: {
      search: searchQuery.value
    }
  })
}

function todayDateParam() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")

  return `${yyyy}-${mm}-${dd}`
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

function formatNotificationDate(value?: string) {
  if (!value) {
    return ""
  }

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

async function loadUpcomingEvents() {
  upcoming.loading = true
  upcoming.error = ""

  try {
    const data = await listEvents({
      date: todayDateParam(),
      limit: 20
    })

    upcoming.items = [...data.events]
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 5)
  } catch (error: any) {
    upcoming.error =
      error?.message || "No fue posible cargar las próximas actividades."
  } finally {
    upcoming.loading = false
  }
}

async function handleMarkAsRead(notificationId: string) {
  await notificationsStore.markAsRead(notificationId)
}

onMounted(() => {
  if (!isUserRole.value) {
    return
  }

  loadUpcomingEvents()
  registrationsStore.fetchMyRegistrations()
  favoritesStore.fetchFavorites()
  notificationsStore.fetchNotifications()
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

.home-page {
  --black: #09090b;
  --black-soft: #111116;
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;
  --gray-background: #f4f2f8;
  --gray-border: #ddd8e7;
  --gray-text: #716b7d;
  --text-dark: #17131f;

  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
  color: var(--text-dark);
  background: var(--gray-background);
}

.home-content {
  width: 100%;
}

/* =========================
   HERO
========================= */

.hero-section {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 90% 15%,
      rgba(124, 58, 237, 0.2),
      transparent 26%
    ),
    linear-gradient(
      135deg,
      #08080b 0%,
      #111016 52%,
      #1d1031 100%
    );
}

.hero-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.25fr)
    minmax(340px, 0.75fr);
  gap: 80px;
  align-items: center;
  width: min(1250px, calc(100% - 48px));
  min-height: 620px;
  padding: 75px 0;
  margin: 0 auto;
}

.hero-information {
  max-width: 720px;
}

.welcome-badge {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  padding: 8px 13px;
  margin-bottom: 23px;
  font-size: 9px;
  font-weight: 900;
  color: #ddd6fe;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  border: 1px solid rgba(167, 139, 250, 0.23);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.11);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--purple-light);
  box-shadow:
    0 0 12px rgba(167, 139, 250, 0.8);
}

.hero-information h1 {
  margin: 0 0 5px;
  font-size: 17px;
  font-weight: 700;
  color: #bdb6c6;
}

.hero-information h1 span {
  color: var(--purple-light);
}

.hero-information h2 {
  max-width: 700px;
  margin: 0;
  font-size: clamp(48px, 6vw, 76px);
  line-height: 0.98;
  color: var(--white);
  letter-spacing: -3px;
}

.hero-information h2 strong {
  display: block;
  color: var(--purple-light);
}

.hero-description {
  max-width: 600px;
  margin: 27px 0 30px;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.62);
}

/* =========================
   Buscador
========================= */

.search-form {
  display: flex;
  gap: 10px;
  max-width: 650px;
  padding: 7px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(15px);
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  color: var(--purple-light);
}

.search-field input {
  width: 100%;
  min-height: 53px;
  padding: 13px 15px 13px 48px;
  font: inherit;
  font-size: 13px;
  color: var(--white);
  outline: none;
  border: 0;
  border-radius: 11px;
  background: transparent;
}

.search-field input::placeholder {
  color: #90899a;
}

.search-field input:focus {
  box-shadow:
    inset 0 0 0 1px
    rgba(167, 139, 250, 0.45);
}

.search-form button {
  min-width: 115px;
  padding: 12px 20px;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 11px;
  background: var(--purple);
  transition:
    background 180ms ease,
    transform 180ms ease;
}

.search-form button:hover {
  background: var(--purple-dark);
  transform: translateY(-1px);
}

/* =========================
   Acciones del Hero
========================= */

.hero-links {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 22px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 45px;
  padding: 11px 17px;
  font-size: 10px;
  font-weight: 900;
  text-decoration: none;
  border-radius: 10px;
  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.primary-action {
  color: var(--white);
  border: 1px solid var(--purple);
  background: var(--purple);
}

.secondary-action {
  color: #ddd7e5;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-2px);
}

.secondary-action:hover {
  color: var(--white);
  border-color: rgba(167, 139, 250, 0.3);
  background: rgba(124, 58, 237, 0.1);
}

/* =========================
   Tarjeta de perfil
========================= */

.hero-profile-wrapper {
  position: relative;
  display: grid;
  place-items: center;
}

.profile-decoration {
  position: absolute;
  width: 420px;
  height: 420px;
  border: 1px solid rgba(167, 139, 250, 0.17);
  border-radius: 50%;
}

.profile-card {
  position: relative;
  z-index: 2;
  width: min(100%, 360px);
  padding: 28px;
  overflow: hidden;
  border: 1px solid rgba(167, 139, 250, 0.21);
  border-radius: 24px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.045)
    );
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(22px);
}

.profile-card::after {
  position: absolute;
  right: -90px;
  bottom: -110px;
  width: 230px;
  height: 230px;
  content: "";
  border: 45px solid rgba(124, 58, 237, 0.08);
  border-radius: 50%;
}

.profile-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-label {
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.active-label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 8px;
  font-weight: 800;
  color: #b9b2c1;
}

.active-label span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--purple-light);
  box-shadow:
    0 0 9px rgba(167, 139, 250, 0.8);
}

.profile-avatar {
  position: relative;
  z-index: 2;
  display: grid;
  width: 82px;
  height: 82px;
  margin: 31px 0 18px;
  overflow: hidden;
  font-size: 31px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border: 2px solid rgba(167, 139, 250, 0.35);
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple-dark)
    );
  box-shadow:
    0 16px 35px rgba(124, 58, 237, 0.25);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-information {
  position: relative;
  z-index: 2;
}

.profile-information small {
  display: block;
  margin-bottom: 5px;
  font-size: 8px;
  color: #938b9e;
}

.profile-information h3 {
  margin: 0 0 6px;
  font-size: 23px;
  color: var(--white);
}

.profile-information p {
  margin: 0;
  font-size: 10px;
  color: #a59ead;
}

.profile-divider {
  position: relative;
  z-index: 2;
  height: 1px;
  margin: 23px 0;
  background: rgba(255, 255, 255, 0.09);
}

.profile-message {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.profile-message span {
  color: var(--purple-light);
}

.profile-message p {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #a49da9;
}

.profile-action {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 47px;
  padding: 11px 14px;
  margin-top: 22px;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  text-decoration: none;
  border: 1px solid rgba(167, 139, 250, 0.23);
  border-radius: 11px;
  background: rgba(124, 58, 237, 0.12);
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.profile-action:hover {
  border-color: var(--purple);
  background: var(--purple);
}

/* =========================
   Decoraciones del Hero
========================= */

.hero-background {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.hero-background-one {
  top: -180px;
  right: -100px;
  width: 480px;
  height: 480px;
  border: 1px solid rgba(167, 139, 250, 0.13);
}

.hero-background-two {
  bottom: -280px;
  left: 38%;
  width: 520px;
  height: 520px;
  border: 100px solid rgba(124, 58, 237, 0.035);
}

/* =========================
   Acciones rápidas
========================= */

.section-container {
  width: min(1250px, calc(100% - 48px));
  margin: 0 auto;
}

.quick-section {
  padding: 90px 0 100px;
  background:
    radial-gradient(
      circle at 5% 50%,
      rgba(124, 58, 237, 0.08),
      transparent 24%
    ),
    var(--gray-background);
}

.section-header {
  display: flex;
  gap: 40px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 37px;
}

.section-eyebrow {
  display: inline-block;
  margin-bottom: 13px;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  letter-spacing: 1.7px;
}

.section-header h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 45px);
  line-height: 1.05;
  letter-spacing: -1.7px;
}

.section-header h2 span {
  display: block;
  color: var(--purple);
}

.section-header > p {
  max-width: 350px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--gray-text);
}

.quick-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.quick-card {
  position: relative;
  display: flex;
  min-height: 245px;
  padding: 25px;
  overflow: hidden;
  flex-direction: column;
  color: var(--text-dark);
  text-decoration: none;
  border: 1px solid #dfdae7;
  border-radius: 20px;
  background: var(--white);
  box-shadow:
    0 13px 35px rgba(33, 21, 50, 0.07);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.quick-card::after {
  position: absolute;
  right: -60px;
  bottom: -90px;
  width: 180px;
  height: 180px;
  content: "";
  border: 36px solid rgba(124, 58, 237, 0.05);
  border-radius: 50%;
}

.quick-card:hover {
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow:
    0 20px 45px rgba(91, 33, 182, 0.13);
  transform: translateY(-5px);
}

.quick-card-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quick-icon {
  display: grid;
  width: 49px;
  height: 49px;
  font-size: 20px;
  font-weight: 900;
  color: var(--purple);
  place-items: center;
  border: 1px solid #d9ccef;
  border-radius: 14px;
  background: var(--purple-soft);
}

.quick-arrow {
  font-size: 18px;
  color: #aaa3b2;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.quick-card:hover .quick-arrow {
  color: var(--purple);
  transform:
    translate(2px, -2px);
}

.quick-card-content {
  position: relative;
  z-index: 2;
  margin-top: 35px;
}

.quick-card-content h3 {
  margin: 0 0 10px;
  font-size: 19px;
}

.quick-card-content p {
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: var(--gray-text);
}

.quick-card-link {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding-top: 24px;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* =========================
   Dashboard de usuario
========================= */

.dashboard-section {
  padding: 0 0 100px;
  background: var(--gray-background);
}

.dashboard-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-block {
  display: flex;
  flex-direction: column;
  padding: 22px;
  border: 1px solid var(--gray-border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 30px rgba(33, 21, 50, 0.06);
}

.dashboard-block-wide {
  grid-column: span 2;
}

.dashboard-block-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.dashboard-block-header h3 {
  margin: 0;
  font-size: 15px;
}

.dashboard-block-header a {
  font-size: 10px;
  font-weight: 800;
  color: var(--purple-dark);
  text-decoration: none;
  white-space: nowrap;
}

.dashboard-block-header a:hover {
  text-decoration: underline;
}

.dashboard-loading,
.dashboard-error,
.dashboard-empty {
  font-size: 12px;
  line-height: 1.6;
  color: var(--gray-text);
}

.dashboard-error {
  color: #b93d52;
}

.dashboard-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dashboard-list a {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 11px 13px;
  color: inherit;
  text-decoration: none;
  border: 1px solid var(--gray-border);
  border-radius: 12px;
  transition: border-color 160ms ease, background 160ms ease;
}

.dashboard-list a:hover {
  border-color: rgba(124, 58, 237, 0.3);
  background: var(--purple-soft);
}

.dashboard-list a strong {
  font-size: 12px;
}

.dashboard-list a span {
  font-size: 10px;
  color: var(--gray-text);
}

.dashboard-notification-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dashboard-notification-list li {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 13px;
  border: 1px solid var(--gray-border);
  border-radius: 12px;
}

.dashboard-notification-list li.unread {
  border-color: #c8b2ed;
  background: #f7f3ff;
}

.dashboard-notification-content {
  min-width: 0;
}

.dashboard-notification-content strong {
  display: block;
  font-size: 12px;
}

.dashboard-notification-content p {
  margin: 4px 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray-text);
}

.dashboard-notification-date {
  font-size: 9px;
  color: #9a949f;
}

.mark-read-button {
  flex: 0 0 auto;
  padding: 8px 12px;
  font: inherit;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid #d7cce9;
  border-radius: 9px;
  background: var(--white);
}

.mark-read-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.mark-read-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dashboard-read-label {
  flex: 0 0 auto;
  font-size: 9px;
  font-weight: 800;
  color: #99929f;
}

@media (max-width: 800px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }

  .dashboard-block-wide {
    grid-column: span 1;
  }
}

/* =========================
   Accesibilidad
========================= */

.primary-action:focus-visible,
.secondary-action:focus-visible,
.quick-card:focus-visible,
.profile-action:focus-visible,
.search-form button:focus-visible {
  outline:
    3px solid
    rgba(167, 139, 250, 0.4);
  outline-offset: 3px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 1000px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 55px;
    padding: 70px 0;
  }

  .hero-information {
    max-width: 800px;
  }

  .hero-profile-wrapper {
    justify-content: start;
  }

  .profile-card {
    width: min(100%, 500px);
  }

  .profile-decoration {
    left: 80px;
  }
}

@media (max-width: 800px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .quick-card {
    min-height: 215px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-header > p {
    max-width: 500px;
  }
}

@media (max-width: 620px) {
  .hero-container,
  .section-container {
    width: calc(100% - 36px);
  }

  .hero-container {
    min-height: auto;
    padding: 55px 0;
  }

  .hero-information h2 {
    font-size: 47px;
    letter-spacing: -2px;
  }

  .hero-description {
    font-size: 14px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form button {
    width: 100%;
    min-height: 48px;
  }

  .hero-links {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .profile-decoration {
    display: none;
  }

  .profile-card {
    padding: 23px;
  }

  .quick-section {
    padding: 65px 0;
  }

  .section-header h2 {
    font-size: 34px;
  }
}

@media (max-width: 390px) {
  .hero-information h2 {
    font-size: 40px;
  }

  .welcome-badge {
    font-size: 8px;
  }
}
</style>
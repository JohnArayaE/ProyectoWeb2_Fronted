<template>
  <div class="notifications-page">
    <AppHeader />

    <main>
      <section class="hero-section">
        <div class="hero-container">
          <div>
            <div class="page-badge">
              <span />
              NOTIFICACIONES
            </div>

            <h1>
              Mantente al día con tu
              <strong>comunidad.</strong>
            </h1>

            <p>
              Consulta recordatorios y novedades relacionadas con
              las actividades en las que participas.
            </p>
          </div>

          <div class="hero-summary">
            <span>Sin leer</span>

            <strong>
              {{ store.unreadCount }}
            </strong>

            <small>
              {{
                store.unreadCount === 1
                  ? "notificación pendiente"
                  : "notificaciones pendientes"
              }}
            </small>
          </div>
        </div>
      </section>

      <section class="notifications-section">
        <div class="container">
          <header class="section-header">
            <div>
              <span>
                TU CUENTA
              </span>

              <h2>
                Tus
                <strong>notificaciones.</strong>
              </h2>
            </div>

            <p>
              Las notificaciones nuevas aparecerán destacadas.
              Al abrirlas se marcarán automáticamente como leídas.
            </p>
          </header>

          <div class="toolbar">
            <div class="filter-buttons">
              <button
                type="button"
                class="filter-button"
                :class="{ active: selectedFilter === 'all' }"
                @click="selectedFilter = 'all'"
              >
                Todas
              </button>

              <button
                type="button"
                class="filter-button"
                :class="{ active: selectedFilter === 'unread' }"
                @click="selectedFilter = 'unread'"
              >
                Sin leer
                <span v-if="store.unreadCount">
                  {{ store.unreadCount }}
                </span>
              </button>
            </div>

            <button
              class="refresh-button"
              type="button"
              :disabled="store.loading"
              @click="loadNotifications"
            >
              {{ store.loading ? "Actualizando..." : "Actualizar" }}
            </button>
          </div>

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
            class="loading-state"
          >
            <div class="loader" />

            <p>
              Cargando notificaciones...
            </p>
          </div>

          <div
            v-else-if="filteredNotifications.length === 0"
            class="empty-state"
          >
            <div class="empty-icon">
              🔔
            </div>

            <h3>
              {{
                selectedFilter === "unread"
                  ? "No tienes notificaciones pendientes"
                  : "Todavía no tienes notificaciones"
              }}
            </h3>

            <p>
              {{
                selectedFilter === "unread"
                  ? "Ya revisaste todas tus notificaciones."
                  : "Cuando tengas una novedad aparecerá en esta sección."
              }}
            </p>
          </div>

          <div
            v-else
            class="notifications-list"
          >
            <article
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-card"
              :class="{
                unread: !notification.isRead
              }"
              @click="openNotification(notification)"
            >
              <div class="notification-icon">
                {{ getNotificationIcon(notification.type) }}
              </div>

              <div class="notification-content">
                <div class="notification-top">
                  <div class="notification-title">
                    <span
                      v-if="!notification.isRead"
                      class="unread-dot"
                    />

                    <h3>
                      {{ notification.title }}
                    </h3>
                  </div>

                  <span class="notification-date">
                    {{ formatDate(notification.createdAt) }}
                  </span>
                </div>

                <p class="notification-message">
                  {{ notification.message }}
                </p>

                <div
                  v-if="hasEventData(notification.event)"
                  class="event-card"
                >
                  <div class="event-info">
                    <span class="event-label">
                      ACTIVIDAD RELACIONADA
                    </span>

                    <strong>
                      {{ notification.event.title }}
                    </strong>

                    <div class="event-meta">
                      <span>
                        📅
                        {{ formatEventDate(notification.event.startDate) }}
                      </span>

                      <span>
                        📍
                        {{ modalityLabel(notification.event.modality) }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="notification.event.imageUrl"
                    class="event-image"
                  >
                    <img
                      :src="notification.event.imageUrl"
                      :alt="notification.event.title"
                    >
                  </div>
                </div>

                <div class="notification-footer">
                  <span
                    class="notification-type"
                  >
                    {{ typeLabel(notification.type) }}
                  </span>

                  <span
                    class="read-status"
                    :class="{
                      read: notification.isRead
                    }"
                  >
                    {{
                      store.markingAsReadId === notification.id
                        ? "Marcando..."
                        : notification.isRead
                          ? "Leída"
                          : "Nueva"
                    }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from "~/stores/notifications"

import type {
  NotificationEvent,
  NotificationItem,
  NotificationType
} from "~/types/notification"

definePageMeta({
  middleware: "auth"
})

useHead({
  title: "Notificaciones | CommunityHub"
})

const store = useNotificationsStore()

const selectedFilter =
  ref<"all" | "unread">("all")

const filteredNotifications = computed(() => {
  if (selectedFilter.value === "unread") {
    return store.notifications.filter(
      notification => !notification.isRead
    )
  }

  return store.notifications
})

function hasEventData(
  event: NotificationItem["event"]
): event is NotificationEvent {
  return (
    event !== null &&
    typeof event === "object"
  )
}

function getNotificationIcon(
  type: NotificationType
) {
  const icons: Record<NotificationType, string> = {
    registration: "✓",
    "event-update": "✎",
    "event-cancelled": "!",
    "event-reminder": "🔔",
    system: "i"
  }

  return icons[type]
}

function typeLabel(
  type: NotificationType
) {
  const labels: Record<NotificationType, string> = {
    registration: "Inscripción",
    "event-update": "Actualización",
    "event-cancelled": "Actividad cancelada",
    "event-reminder": "Recordatorio",
    system: "Sistema"
  }

  return labels[type]
}

function modalityLabel(
  modality: NotificationEvent["modality"]
) {
  const labels = {
    "in-person": "Presencial",
    virtual: "Virtual",
    hybrid: "Híbrida"
  }

  return labels[modality]
}

function formatDate(
  value?: string
) {
  if (!value) {
    return ""
  }

  return new Date(value).toLocaleString(
    "es-CR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  )
}

function formatEventDate(
  value: string
) {
  return new Date(value).toLocaleString(
    "es-CR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  )
}

async function openNotification(
  notification: NotificationItem
) {
  if (
    notification.isRead ||
    store.markingAsReadId === notification.id
  ) {
    return
  }

  await store.markAsRead(
    notification.id
  )
}

async function loadNotifications() {
  await store.fetchNotifications()
}

onMounted(() => {
  loadNotifications()
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

.notifications-page {
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;
  --gray-background: #f4f2f8;
  --gray-border: #ddd8e7;
  --gray-text: #716b7d;
  --text-dark: #17131f;

  min-height: 100vh;
  font-family: Inter, Arial, Helvetica, sans-serif;
  color: var(--text-dark);
  background: var(--gray-background);
}

.hero-section {
  color: var(--white);
  background:
    radial-gradient(
      circle at 88% 10%,
      rgba(124, 58, 237, 0.25),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #09090b,
      #1d1031
    );
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 60px;
  align-items: center;
  width: min(1200px, calc(100% - 48px));
  min-height: 320px;
  margin: auto;
  padding: 55px 0;
}

.page-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 13px;
  margin-bottom: 20px;
  font-size: 9px;
  font-weight: 900;
  color: #ddd6fe;
  letter-spacing: 1.4px;
  border: 1px solid rgba(167, 139, 250, 0.23);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.11);
}

.page-badge span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--purple-light);
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.8);
}

.hero-container h1 {
  max-width: 720px;
  margin: 0;
  font-size: clamp(42px, 5vw, 62px);
  line-height: 1;
  letter-spacing: -2px;
}

.hero-container h1 strong {
  display: block;
  color: var(--purple-light);
}

.hero-container > div > p {
  max-width: 620px;
  margin: 22px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #aaa3b2;
}

.hero-summary {
  padding: 25px;
  border: 1px solid rgba(167, 139, 250, 0.22);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.07);
}

.hero-summary span,
.hero-summary strong,
.hero-summary small {
  display: block;
}

.hero-summary span {
  font-size: 9px;
  font-weight: 800;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-summary strong {
  margin: 9px 0 4px;
  font-size: 42px;
}

.hero-summary small {
  font-size: 10px;
  color: #aaa3b2;
}

.container {
  width: min(1000px, calc(100% - 48px));
  margin: auto;
  padding: 70px 0 90px;
}

.section-header {
  display: flex;
  gap: 40px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
}

.section-header > div > span {
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  letter-spacing: 1.6px;
}

.section-header h2 {
  margin: 10px 0 0;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -1.5px;
}

.section-header h2 strong {
  color: var(--purple);
}

.section-header > p {
  max-width: 370px;
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: var(--gray-text);
}

.toolbar {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-button {
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 10px 14px;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  color: var(--gray-text);
  cursor: pointer;
  border: 1px solid var(--gray-border);
  border-radius: 10px;
  background: var(--white);
}

.filter-button.active {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.filter-button span {
  display: grid;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  font-size: 9px;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.refresh-button {
  padding: 11px 17px;
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: var(--purple-dark);
  cursor: pointer;
  border: 1px solid #d7cce9;
  border-radius: 10px;
  background: var(--white);
}

.refresh-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.notifications-list {
  display: grid;
  gap: 13px;
}

.notification-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 15px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid var(--gray-border);
  border-radius: 17px;
  background: var(--white);
  box-shadow: 0 8px 25px rgba(34, 22, 48, 0.04);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  border-color: #cabce1;
  box-shadow: 0 12px 30px rgba(34, 22, 48, 0.08);
}

.notification-card.unread {
  border-color: #c8b2ed;
  background:
    linear-gradient(
      90deg,
      #f7f3ff,
      #ffffff 28%
    );
}

.notification-icon {
  display: grid;
  width: 48px;
  height: 48px;
  font-size: 17px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 14px;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple-dark)
    );
}

.notification-content {
  min-width: 0;
}

.notification-top {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  justify-content: space-between;
}

.notification-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notification-title h3 {
  margin: 0;
  font-size: 14px;
}

.unread-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--purple);
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
}

.notification-date {
  flex: 0 0 auto;
  font-size: 9px;
  color: #9a949f;
}

.notification-message {
  margin: 8px 0 13px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--gray-text);
}

.event-card {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  padding: 13px;
  margin-bottom: 13px;
  border: 1px solid #e3dced;
  border-radius: 12px;
  background: #faf8fd;
}

.event-info {
  min-width: 0;
}

.event-label {
  display: block;
  margin-bottom: 5px;
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-dark);
  letter-spacing: 1px;
}

.event-info strong {
  display: block;
  margin-bottom: 7px;
  font-size: 11px;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 9px;
  color: var(--gray-text);
}

.event-image {
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 9px;
  background: #ece8f1;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notification-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.notification-type {
  padding: 5px 9px;
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-dark);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-radius: 999px;
  background: var(--purple-soft);
}

.read-status {
  font-size: 9px;
  font-weight: 800;
  color: var(--purple);
}

.read-status.read {
  color: #99929f;
}

.error-message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 13px 15px;
  margin-bottom: 18px;
  color: #8a2d3c;
  border: 1px solid #eccbd1;
  border-radius: 12px;
  background: #fff4f5;
}

.error-message span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #b93d52;
}

.error-message p {
  margin: 0;
  font-size: 11px;
}

.loading-state,
.empty-state {
  display: grid;
  min-height: 280px;
  padding: 40px;
  text-align: center;
  place-items: center;
  border: 1px solid var(--gray-border);
  border-radius: 18px;
  background: var(--white);
}

.loading-state {
  align-content: center;
  gap: 14px;
}

.loading-state p,
.empty-state p {
  margin: 0;
  font-size: 11px;
  color: var(--gray-text);
}

.loader {
  width: 34px;
  height: 34px;
  border: 3px solid #e1d9ed;
  border-top-color: var(--purple);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.empty-state {
  align-content: center;
  gap: 8px;
}

.empty-icon {
  margin-bottom: 5px;
  font-size: 32px;
}

.empty-state h3 {
  margin: 0;
  font-size: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-summary {
    max-width: 350px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .hero-container,
  .container {
    width: calc(100% - 36px);
  }

  .hero-container {
    min-height: auto;
    padding: 45px 0;
  }

  .hero-container h1 {
    font-size: 42px;
  }

  .container {
    padding: 55px 0 70px;
  }

  .section-header h2 {
    font-size: 34px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-button {
    justify-content: center;
    flex: 1;
  }

  .refresh-button {
    min-height: 43px;
  }

  .notification-card {
    grid-template-columns: 40px 1fr;
    padding: 16px;
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
  }

  .notification-top {
    flex-direction: column;
    gap: 5px;
  }

  .event-image {
    display: none;
  }
}
</style>
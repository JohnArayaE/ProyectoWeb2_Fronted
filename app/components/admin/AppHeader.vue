<template>
  <header class="site-header">
    <div class="navbar">
      <!-- Marca -->
      <NuxtLink
        to="/"
        class="brand"
        aria-label="Ir a la página principal"
        @click="closeMobileMenu"
      >
        <span class="brand-icon" aria-hidden="true">
          C
        </span>

        <div class="brand-information">
          <small>PLATAFORMA COMUNITARIA</small>
          <strong>CommunityHub</strong>
        </div>
      </NuxtLink>

      <!-- Navegación de escritorio -->
      <nav
        class="desktop-navigation"
        aria-label="Navegación principal"
      >
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="navigation-link"
          :class="{
            'active-navigation-link': isNavigationItemActive(item)
          }"
          :aria-current="
            isNavigationItemActive(item)
              ? 'page'
              : undefined
          "
        >
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>

          <span>
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Usuario / acciones -->
      <div class="desktop-actions">
        <div class="user-information">
          <div class="user-avatar">
            <img
              v-if="authStore.user?.profilePicture"
              :src="authStore.user.profilePicture"
              alt="Foto de perfil"
            >

            <span v-else>
              {{ userInitial }}
            </span>
          </div>

          <div class="user-details">
            <span>Hola,</span>

            <strong>
              {{ authStore.user?.firstName || "Usuario" }}
            </strong>
          </div>
        </div>

        <span
          class="actions-separator"
          aria-hidden="true"
        />

        <button
          class="logout-button"
          type="button"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          <span
            class="logout-icon"
            aria-hidden="true"
          >
            ↪
          </span>

          <span>
            {{ isLoggingOut ? "Saliendo..." : "Salir" }}
          </span>
        </button>
      </div>

      <!-- Botón móvil -->
      <button
        type="button"
        class="mobile-menu-button"
        :class="{
          'mobile-menu-button-open': mobileMenuOpen
        }"
        :aria-expanded="mobileMenuOpen"
        :aria-label="
          mobileMenuOpen
            ? 'Cerrar menú de navegación'
            : 'Abrir menú de navegación'
        "
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <!-- Navegación móvil -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="mobile-navigation"
      >
        <div class="mobile-navigation-content">
          <!-- Usuario móvil -->
          <div class="mobile-user">
            <div class="mobile-user-avatar">
              <img
                v-if="authStore.user?.profilePicture"
                :src="authStore.user.profilePicture"
                alt="Foto de perfil"
              >

              <span v-else>
                {{ userInitial }}
              </span>
            </div>

            <div>
              <small>Sesión iniciada como</small>

              <strong>
                {{ fullName }}
              </strong>
            </div>
          </div>

          <span class="mobile-section-label">
            Navegación
          </span>

          <nav
            class="mobile-links"
            aria-label="Navegación móvil"
          >
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="mobile-link"
              :class="{
                'active-mobile-link': isNavigationItemActive(item)
              }"
              @click="closeMobileMenu"
            >
              <span
                class="mobile-link-icon"
                aria-hidden="true"
              >
                {{ item.icon }}
              </span>

              <strong>
                {{ item.label }}
              </strong>

              <span
                class="mobile-link-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </NuxtLink>
          </nav>

          <button
            type="button"
            class="mobile-logout-button"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            <span aria-hidden="true">
              ↪
            </span>

            {{
              isLoggingOut
                ? "Cerrando sesión..."
                : "Cerrar sesión"
            }}
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">

import { useAuthStore } from "~/stores/auth"

type NavigationItem = {
  label: string
  to: string
  icon: string
}

const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const isLoggingOut = ref(false)

const navigationItems: NavigationItem[] = [

  {
    label: "Inicio",
    to: "/admin",
    icon: "⌂"
  },

  {
    label: "Usuarios",
    to: "/admin/users",
    icon: "👥"
  },

  {
    label: "Actividades",
    to: "/admin/activities",
    icon: "⌕"
  },

  {
    label: "Categorías",
    to: "/admin/categories",
    icon: "◆"
  },

  {
    label: "Estadísticas",
    to: "/admin/statistics",
    icon: "★"
  }

]


const userInitial = computed(() => {

  return (
    authStore.user?.firstName
      ?.charAt(0)
      .toUpperCase() || "A"
  )

})


const fullName = computed(() => {

  if (!authStore.user) {
    return "Administrador"
  }

  return `${authStore.user.firstName} ${authStore.user.lastName}`

})


function isNavigationItemActive(
  item: NavigationItem
): boolean {

  if (item.to === "/admin") {

    return route.path === "/admin"

  }

  return (
    route.path === item.to ||
    route.path.startsWith(`${item.to}/`)
  )

}


function closeMobileMenu() {

  mobileMenuOpen.value = false

}


async function handleLogout() {

  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  closeMobileMenu()

  authStore.logout()

  await navigateTo("/login", {
    external: true
  })

}


function handleEscapeKey(event: KeyboardEvent) {

  if (event.key === "Escape") {

    closeMobileMenu()

  }

}


watch(
  () => route.fullPath,
  () => {

    closeMobileMenu()

  }
)


onMounted(() => {

  document.addEventListener(
    "keydown",
    handleEscapeKey
  )

})


onBeforeUnmount(() => {

  document.removeEventListener(
    "keydown",
    handleEscapeKey
  )

})


</script>

<style scoped>
.site-header {
  --black: #09090b;
  --black-soft: #111116;
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;

  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  color: var(--white);
  border-bottom: 1px solid rgba(167, 139, 250, 0.22);
  background:
    radial-gradient(
      circle at 80% -60%,
      rgba(124, 58, 237, 0.23),
      transparent 40%
    ),
    linear-gradient(
      110deg,
      #08080b 0%,
      #111016 55%,
      #160d25 100%
    );
  box-shadow:
    0 12px 35px rgba(9, 9, 11, 0.18);
}

.navbar {
  display: flex;
  gap: 30px;
  align-items: center;
  width: min(1250px, calc(100% - 48px));
  min-height: 78px;
  margin: 0 auto;
}

/* =========================
   Marca
========================= */

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 0 0 auto;
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  width: 47px;
  height: 47px;
  flex: 0 0 auto;
  font-size: 21px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border: 1px solid rgba(167, 139, 250, 0.38);
  border-radius: 14px;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple)
    );
  box-shadow:
    0 8px 24px rgba(124, 58, 237, 0.25);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.brand:hover .brand-icon {
  box-shadow:
    0 11px 28px rgba(124, 58, 237, 0.35);
  transform:
    translateY(-2px)
    rotate(-4deg);
}

.brand-information {
  min-width: max-content;
}

.brand small,
.brand strong {
  display: block;
}

.brand small {
  margin-bottom: 2px;
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-light);
  letter-spacing: 1.6px;
}

.brand strong {
  font-size: 17px;
  color: var(--white);
  letter-spacing: -0.3px;
}

/* =========================
   Navegación
========================= */

.desktop-navigation {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.navigation-link {
  position: relative;
  display: flex;
  gap: 7px;
  align-items: center;
  min-height: 43px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 800;
  color: #c9c5d0;
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 11px;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.navigation-link:hover {
  color: var(--white);
  border-color: rgba(167, 139, 250, 0.2);
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}

.navigation-icon {
  display: grid;
  width: 23px;
  height: 23px;
  font-size: 11px;
  font-weight: 900;
  color: var(--purple-light);
  place-items: center;
  border-radius: 7px;
  background: rgba(124, 58, 237, 0.12);
}

.active-navigation-link {
  color: var(--white);
  border-color: rgba(167, 139, 250, 0.28);
  background: rgba(124, 58, 237, 0.14);
}

.active-navigation-link::after {
  position: absolute;
  right: 11px;
  bottom: -2px;
  left: 11px;
  height: 2px;
  content: "";
  border-radius: 999px;
  background: var(--purple-light);
}

.active-navigation-link .navigation-icon {
  color: var(--white);
  background: var(--purple);
}

/* =========================
   Usuario
========================= */

.desktop-actions {
  display: flex;
  gap: 13px;
  align-items: center;
  flex: 0 0 auto;
}

.user-information {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-avatar,
.mobile-user-avatar {
  display: grid;
  overflow: hidden;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple-dark)
    );
}

.user-avatar {
  width: 39px;
  height: 39px;
  font-size: 14px;
}

.user-avatar img,
.mobile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: grid;
  gap: 1px;
}

.user-details span {
  font-size: 8px;
  color: #928c9b;
}

.user-details strong {
  max-width: 100px;
  overflow: hidden;
  font-size: 11px;
  color: var(--white);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-separator {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.12);
}

/* =========================
   Cerrar sesión
========================= */

.logout-button {
  display: flex;
  gap: 7px;
  align-items: center;
  min-height: 42px;
  padding: 9px 13px;
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 10px;
  background: var(--purple);
  box-shadow:
    0 7px 18px rgba(124, 58, 237, 0.19);
  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.logout-button:hover:not(:disabled) {
  color: var(--purple-dark);
  border-color: var(--white);
  background: var(--white);
  transform: translateY(-2px);
}

.logout-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.logout-icon {
  font-size: 13px;
}

/* =========================
   Botón móvil
========================= */

.mobile-menu-button {
  display: none;
  width: 44px;
  height: 42px;
  padding: 10px;
  cursor: pointer;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 11px;
  background: rgba(124, 58, 237, 0.1);
}

.mobile-menu-button span {
  display: block;
  width: 100%;
  height: 2px;
  margin: 4px 0;
  border-radius: 999px;
  background: var(--purple-light);
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.mobile-menu-button-open span:nth-child(1) {
  transform:
    translateY(6px)
    rotate(45deg);
}

.mobile-menu-button-open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-button-open span:nth-child(3) {
  transform:
    translateY(-6px)
    rotate(-45deg);
}

/* =========================
   Navegación móvil
========================= */

.mobile-navigation {
  display: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(
      180deg,
      #0c0b10,
      #100b19
    );
}

.mobile-navigation-content {
  width: min(calc(100% - 32px), 650px);
  padding: 20px 0 24px;
  margin: 0 auto;
}

.mobile-user {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 13px;
  margin-bottom: 22px;
  border: 1px solid rgba(167, 139, 250, 0.14);
  border-radius: 13px;
  background: rgba(124, 58, 237, 0.07);
}

.mobile-user-avatar {
  width: 43px;
  height: 43px;
  flex: 0 0 auto;
}

.mobile-user div:last-child {
  display: grid;
  gap: 3px;
}

.mobile-user small {
  font-size: 8px;
  color: #90899a;
}

.mobile-user strong {
  font-size: 12px;
}

.mobile-section-label {
  display: block;
  margin-bottom: 10px;
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.mobile-links {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mobile-link {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 9px;
  align-items: center;
  min-height: 55px;
  padding: 10px 11px;
  color: #d9d5df;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.035);
}

.mobile-link-icon {
  display: grid;
  width: 34px;
  height: 34px;
  font-size: 12px;
  color: var(--purple-light);
  place-items: center;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.11);
}

.mobile-link strong {
  font-size: 10px;
}

.mobile-link-arrow {
  color: #6d6872;
}

.active-mobile-link {
  color: var(--white);
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(124, 58, 237, 0.13);
}

.active-mobile-link .mobile-link-icon {
  color: var(--white);
  background: var(--purple);
}

.mobile-logout-button {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  margin-top: 20px;
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 10px;
  background: var(--purple);
}

.mobile-logout-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* =========================
   Accesibilidad
========================= */

.navigation-link:focus-visible,
.logout-button:focus-visible,
.mobile-menu-button:focus-visible,
.mobile-link:focus-visible,
.mobile-logout-button:focus-visible {
  outline: 3px solid rgba(167, 139, 250, 0.4);
  outline-offset: 3px;
}

/* =========================
   Transición móvil
========================= */

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  overflow: hidden;
  transition:
    opacity 180ms ease,
    max-height 220ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  max-height: 600px;
  opacity: 1;
}

/* =========================
   Responsive
========================= */

@media (max-width: 1050px) {
  .desktop-navigation,
  .desktop-actions {
    display: none;
  }

  .navbar {
    justify-content: space-between;
  }

  .mobile-menu-button {
    display: block;
  }

  .mobile-navigation {
    display: block;
  }
}

@media (max-width: 620px) {
  .navbar {
    width: calc(100% - 28px);
    min-height: 72px;
  }

  .brand-icon {
    width: 42px;
    height: 42px;
    font-size: 19px;
  }

  .brand small {
    font-size: 7px;
  }

  .brand strong {
    font-size: 14px;
  }

  .mobile-links {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 380px) {
  .brand small {
    display: none;
  }

  .brand strong {
    font-size: 13px;
  }
}
</style>
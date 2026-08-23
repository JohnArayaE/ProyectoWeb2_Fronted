<template>
  <footer class="site-footer">
    <div class="footer-container">
      <!-- Parte principal -->
      <div class="footer-main">
        <!-- Marca -->
        <div class="footer-brand">
          <NuxtLink
            to="/"
            class="brand"
            aria-label="Ir a la página principal"
          >
            <span
              class="brand-icon"
              aria-hidden="true"
            >
              C
            </span>

            <div class="brand-information">
              <small>
                PLATAFORMA COMUNITARIA
              </small>

              <strong>
                CommunityHub
              </strong>
            </div>
          </NuxtLink>

          <p class="brand-description">
            Descubre actividades, participa en eventos
            y mantente conectado con tu comunidad.
          </p>

          <div class="community-label">
            <span class="status-dot" />
            <p>
              Actividades · Eventos · Comunidad
            </p>
          </div>
        </div>

        <!-- Navegación -->
        <div class="footer-section">
          <span class="section-label">
            Navegación
          </span>

          <nav
            class="footer-navigation"
            aria-label="Navegación del pie de página"
          >
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="footer-link"
            >
              <span
                class="link-icon"
                aria-hidden="true"
              >
                {{ item.icon }}
              </span>

              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Información -->
        <div class="footer-section">
          <span class="section-label">
            CommunityHub
          </span>

          <div class="information-list">
            <div class="information-item">
              <span aria-hidden="true">
                ✓
              </span>

              <p>
                Encuentra actividades según tus
                intereses.
              </p>
            </div>

            <div class="information-item">
              <span aria-hidden="true">
                ★
              </span>

              <p>
                Guarda tus actividades favoritas.
              </p>
            </div>

            <div class="information-item">
              <span aria-hidden="true">
                ◆
              </span>

              <p>
                Participa y conecta con tu comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Parte inferior -->
      <div class="footer-bottom">
        <p>
          © {{ currentYear }} CommunityHub.
          Todos los derechos reservados.
        </p>

        <p class="project-label">
          Proyecto Web 2
        </p>
      </div>
    </div>

    <div class="footer-decoration footer-decoration-one" />
    <div class="footer-decoration footer-decoration-two" />
  </footer>
</template>

<script setup lang="ts">
type NavigationItem = {
  label: string
  to: string
  icon: string
}

const currentYear = new Date().getFullYear()

const navigationItems: NavigationItem[] = [
  {
    label: "Inicio",
    to: "/",
    icon: "⌂"
  },
  {
    label: "Actividades",
    to: "/activities",
    icon: "⌕"
  },
  {
    label: "Mis inscripciones",
    to: "/registrations",
    icon: "✓"
  },
  {
    label: "Favoritos",
    to: "/favorites",
    icon: "★"
  }
]
</script>

<style scoped>
.site-footer {
  --black: #09090b;
  --black-soft: #111116;
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --white: #ffffff;

  position: relative;
  width: 100%;
  overflow: hidden;
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
  color: var(--white);
  border-top:
    1px solid
    rgba(167, 139, 250, 0.2);
  background:
    radial-gradient(
      circle at 10% 120%,
      rgba(124, 58, 237, 0.25),
      transparent 32%
    ),
    radial-gradient(
      circle at 90% -20%,
      rgba(124, 58, 237, 0.14),
      transparent 30%
    ),
    linear-gradient(
      145deg,
      #08080b 0%,
      #111016 58%,
      #170d27 100%
    );
}

.footer-container {
  position: relative;
  z-index: 2;
  width:
    min(
      1250px,
      calc(100% - 48px)
    );
  margin: 0 auto;
}

/* =========================
   Parte principal
========================= */

.footer-main {
  display: grid;
  grid-template-columns:
    minmax(280px, 1.3fr)
    minmax(180px, 0.7fr)
    minmax(240px, 0.9fr);
  gap: 80px;
  padding: 58px 0 45px;
}

/* =========================
   Marca
========================= */

.footer-brand {
  max-width: 390px;
}

.brand {
  display: inline-flex;
  gap: 13px;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  font-size: 22px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border:
    1px solid
    rgba(167, 139, 250, 0.38);
  border-radius: 15px;
  background:
    linear-gradient(
      145deg,
      #8b5cf6,
      var(--purple)
    );
  box-shadow:
    0 9px 26px
    rgba(124, 58, 237, 0.24);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.brand:hover .brand-icon {
  box-shadow:
    0 12px 30px
    rgba(124, 58, 237, 0.34);
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
  margin-bottom: 3px;
  font-size: 8px;
  font-weight: 900;
  color: var(--purple-light);
  letter-spacing: 1.7px;
}

.brand strong {
  font-size: 18px;
  color: var(--white);
  letter-spacing: -0.4px;
}

.brand-description {
  max-width: 360px;
  margin: 22px 0;
  font-size: 12px;
  line-height: 1.8;
  color:
    rgba(
      255,
      255,
      255,
      0.55
    );
}

.community-label {
  display: flex;
  gap: 9px;
  align-items: center;
}

.community-label p {
  margin: 0;
  font-size: 9px;
  color:
    rgba(
      255,
      255,
      255,
      0.4
    );
  letter-spacing: 0.7px;
}

.status-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background:
    var(--purple-light);
  box-shadow:
    0 0 11px
    rgba(167, 139, 250, 0.7);
}

/* =========================
   Secciones
========================= */

.footer-section {
  display: flex;
  flex-direction: column;
}

.section-label {
  margin-bottom: 18px;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1.6px;
}

/* =========================
   Navegación
========================= */

.footer-navigation {
  display: grid;
  gap: 8px;
}

.footer-link {
  display: flex;
  gap: 9px;
  align-items: center;
  width: fit-content;
  padding: 7px 9px;
  margin-left: -9px;
  font-size: 11px;
  font-weight: 700;
  color: #c4becb;
  text-decoration: none;
  border:
    1px solid
    transparent;
  border-radius: 9px;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.footer-link:hover {
  color: var(--white);
  border-color:
    rgba(167, 139, 250, 0.16);
  background:
    rgba(124, 58, 237, 0.09);
  transform: translateX(3px);
}

.link-icon {
  display: grid;
  width: 24px;
  height: 24px;
  font-size: 10px;
  font-weight: 900;
  color: var(--purple-light);
  place-items: center;
  border-radius: 7px;
  background:
    rgba(124, 58, 237, 0.1);
}

/* =========================
   Información
========================= */

.information-list {
  display: grid;
  gap: 13px;
}

.information-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.information-item > span {
  display: grid;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-light);
  place-items: center;
  border:
    1px solid
    rgba(167, 139, 250, 0.15);
  border-radius: 8px;
  background:
    rgba(124, 58, 237, 0.09);
}

.information-item p {
  margin: 3px 0 0;
  font-size: 10px;
  line-height: 1.6;
  color:
    rgba(
      255,
      255,
      255,
      0.5
    );
}

/* =========================
   Parte inferior
========================= */

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 67px;
  border-top:
    1px solid
    rgba(255, 255, 255, 0.08);
}

.footer-bottom p {
  margin: 0;
  font-size: 9px;
  color:
    rgba(
      255,
      255,
      255,
      0.38
    );
}

.project-label {
  font-weight: 800;
  color:
    rgba(
      167,
      139,
      250,
      0.6
    ) !important;
  letter-spacing: 0.5px;
}

/* =========================
   Decoraciones
========================= */

.footer-decoration {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  pointer-events: none;
}

.footer-decoration-one {
  right: -100px;
  bottom: -170px;
  width: 330px;
  height: 330px;
  border:
    65px solid
    rgba(124, 58, 237, 0.055);
}

.footer-decoration-two {
  top: -160px;
  left: 37%;
  width: 270px;
  height: 270px;
  border:
    1px solid
    rgba(167, 139, 250, 0.1);
}

/* =========================
   Accesibilidad
========================= */

.brand:focus-visible,
.footer-link:focus-visible {
  outline:
    3px solid
    rgba(167, 139, 250, 0.4);
  outline-offset: 3px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 850px) {
  .footer-main {
    grid-template-columns:
      1fr 1fr;
    gap: 45px;
  }

  .footer-brand {
    grid-column:
      1 / -1;
    max-width: 500px;
  }
}

@media (max-width: 560px) {
  .footer-container {
    width:
      calc(
        100% - 40px
      );
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 35px;
    padding:
      45px 0 35px;
  }

  .footer-brand {
    grid-column: auto;
  }

  .brand-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .brand strong {
    font-size: 16px;
  }

  .brand small {
    font-size: 7px;
  }

  .footer-bottom {
    gap: 10px;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    min-height: 85px;
    padding: 18px 0;
  }
}
</style>
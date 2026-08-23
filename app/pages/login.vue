<template>
  <main class="login-page">
    <section class="login-container">
      <!-- Panel informativo -->
      <aside class="hero-panel">
        <div class="brand">
          <div class="brand-icon" aria-hidden="true">
            C
          </div>

          <div>
            <p class="brand-subtitle">PLATAFORMA COMUNITARIA</p>
            <h1>CommunityHub</h1>
          </div>
        </div>

        <div class="hero-content">
          

          <h2>
            Descubre actividades.
            <span>Forma parte de tu comunidad.</span>
          </h2>

          <p class="hero-description">
            Encuentra eventos, inscríbete en actividades y mantente conectado
            con las experiencias que suceden cerca de ti.
          </p>

          <div class="features">
            <article class="feature">
              <div class="feature-icon" aria-hidden="true">⌕</div>
              <div>
                <strong>Explora actividades</strong>
                <small>Encuentra eventos según tus intereses</small>
              </div>
            </article>

            <article class="feature">
              <div class="feature-icon" aria-hidden="true">✓</div>
              <div>
                <strong>Inscríbete fácilmente</strong>
                <small>Reserva tu espacio en pocos pasos</small>
              </div>
            </article>

            <article class="feature">
              <div class="feature-icon" aria-hidden="true">★</div>
              <div>
                <strong>Guarda tus favoritos</strong>
                <small>Conserva las actividades que más te gustan</small>
              </div>
            </article>
          </div>
        </div>

        <div class="hero-footer">
          <span class="status-dot" />
          <p>Actividades · Eventos · Comunidad</p>
        </div>
      </aside>

      <!-- Panel del formulario -->
      <section class="form-panel">
        <div class="login-card">
          <div class="mobile-brand">
            <div class="mobile-brand-icon" aria-hidden="true">C</div>
            <div>
              <small>PLATAFORMA COMUNITARIA</small>
              <strong>CommunityHub</strong>
            </div>
          </div>

          <header class="form-header">
            <span class="welcome-label">Bienvenido</span>
            <h2>Inicia sesión</h2>
            <p>
              Ingresa con tu correo electrónico y contraseña para acceder a tu
              cuenta.
            </p>
          </header>

          <form class="login-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="email">Correo electrónico</label>

              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="nombre@correo.com"
                required
              >
            </div>

            <div class="form-group">
              <div class="password-label">
                <label for="password">Contraseña</label>

                <button
                  class="forgot-button"
                  type="button"
                  disabled
                  title="Disponible próximamente"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div class="password-field">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  minlength="8"
                  required
                >

                <button
                  class="password-toggle"
                  type="button"
                  :aria-label="
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  "
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? "Ocultar" : "Mostrar" }}
                </button>
              </div>
            </div>

            <div v-if="message" class="information-message" role="status">
              <span aria-hidden="true">i</span>
              <p>{{ message }}</p>
            </div>

            <button class="submit-button" type="submit">
              Iniciar sesión
            </button>
          </form>

          <div class="divider">
            <span />
            <p>¿Todavía no tienes una cuenta?</p>
            <span />
          </div>

          <NuxtLink class="register-link" to="/register">
            Crear una cuenta
          </NuxtLink>

          <div class="security-message">
            <span aria-hidden="true">◆</span>
            <p>
              Tus credenciales se procesarán de manera segura cuando se conecte
              el servicio de autenticación.
            </p>
          </div>
        </div>
      </section>
    </section>

    <div class="decoration decoration-one" />
    <div class="decoration decoration-two" />
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth"

const authStore = useAuthStore()

const route = useRoute()

const form = reactive({
  email: "",
  password: ""
})

const showPassword = ref(false)

const message = ref("")

const isLoading = ref(false)


useHead({
  title: "Iniciar sesión | CommunityHub",

  meta: [
    {
      name: "description",
      content:
        "Inicia sesión en CommunityHub para consultar e inscribirte en actividades."
    }
  ]
})
onMounted(() => {

  if (route.query.registered === "true") {

    message.value =
      "Cuenta creada correctamente. Ahora inicia sesión."
  }
})
async function handleSubmit() {
  message.value = ""
  isLoading.value = true
  try {

    await authStore.login({

      email: form.email,

      password: form.password
    })
    await navigateTo("/")
  } catch (error: any) {
    message.value =
      error?.data?.message ||
      "No fue posible iniciar sesión. Verifica tu correo y contraseña."
  } finally {
    isLoading.value = false
  }
}
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

:global(html) {
  background: #f3f1f7;
}

:global(body) {
  min-height: 100vh;
  overflow-x: hidden;
}

:global(#__nuxt) {
  min-height: 100vh;
}


* {
  box-sizing: border-box;
}

.login-page {
  --black: #09090b;
  --black-soft: #111116;
  --purple: #7c3aed;
  --purple-dark: #5b21b6;
  --purple-light: #a78bfa;
  --purple-soft: #ede9fe;
  --white: #ffffff;
  --gray-background: #f3f1f7;
  --gray-border: #ddd8e7;
  --gray-text: #716b7d;
  --text-dark: #17131f;

  position: relative;
  display: grid;
  min-height: 100vh;
  padding: 32px;
  overflow: hidden;
  font-family: Inter, Arial, Helvetica, sans-serif;
  background:
    radial-gradient(
      circle at 10% 15%,
      rgba(124, 58, 237, 0.16),
      transparent 29%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(124, 58, 237, 0.12),
      transparent 27%
    ),
    var(--gray-background);
}

.login-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  width: min(1180px, 100%);
  min-height: 690px;
  margin: auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  background: var(--white);
  box-shadow: 0 32px 90px rgba(24, 14, 40, 0.2);
}

/* Panel izquierdo */

.hero-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 52px;
  overflow: hidden;
  color: var(--white);
  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(124, 58, 237, 0.27),
      transparent 32%
    ),
    linear-gradient(145deg, #070709 0%, #111016 55%, #1c1230 100%);
}

.hero-panel::before {
  position: absolute;
  top: -125px;
  right: -120px;
  width: 360px;
  height: 360px;
  content: "";
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 50%;
}

.hero-panel::after {
  position: absolute;
  right: -95px;
  bottom: -145px;
  width: 360px;
  height: 360px;
  content: "";
  border: 74px solid rgba(124, 58, 237, 0.08);
  border-radius: 50%;
}

.brand {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 14px;
  align-items: center;
}

.brand-icon,
.mobile-brand-icon {
  display: grid;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  background: var(--purple);
}

.brand-icon {
  width: 56px;
  height: 56px;
  font-size: 25px;
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 17px;
  box-shadow: 0 0 28px rgba(124, 58, 237, 0.25);
}

.brand-subtitle {
  margin: 0 0 3px;
  font-size: 11px;
  font-weight: 800;
  color: var(--purple-light);
  letter-spacing: 2px;
}

.brand h1 {
  margin: 0;
  font-size: 25px;
  color: var(--white);
}

.hero-content {
  position: relative;
  z-index: 2;
  margin: auto 0;
}

.hero-badge {
  display: inline-flex;
  padding: 8px 15px;
  margin-bottom: 23px;
  font-size: 12px;
  font-weight: 800;
  color: #ddd6fe;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
}

.hero-content h2 {
  max-width: 550px;
  margin: 0;
  font-size: clamp(42px, 5vw, 62px);
  line-height: 1.04;
  letter-spacing: -2px;
}

.hero-content h2 span {
  display: block;
  color: var(--purple-light);
}

.hero-description {
  max-width: 520px;
  margin: 25px 0 35px;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.68);
}

.features {
  display: grid;
  gap: 12px;
}

.feature {
  display: flex;
  gap: 14px;
  align-items: center;
  width: min(100%, 420px);
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.045);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.feature:hover {
  border-color: rgba(167, 139, 250, 0.3);
  background: rgba(124, 58, 237, 0.1);
  transform: translateX(3px);
}

.feature-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  font-size: 20px;
  font-weight: 900;
  color: var(--purple-light);
  place-items: center;
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.12);
}

.feature strong,
.feature small {
  display: block;
}

.feature strong {
  margin-bottom: 3px;
  font-size: 14px;
  color: var(--white);
}

.feature small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.hero-footer {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 9px;
  align-items: center;
  margin-top: 25px;
}

.hero-footer p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.7px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--purple-light);
  box-shadow: 0 0 11px rgba(167, 139, 250, 0.7);
}

/* Panel derecho */

.form-panel {
  display: grid;
  padding: 60px;
  place-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #faf9fc 100%);
}

.login-card {
  width: min(100%, 430px);
}

.mobile-brand {
  display: none;
}

.form-header {
  margin-bottom: 30px;
}

.welcome-label {
  display: inline-block;
  padding: 7px 11px;
  margin-bottom: 15px;
  font-size: 11px;
  font-weight: 900;
  color: var(--purple-dark);
  text-transform: uppercase;
  letter-spacing: 1.8px;
  border-radius: 999px;
  background: var(--purple-soft);
}

.form-header h2 {
  margin: 0 0 14px;
  font-size: 41px;
  color: var(--text-dark);
  letter-spacing: -1.4px;
}

.form-header p {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray-text);
}

.login-form,
.form-group {
  display: grid;
}

.login-form {
  gap: 20px;
}

.form-group {
  gap: 9px;
}

.form-group label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-dark);
}

.password-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-button {
  padding: 0;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  color: #918b9b;
  cursor: not-allowed;
  border: 0;
  background: transparent;
}

.form-group input {
  width: 100%;
  min-height: 54px;
  padding: 14px 16px;
  font: inherit;
  font-size: 14px;
  color: var(--text-dark);
  outline: none;
  border: 1px solid var(--gray-border);
  border-radius: 13px;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.form-group input::placeholder {
  color: #aba5b4;
}

.form-group input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 86px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 14px;
  padding: 5px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  color: var(--purple-dark);
  cursor: pointer;
  border: 0;
  background: transparent;
  transform: translateY(-50%);
}

.submit-button,
.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 56px;
  padding: 14px 20px;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  border-radius: 14px;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.submit-button {
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  background: var(--purple);
  box-shadow: 0 11px 25px rgba(124, 58, 237, 0.25);
}

.submit-button:hover {
  border-color: var(--purple-dark);
  background: var(--purple-dark);
  box-shadow: 0 14px 31px rgba(91, 33, 182, 0.3);
  transform: translateY(-2px);
}

.register-link {
  color: var(--text-dark);
  border: 1px solid #cbc5d4;
  background: var(--white);
}

.register-link:hover {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
  transform: translateY(-2px);
}

.information-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 13px 14px;
  color: #4c287d;
  border: 1px solid #d8cced;
  border-radius: 13px;
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

.information-message p {
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin: 27px 0 17px;
}

.divider span {
  height: 1px;
  background: #e2dee7;
}

.divider p {
  margin: 0;
  font-size: 9px;
  font-weight: 800;
  color: #97919f;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.security-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 20px;
}

.security-message span {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--purple);
}

.security-message p {
  margin: 0;
  font-size: 11px;
  line-height: 1.55;
  color: #97919f;
}

/* Decoraciones */

.decoration {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}

.decoration-one {
  top: -70px;
  right: 7%;
  width: 170px;
  height: 170px;
  border: 38px solid rgba(124, 58, 237, 0.11);
}

.decoration-two {
  bottom: -90px;
  left: 4%;
  width: 210px;
  height: 210px;
  border: 48px solid rgba(9, 9, 11, 0.055);
}

/* Responsive */

@media (max-width: 900px) {
  .login-page {
    padding: 22px;
  }

  .login-container {
    grid-template-columns: 1fr;
    width: min(560px, 100%);
    min-height: auto;
  }

  .hero-panel {
    display: none;
  }

  .form-panel {
    min-height: 690px;
    padding: 50px 42px;
  }

  .mobile-brand {
    display: flex;
    gap: 11px;
    align-items: center;
    margin-bottom: 42px;
  }

  .mobile-brand-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
    border-radius: 13px;
  }

  .mobile-brand small,
  .mobile-brand strong {
    display: block;
  }

  .mobile-brand small {
    margin-bottom: 2px;
    font-size: 9px;
    font-weight: 900;
    color: var(--purple-dark);
    letter-spacing: 1.4px;
  }

  .mobile-brand strong {
    font-size: 15px;
    color: var(--black);
  }
}

@media (max-width: 520px) {
  .login-page {
    padding: 0;
    background: var(--white);
  }

  .login-container {
    min-height: 100vh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .form-panel {
    min-height: 100vh;
    padding: 32px 24px;
  }

  .mobile-brand {
    margin-bottom: 38px;
  }

  .form-header h2 {
    font-size: 35px;
  }

  .form-header p {
    font-size: 14px;
  }

  .password-label {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .divider p {
    text-align: center;
  }
}
</style>
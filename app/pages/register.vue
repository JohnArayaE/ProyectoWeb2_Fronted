<template>
  <main class="register-page">
    <section class="register-card">
      <!-- Marca -->
      <div class="brand">
        <div class="brand-icon" aria-hidden="true">
          C
        </div>

        <div>
          <p>PLATAFORMA COMUNITARIA</p>
          <strong>CommunityHub</strong>
        </div>
      </div>

      <!-- Encabezado -->
      <header class="form-header">
        <span class="register-label">Crear cuenta</span>

        <h1>Regístrate</h1>

        <p>
          Completa tus datos para comenzar a formar parte de la comunidad.
        </p>
      </header>

      <!-- Formulario -->
      <form class="register-form" @submit.prevent="handleSubmit">
        <!-- Nombre y apellido -->
        <div class="name-fields">
          <div class="form-group">
            <label for="name">
              Nombre
            </label>

            <input
              id="name"
              v-model.trim="form.name"
              type="text"
              name="name"
              autocomplete="given-name"
              placeholder="Tu nombre"
              required
            >
          </div>

          <div class="form-group">
            <label for="lastName">
              Apellido
            </label>

            <input
              id="lastName"
              v-model.trim="form.lastName"
              type="text"
              name="lastName"
              autocomplete="family-name"
              placeholder="Tu apellido"
              required
            >
          </div>
        </div>

        <!-- Correo -->
        <div class="form-group">
          <label for="email">
            Correo electrónico
          </label>

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

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">
            Contraseña
          </label>

          <div class="password-field">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="new-password"
              placeholder="Crea una contraseña"
              minlength="2"
              required
            >

            <button
              class="password-toggle"
              type="button"
              :aria-label="
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Ocultar" : "Mostrar" }}
            </button>
          </div>

          <small class="password-help">
            Utiliza al menos 8 caracteres.
          </small>
        </div>

        <!-- Foto de perfil -->
        <div class="form-group">
          <div class="photo-label">
            <label for="profilePhoto">
              Foto de perfil
            </label>

            <span>Opcional</span>
          </div>

          <div class="profile-upload">
            <div class="profile-preview">
              <img
                v-if="profilePreview"
                :src="profilePreview"
                alt="Vista previa de la foto de perfil"
              >

              <span v-else aria-hidden="true">
                {{ userInitial }}
              </span>
            </div>

            <div class="upload-information">
              <label
                class="upload-button"
                for="profilePhoto"
              >
                Seleccionar imagen
              </label>

              <input
                id="profilePhoto"
                class="file-input"
                type="file"
                name="profilePhoto"
                accept="image/png,image/jpeg,image/webp"
                @change="handlePhotoChange"
              >

              <small>
                JPG, PNG o WEBP
              </small>
            </div>

            <button
              v-if="profilePreview"
              class="remove-photo-button"
              type="button"
              @click="removePhoto"
            >
              Quitar
            </button>
          </div>
        </div>

        <!-- Mensaje temporal -->
        <div
          v-if="message"
          class="information-message"
          role="status"
        >
          <span aria-hidden="true">i</span>

          <p>
            {{ message }}
          </p>
        </div>

        <!-- Botón -->
        <button
          class="submit-button"
          type="submit"
        >
          Crear cuenta
        </button>
      </form>

      <!-- Separador -->
      <div class="divider">
        <span />
        <p>¿Ya tienes una cuenta?</p>
        <span />
      </div>

      <!-- Login -->
      <NuxtLink
        class="login-link"
        to="/login"
      >
        Iniciar sesión
      </NuxtLink>

      <div class="security-message">
        <span aria-hidden="true">◆</span>

        <p>
          Tus datos se procesarán de manera segura cuando conectemos
          el servicio de autenticación.
        </p>
      </div>
    </section>

    <!-- Decoraciones de fondo -->
    <div class="decoration decoration-one" />
    <div class="decoration decoration-two" />
    <div class="decoration decoration-three" />
  </main>
</template>

<script setup lang="ts">
interface RegisterForm {
  name: string
  lastName: string
  email: string
  password: string
  profilePhoto: File | null
}

const form = reactive<RegisterForm>({
  name: "",
  lastName: "",
  email: "",
  password: "",
  profilePhoto: null
})

const showPassword = ref(false)
const message = ref("")
const profilePreview = ref("")

const userInitial = computed(() => {
  if (!form.name) {
    return "C"
  }

  return form.name.charAt(0).toUpperCase()
})

useHead({
  title: "Crear cuenta | CommunityHub",
  meta: [
    {
      name: "description",
      content:
        "Crea una cuenta en CommunityHub para descubrir e inscribirte en actividades."
    }
  ]
})

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  form.profilePhoto = file

  const reader = new FileReader()

  reader.onload = () => {
    profilePreview.value = reader.result as string
  }

  reader.readAsDataURL(file)
}

function removePhoto() {
  form.profilePhoto = null
  profilePreview.value = ""

  const input = document.getElementById(
    "profilePhoto"
  ) as HTMLInputElement | null

  if (input) {
    input.value = ""
  }
}

function handleSubmit() {
  message.value =
    "El formulario está listo. El registro se habilitará cuando conectemos el backend."
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

.register-page {
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

  position: relative;
  display: grid;
  width: 100%;
  min-height: 100vh;
  padding: 48px 24px;
  overflow: hidden;
  font-family: Inter, Arial, Helvetica, sans-serif;
  place-items: center;
  background:
    radial-gradient(
      circle at 10% 15%,
      rgba(124, 58, 237, 0.16),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(124, 58, 237, 0.12),
      transparent 28%
    ),
    var(--gray-background);
}

/* =========================
   Tarjeta
========================= */

.register-card {
  position: relative;
  z-index: 2;
  width: min(620px, 100%);
  padding: 48px 52px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #fdfcff 100%
    );
  box-shadow:
    0 30px 80px rgba(24, 14, 40, 0.17);
}

/* =========================
   Marca
========================= */

.brand {
  display: flex;
  gap: 13px;
  align-items: center;
  margin-bottom: 38px;
}

.brand-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  font-size: 23px;
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

.brand p {
  margin: 0 0 3px;
  font-size: 9px;
  font-weight: 900;
  color: var(--purple-dark);
  letter-spacing: 1.7px;
}

.brand strong {
  display: block;
  font-size: 19px;
  color: var(--black);
}

/* =========================
   Encabezado
========================= */

.form-header {
  margin-bottom: 30px;
}

.register-label {
  display: inline-block;
  padding: 7px 12px;
  margin-bottom: 14px;
  font-size: 10px;
  font-weight: 900;
  color: var(--purple-dark);
  text-transform: uppercase;
  letter-spacing: 1.6px;
  border-radius: 999px;
  background: var(--purple-soft);
}

.form-header h1 {
  margin: 0 0 11px;
  font-size: 40px;
  color: var(--text-dark);
  letter-spacing: -1.5px;
}

.form-header p {
  max-width: 480px;
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray-text);
}

/* =========================
   Formulario
========================= */

.register-form {
  display: grid;
  gap: 19px;
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group > label,
.photo-label label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-dark);
}

.form-group input {
  width: 100%;
  min-height: 53px;
  padding: 13px 16px;
  font: inherit;
  font-size: 14px;
  color: var(--text-dark);
  outline: none;
  border: 1px solid var(--gray-border);
  border-radius: 13px;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.form-group input::placeholder {
  color: #aba5b4;
}

.form-group input:hover {
  border-color: #c8c0d3;
}

.form-group input:focus {
  border-color: var(--purple);
  background: #ffffff;
  box-shadow:
    0 0 0 4px rgba(124, 58, 237, 0.11);
}

/* =========================
   Contraseña
========================= */

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 88px;
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

.password-toggle:hover {
  color: var(--purple);
}

.password-help {
  font-size: 10px;
  color: #97919f;
}

/* =========================
   Foto de perfil
========================= */

.photo-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.photo-label span {
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 800;
  color: #7d7587;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-radius: 999px;
  background: #f0edf3;
}

.profile-upload {
  display: flex;
  gap: 15px;
  align-items: center;
  min-height: 88px;
  padding: 14px 15px;
  border: 1px dashed #cfc7d8;
  border-radius: 15px;
  background: #faf9fc;
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.profile-upload:hover {
  border-color: var(--purple-light);
  background: #f9f6ff;
}

.profile-preview {
  display: grid;
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  overflow: hidden;
  font-size: 21px;
  font-weight: 900;
  color: var(--purple-dark);
  place-items: center;
  border: 1px solid #d7cbea;
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      #f1ebff,
      #e8defb
    );
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-information {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.upload-button {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 800;
  color: var(--purple-dark);
  cursor: pointer;
  border: 1px solid #d5c8eb;
  border-radius: 9px;
  background: var(--white);
  transition:
    color 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.upload-button:hover {
  color: var(--white);
  border-color: var(--purple);
  background: var(--purple);
}

.upload-information small {
  font-size: 9px;
  color: #97919f;
}

.file-input {
  display: none;
}

.remove-photo-button {
  padding: 7px 8px;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  color: #77707f;
  cursor: pointer;
  border: 0;
  background: transparent;
}

.remove-photo-button:hover {
  color: var(--purple-dark);
}

/* =========================
   Mensaje
========================= */

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

/* =========================
   Botón crear cuenta
========================= */

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 55px;
  padding: 14px 20px;
  margin-top: 2px;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--purple);
  border-radius: 14px;
  background: var(--purple);
  box-shadow:
    0 11px 25px rgba(124, 58, 237, 0.25);
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.submit-button:hover {
  border-color: var(--purple-dark);
  background: var(--purple-dark);
  box-shadow:
    0 14px 31px rgba(91, 33, 182, 0.3);
  transform: translateY(-2px);
}

.submit-button:active {
  transform: translateY(0);
}

/* =========================
   Separador
========================= */

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

/* =========================
   Botón iniciar sesión
========================= */

.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-dark);
  text-decoration: none;
  border: 1px solid #cbc5d4;
  border-radius: 14px;
  background: var(--white);
  transition:
    color 180ms ease,
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.login-link:hover {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
  transform: translateY(-2px);
}

/* =========================
   Mensaje de seguridad
========================= */

.security-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 20px;
}

.security-message span {
  flex: 0 0 auto;
  font-size: 10px;
  color: var(--purple);
}

.security-message p {
  margin: 0;
  font-size: 10px;
  line-height: 1.55;
  color: #97919f;
}

/* =========================
   Decoraciones
========================= */

.decoration {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  pointer-events: none;
}

.decoration-one {
  top: -90px;
  right: 8%;
  width: 220px;
  height: 220px;
  border: 48px solid rgba(124, 58, 237, 0.1);
}

.decoration-two {
  bottom: -110px;
  left: 5%;
  width: 240px;
  height: 240px;
  border: 54px solid rgba(9, 9, 11, 0.045);
}

.decoration-three {
  top: 45%;
  left: -80px;
  width: 160px;
  height: 160px;
  border: 1px solid rgba(124, 58, 237, 0.15);
}

/* =========================
   Responsive tablet
========================= */

@media (max-width: 650px) {
  .register-page {
    padding: 25px 18px;
  }

  .register-card {
    padding: 38px 32px;
    border-radius: 24px;
  }

  .form-header h1 {
    font-size: 36px;
  }
}

/* =========================
   Responsive móvil
========================= */

@media (max-width: 520px) {
  .register-page {
    display: block;
    width: 100%;
    min-height: 100vh;
    padding: 0;
    overflow: visible;
    background: var(--white);
  }

  .register-card {
    width: 100%;
    min-height: 100vh;
    padding: 32px 24px 40px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .brand {
    margin-bottom: 34px;
  }

  .brand-icon {
    width: 45px;
    height: 45px;
    font-size: 20px;
    border-radius: 13px;
  }

  .brand strong {
    font-size: 16px;
  }

  .brand p {
    font-size: 8px;
  }

  .form-header h1 {
    font-size: 34px;
  }

  .form-header p {
    font-size: 14px;
  }

  .name-fields {
    grid-template-columns: 1fr;
  }

  .profile-upload {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .remove-photo-button {
    margin-left: auto;
  }

  .divider p {
    text-align: center;
  }

  .decoration {
    display: none;
  }
}
</style>
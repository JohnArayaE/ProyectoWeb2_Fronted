<template>
  <div class="admin-page">

    <AdminAppHeader />

    <main>

      <section class="hero">

        <div class="hero-container">

          <div class="hero-information">

            <div class="badge">
              <span />
              PANEL ADMINISTRADOR
            </div>

            <h1>
              Hola,
              <span>
                {{ authStore.user?.firstName || "Administrador" }}.
              </span>
            </h1>

            <h2>
              Gestiona tu
              <strong>comunidad.</strong>
            </h2>

            <p>
              Administra usuarios, actividades y la información general
              de CommunityHub desde un solo lugar.
            </p>

          </div>


          <article class="admin-card">

            <div class="card-top">
              <span>
                Tu espacio
              </span>

              <small>
                Activo
              </small>
            </div>


            <div class="avatar">

              <img
                v-if="authStore.user?.profilePicture"
                :src="authStore.user.profilePicture"
                alt="Foto administrador"
              >

              <span v-else>
                {{ userInitial }}
              </span>

            </div>


            <h3>
              {{ fullName }}
            </h3>

            <p>
              {{ authStore.user?.email }}
            </p>


            <div class="divider" />


            <NuxtLink
              to="/admin/users"
              class="button"
            >
              Gestionar usuarios →
            </NuxtLink>

          </article>

        </div>

      </section>


      <section class="statistics">

        <div class="container">

          <header>
            <span>
              RESUMEN GENERAL
            </span>

            <h2>
              Estado de la
              <strong>plataforma.</strong>
            </h2>
          </header>


          <div class="cards">

            <article
              v-for="item in statistics"
              :key="item.title"
              class="stat-card"
            >

              <div class="icon">
                {{ item.icon }}
              </div>

              <p>
                {{ item.title }}
              </p>

              <strong>
                {{ item.value }}
              </strong>

            </article>

          </div>

        </div>

      </section>

    </main>


    <AdminAppFooter />

  </div>
</template>


<script setup lang="ts">

import { useAuthStore } from "~/stores/auth"
import { adminService } from "~/services/adminService"

const authStore = useAuthStore()

const totalUsers = ref(0)
const totalOrganizers = ref(0)
const totalEvents = ref(0)
const totalRegistrations = ref(0)
const activeEvents = ref(0)
const completedEvents = ref(0)

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


const statistics = computed(() => [

  {
    title: "Usuarios registrados",
    value: totalUsers.value,
    icon: "👥"
  },

  {
    title: "Organizadores",
    value: totalOrganizers.value,
    icon: "⭐"
  },

  {
    title: "Actividades",
    value: totalEvents.value,
    icon: "📅"
  },

  {
    title: "Inscripciones",
    value: totalRegistrations.value,
    icon: "✓"
  },

  {
    title: "Actividades activas",
    value: activeEvents.value,
    icon: "●"
  },

  {
    title: "Finalizadas",
    value: completedEvents.value,
    icon: "◆"
  }

])


async function loadDashboardData() {

  try {

    const response = await adminService.getUsers()

    const users = response.data.users

    totalUsers.value = users.length

    totalOrganizers.value = users.filter(
      user => user.role === "organizer"
    ).length

  } catch (error) {

    console.error(
      "Error cargando dashboard",
      error
    )
  }

  try {

    const statsResponse = await adminService.getStats()

    totalEvents.value = statsResponse.data.totalEvents
    totalRegistrations.value = statsResponse.data.totalRegistrations
    activeEvents.value = statsResponse.data.activeEvents
    completedEvents.value = statsResponse.data.completedEvents

  } catch (error) {

    console.error(
      "Error cargando estadísticas",
      error
    )
  }
}
onMounted(() => {

  loadDashboardData()
})
useHead({
  title: "Dashboard Administrador | CommunityHub"
})
</script>


<style scoped>

:global(html),
:global(body),
:global(#__nuxt) {
  width:100%;
  min-width:100%;
  min-height:100%;
  margin:0;
  padding:0;
}

:global(body) {
  overflow-x:hidden;
  background:#f4f2f8;
}

* {
  box-sizing:border-box;
}


.admin-page {

  min-height:100vh;
  background:#f4f2f8;
  font-family:Inter, Arial, Helvetica, sans-serif;

}


.hero {

  background:
    radial-gradient(
      circle at top right,
      rgba(124,58,237,.25),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #09090b,
      #1d1031
    );

  color:white;

}


.hero-container {

  width:min(1200px,calc(100% - 48px));
  min-height:520px;
  margin:auto;

  display:grid;
  grid-template-columns:1fr 360px;
  gap:60px;
  align-items:center;

}


.badge {

  display:inline-flex;
  align-items:center;
  gap:8px;

  padding:8px 14px;

  border-radius:999px;

  background:rgba(124,58,237,.15);

  color:#ddd6fe;

  font-size:10px;
  font-weight:800;
  letter-spacing:1px;

}


.badge span {

  width:7px;
  height:7px;

  border-radius:50%;

  background:#a78bfa;

}


.hero h1 {

  font-size:20px;
  color:#aaa;

}


.hero h1 span,
.hero h2 strong {

  color:#a78bfa;

}


.hero h2 {

  margin:15px 0;

  font-size:65px;
  line-height:1;

}


.hero p {

  max-width:550px;

  color:#aaa;

  font-size:18px;

}


.admin-card {

  padding:28px;

  border-radius:24px;

  background:rgba(255,255,255,.08);

  border:1px solid rgba(167,139,250,.25);

  text-align:center;

}


.card-top {

  display:flex;

  justify-content:space-between;

  color:#a78bfa;

  font-size:12px;

}


.avatar {

  width:90px;
  height:90px;

  margin:25px auto;

  border-radius:50%;

  overflow:hidden;

  display:grid;

  place-items:center;

  background:#7c3aed;

  color:white;

  font-size:32px;

  font-weight:bold;

}


.avatar img {

  width:100%;
  height:100%;

  object-fit:cover;

}


.admin-card h3 {

  color:white;

}


.admin-card p {

  color:#aaa;

}


.divider {

  height:1px;

  margin:20px 0;

  background:rgba(255,255,255,.1);

}


.button {

  display:block;

  padding:13px;

  border-radius:12px;

  background:#7c3aed;

  color:white;

  text-decoration:none;

}


.container {

  width:min(1200px,calc(100% - 48px));

  margin:auto;

  padding:70px 0;

}


.statistics header span {

  color:#7c3aed;

  font-size:11px;

  font-weight:800;

  letter-spacing:1px;

}


.statistics h2 {

  font-size:42px;

}


.statistics h2 strong {

  color:#7c3aed;

}


.cards {

  display:grid;

  grid-template-columns:repeat(3,1fr);

  gap:20px;

  margin-top:35px;

}


.stat-card {

  background:white;

  border:1px solid #ddd8e7;

  border-radius:20px;

  padding:25px;

}


.icon {

  font-size:30px;

}


.stat-card p {

  color:#716b7d;

}


.stat-card strong {

  font-size:36px;

}


@media(max-width:900px){

  .hero-container,
  .cards {

    grid-template-columns:1fr;

  }
  .hero h2 {
    font-size:45px;
  }
}
</style>
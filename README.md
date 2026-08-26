# CommunityHub — Frontend

Interfaz web de **CommunityHub**, plataforma comunitaria de gestión y participación en actividades y eventos. Consume exclusivamente la API REST del backend — nunca se conecta directamente a la base de datos.

## Tecnologías

- Nuxt 4 / Vue 3
- TypeScript
- Pinia (manejo de estado)
- `$fetch` nativo para consumo de API
- `@vite-pwa/nuxt` (Progressive Web App)

## Requisitos previos

- Node.js 24 LTS o superior
- El backend de CommunityHub corriendo (ver README del repo `Proyecto_WebBack`)

## Instalación

```bash
npm install
```

## Variables de entorno / configuración

`nuxt.config.ts` define la URL base de la API vía `runtimeConfig.public.apiBase`:

```ts
runtimeConfig: {
  public: {
    apiBase: "http://localhost:Tú puerto"
  }
}
```

## Scripts disponibles

```bash
npm run dev      # Levanta el servidor de desarrollo (puerto configurado en devServer.port)
npm run build     # Compila para producción
npm run generate  # Genera versión estática
```

## Estructura del proyecto

```
app/
├── pages/                  # Rutas del sitio (una carpeta = una ruta)
│   ├── login.vue
│   ├── register.vue
│   ├── organizer/           # Dashboard del organizador
│   ├── categorias/           # Gestión de categorías (admin, consulta para todos)
│   ├── actividades/           # Catálogo público + detalle
│   ├── mis-actividades/       # Gestión de eventos propios (organizador)
│   ├── mis-inscripciones/     # Historial de inscripciones (usuario)
│   ├── favoritos/              # Actividades guardadas (usuario)
│   ├── notifications/          # Notificaciones del usuario
│   └── admin/                   # Panel de administración
│       ├── index.vue             # Dashboard con estadísticas
│       ├── users.vue
│       └── events/
├── components/
│   ├── AppHeader.vue / AppFooter.vue          # Navegación genérica (usuario/organizador)
│   └── admin/AppHeader.vue / AppFooter.vue    # Navegación exclusiva de admin
├── services/                # Funciones que llaman a la API (una por recurso)
├── stores/                   # Estado global con Pinia
└── types/                     # Tipos de TypeScript compartidos
```

## Autenticación

El login se maneja con `useAuthStore()` (Pinia), que guarda el JWT en `localStorage` bajo la clave `auth_token` y expone el usuario actual y su rol. Todas las llamadas a la API autenticadas leen el token desde ahí.

## Navegación por rol

El Header/Footer es el mismo componente para todos los roles, pero se comporta distinto según quién esté logueado:

- **Usuario**: ve Inicio (con su dashboard), Actividades, Mis inscripciones, Favoritos.
- **Organizador**: el link "Inicio" lleva a su propio panel (`/organizer`) en vez del home público; ve Actividades y Mis actividades. No ve Favoritos ni Mis inscripciones (no aplican a este rol).
- **Admin**: usa un Header/Footer separado (`components/admin/`), con Inicio, Usuarios, Actividades, Categorías.

## Páginas por rol

### Usuario (`/`)
Dashboard con: próximas actividades del catálogo, actividades en las que está inscripto, sus favoritos, historial de actividades ya finalizadas, y sus notificaciones.

### Organizador (`/organizer`)
Dashboard con métricas de sus propias actividades: creadas, próximas, canceladas, capacidad total configurada, participantes.

`/mis-actividades`: crear, editar, cancelar actividades propias, y consultar la lista de participantes de cada una. No incluye opción de eliminar (esa acción es exclusiva de administrador).

### Administrador (`/admin`)
Dashboard con estadísticas generales de la plataforma (usuarios, organizadores, actividades totales/activas/finalizadas, inscripciones).

`/admin/users`: gestión completa de usuarios (editar, cambiar rol, activar/desactivar).

`/admin/events`: gestión total de actividades (editar, eliminar, reactivar cualquier evento del sistema).

`/categorias`: gestión de categorías (crear, editar, desactivar/reactivar) — el listado es visible para cualquier rol autenticado, pero solo el admin ve los controles de gestión.

## Búsqueda y filtros

La página `/actividades` incluye filtros combinables: texto libre, categoría, fecha, ubicación, y disponibilidad (cupo real, no solo estado del evento). El estado de los filtros se refleja en la URL.

## PWA

El proyecto usa `@vite-pwa/nuxt` con manifest configurado (nombre, íconos, colores). La estrategia de caché y funcionalidad offline real es responsabilidad del `service worker` configurado en `nuxt.config.ts` 

## Convenciones del proyecto

- Rutas visibles al usuario en español (`/actividades`, `/categorias`), coherente con la audiencia del producto.
- Código interno (servicios, stores, tipos) en inglés, siguiendo la convención del ecosistema Nuxt/Vue.
- Sin librerías de componentes UI adicionales — estilos propios, consistentes entre páginas.

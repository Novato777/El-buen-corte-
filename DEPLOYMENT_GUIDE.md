# 🚀 Guía Definitiva de Despliegue - El Buen Corte

Esta guía te explica paso a paso cómo desplegar todo el ecosistema de **El Buen Corte** en la nube utilizando:
1. 🐘 **Neon** → Base de Datos PostgreSQL Serverless
2. ☁️ **Cloudinary** → Almacenamiento y optimización de imágenes (fotos de productos, logos, banners)
3. ⚡ **Render** → Backend API en Node.js / Express
4. ▲ **Vercel** → Frontend (Panel de Administración + Tienda Virtual) y Landing Page

---

## 🗺️ Mapa de Arquitectura en Producción

```mermaid
graph TD
    Client["📱 Clientes / Administradores"]
    VercelApp["▲ Vercel (Frontend / Tienda)"]
    VercelLanding["▲ Vercel (Landing Page)"]
    RenderAPI["⚡ Render (Node.js API)"]
    NeonDB[("🐘 Neon PostgreSQL")]
    CloudinaryStorage["☁️ Cloudinary (Imágenes)"]

    Client -->|Visita Tienda / Admin| VercelApp
    Client -->|Visita Landing| VercelLanding
    VercelApp -->|Peticiones REST /api| RenderAPI
    RenderAPI -->|Consultas SQL| NeonDB
    RenderAPI -->|Upload / Serve Fotos| CloudinaryStorage
```

---

## Paso 1: Configurar Neon (Base de Datos PostgreSQL)

1. Ingresa a **[Neon.tech](https://neon.tech/)** e inicia sesión (con GitHub o Google).
2. Haz clic en **Create Project**:
   - **Name:** `el-buen-corte-db`
   - **Region:** Selecciona la más cercana (ej. `US East (Ohio)` o `US East (N. Virginia)`).
3. Una vez creado, Neon te mostrará la pantalla de conexión:
   - Copia la **Connection string** (formato `postgresql://...`).
   - Asegúrate de que tenga al final `?sslmode=require`.
   - Ejemplo: `postgresql://neondb_owner:npg_abc123@ep-cool-cloud-456789.us-east-2.aws.neon.tech/neondb?sslmode=require`

> 💡 **Nota automática:** El backend ya incluye un script de inicialización automática (`initDatabase`). Al arrancar el servidor conectado a Neon, creará automáticamente todas las tablas (`usuarios`, `business_profile`, `inventario`, `pedidos`, `pedido_items`, `transacciones`, `mermas`, `simulaciones`, `notificaciones`) y sembrará el perfil por defecto y los usuarios administradores.

---

## Paso 2: Configurar Cloudinary (Imágenes Multimedia)

1. Ingresa a **[Cloudinary.com](https://cloudinary.com/)** e inicia sesión.
2. Ve al **Dashboard** (Panel de Control).
3. En la sección **Product Environment Credentials**, copia los 3 valores:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

---

## Paso 3: Desplegar el Backend en Render

1. Ingresa a **[Render.com](https://render.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **New +** y selecciona **Web Service**.
3. Conecta tu repositorio de GitHub `El-buen-corte-`.
4. Configura el servicio con estos parámetros:
   - **Name:** `el-buen-corte-api`
   - **Region:** Misma región o cercana a Neon (ej. `Ohio (US East)`).
   - **Branch:** `main` (o tu rama activa).
   - **Root Directory:** `backend` ⚠️ *(¡Muy importante!)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. En la sección **Environment Variables**, añade las siguientes claves:

| Variable | Valor / Descripción |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Tu string de conexión de **Neon** (con `?sslmode=require`) |
| `JWT_SECRET` | Una clave secreta segura (ej. `el_buen_corte_jwt_secret_prod_2026_super_segura`) |
| `CLOUDINARY_CLOUD_NAME` | Tu Cloud Name de **Cloudinary** |
| `CLOUDINARY_API_KEY` | Tu API Key de **Cloudinary** |
| `CLOUDINARY_API_SECRET` | Tu API Secret de **Cloudinary** |

6. Haz clic en **Create Web Service**.
7. Espera a que termine el despliegue. Al finalizar, copia la URL asignada por Render:
   - Ejemplo: `https://el-buen-corte-api.onrender.com`

---

## Paso 4: Desplegar el Frontend en Vercel

1. Ingresa a **[Vercel.com](https://vercel.com/)** e inicia sesión con GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `El-buen-corte-`.
4. En la pantalla de configuración:
   - **Project Name:** `el-buen-corte`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Haz clic en *Edit* y selecciona la carpeta `frontend` ⚠️ *(¡Muy importante!)*
5. En la sección **Environment Variables**, agrega:

| Variable | Valor |
|---|---|
| `VITE_API_BASE` | `https://el-buen-corte-api.onrender.com/api` *(Reemplaza con tu URL de Render + `/api`)* |

6. Haz clic en **Deploy**.
7. ¡Listo! Vercel te entregará la URL de tu aplicación (ej. `https://el-buen-corte.vercel.app`).

---

## Paso 5 (Opcional): Desplegar la Landing Page en Vercel

Si deseas desplegar la página de aterrizaje (Landing Page) de forma independiente:

1. En **Vercel**, haz clic en **Add New...** -> **Project**.
2. Selecciona de nuevo el repositorio `El-buen-corte-`.
3. Configuración:
   - **Project Name:** `el-buen-corte-landing`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `landing`
4. En **Environment Variables**:

| Variable | Valor |
|---|---|
| `VITE_DASHBOARD_URL` | `https://el-buen-corte.vercel.app/` *(La URL del frontend desplegado en el Paso 4)* |

5. Haz clic en **Deploy**.

---

## 🔑 Credenciales por Defecto Iniciales

Al conectar la base de datos por primera vez en Neon, el backend crea automáticamente:

- **Super Administrador:**
  - **Email / Usuario:** `superadmin@elbuencorte.com` o `superadmin`
  - **Contraseña:** `superadmin123`
- **Administrador de Tienda:**
  - **Email / Usuario:** `admin@elbuencorte.com` o `admin`
  - **Contraseña:** `admin123`

*(Puedes cambiar las contraseñas o crear nuevos usuarios desde el módulo de Usuarios y Roles en el panel de administración).*

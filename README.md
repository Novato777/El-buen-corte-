# 🥩 El Buen Corte — SaaS & Sistema de Gestión Inteligente para Carnicerías

> **Plataforma Integral de Gestión, Punto de Venta (POS), Control de Mermas, Calculadora de Res y Tienda Virtual con Notificaciones de Voz en Tiempo Real.**

---

## 🌟 Descripción General

**El Buen Corte** es una solución tecnológica completa diseñada especialmente para carnicerías, frigoríficos y distribuidoras de carne. Combina un potente **Dashboard Administrativo** para el control operativo, financiero y de inventario con una **Tienda Virtual Pública** para clientes finales, integrada con alertas de voz en tiempo real y despacho directo por WhatsApp.

---

## 🚀 Módulos y Funcionalidades Principales

### 1. 📊 Dashboard Ejecutivo & Resumen General
- **Métricas en Vivo**: Ingresos del día, egresos, saldo actual en caja, pedidos pendientes y alertas de stock bajo.
- **Estado de Caja en Tiempo Real**: Indicador visual interactivo (`🟢 Caja Abierta` / `🔴 Caja Cerrada`) con saldo acumulado.
- **Historial de Transacciones del Turno**: Tabla con scroll vertical independiente para auditar ventas y compras sin saturar la vista.

### 2. 🛍️ Tienda Virtual Pública (`/tienda`)
- **Catálogo de Cortes Frescos**: Tarjetas interactivas con foto de alta resolución, badge de stock dinámico y precio por kilogramo.
- **Filtros Inteligentes**: Buscador en tiempo real por corte o término, filtro de solo disponibles y píldoras de categorías dinámicas (`Carnes Rojas`, `Pollos`, `Embutidos`, `Cerdo`, `Otras`).
- **Carrito de Compras con Stepper**: Animación visual de adición (*fly-to-cart*), ajuste de peso en kilogramos y cálculo instantáneo.
- **🤖 Asistente de Cortes con IA (CortIA)**: Chatbot integrado para recomendar recetas, cortes para asados y técnicas de cocción a los compradores.
- **Checkout Integrado**: Formulario de despacho sin datáfono (solo Efectivo o Transferencia Nequi/Daviplata) con redirección automática a WhatsApp.

### 3. 🔔 Notificaciones & Alerta de Voz en Tiempo Real
- **Síntesis de Voz en Español**: Al recibir un pedido en la tienda virtual, el sistema reproduce una campana digital y pronuncia: *"¡Tienes un nuevo pedido!"*.
- **Sincronización Multi-Pestaña**: Comunicación instantánea mediante `BroadcastChannel` y `Storage Events` entre la tienda del cliente y el panel del carnicero.
- **Campana de Alertas**: Menú desplegable con conteo de no leídas, marcado rápido y botón para probar la voz del sistema.

### 4. 🛒 Gestión de Pedidos & Cobro
- **Recepción y Auditoría**: Listado de pedidos entrantes con estado (`Pendiente`, `Entregado`, `Cancelado`).
- **Modal de Nuevo Pedido**: Creación rápida de pedidos manuales con selección de múltiples cortes, cálculo en vivo y eliminación clara de filas (`🗑️ Quitar corte`).
- **Cobrar y Entregar**: Modal dedicado para finalizar el pedido seleccionando si fue pagado en **Efectivo** o **Transferencia**, registrando el ingreso automáticamente en la contabilidad.

### 5. 📦 Control de Inventario & Mermas
- **Inventario por Kilogramo**: Control de existencias con límites mínimos y avisos de stock crítico.
- **Abastecimiento Rápido**: Ingreso de nuevos pesajes de carne con generación automática del egreso contable estimado (70% del valor de venta).
- **Registro de Mermas**: Descuento de inventario por recorte en mostrador, secado en cámara o grasa/hueso, con historial auditable.

### 6. ⚖️ Calculadora de Rendimiento de la Res
- **Análisis de Aprovechamiento**: Cálculo del porcentaje de carne limpia, grasa y hueso a partir del peso en pie y costo total del animal.
- **Costo Real por Kilogramo**: Determinación exacta del costo por kg de carne aprovechable para fijar márgenes de ganancia saludables.
- **Historial de Simulaciones**: Almacenamiento y consulta de pesajes anteriores.

### 7. 💰 Contabilidad, Egresos y Arqueo de Caja
- **Flujo de Caja Diario**: Registro manual de ingresos adicionales y egresos operativos clasificados por método de pago (`💵 Efectivo` o `📲 Transferencia`).
- **Comprobante de Cierre de Caja**: Arqueo digital que resume base de apertura, ventas, egresos y saldo final con opción de apertura de nuevo turno.

### 8. 👑 Portal SuperAdministrador (Multi-Inquilino)
- **Gestión de Administradores**: Creación de usuarios con credenciales seguras (Bcrypt).
- **Bloqueo y Activación en 1 Clic**: Suspensión o reactivación inmediata de cuentas.
- **Restablecimiento de Claves**: Generación de nuevas contraseñas seguras para los administradores.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, Vanilla CSS con Tokens SaaS, Lucide Icons, Web Audio API, Web Speech API |
| **Backend API** | Node.js, Express 5, JSON Web Tokens (JWT), BcryptJS, Cloudinary SDK |
| **Base de Datos** | PostgreSQL 16 (Relacional con claves foráneas e integridad referencial) |
| **Despliegue** | **Vercel** (Frontend SPA) + **Render** (Backend API) + **Neon** (PostgreSQL Serverless) + **Cloudinary** (Media CDN) |

---

## 📁 Estructura del Monorepositorio

```
El-buen-corte-/
├── backend/                  # ⚙️ Servidor API REST en Node.js + Express
│   ├── db.js                 # Conexión a PostgreSQL (soporte SSL para Neon)
│   ├── index.js              # Controladores, autenticación JWT, Cloudinary y rutas
│   ├── .env.example          # Plantilla de variables de entorno del servidor
│   └── package.json
├── frontend/                 # 💻 Dashboard del Sistema y Tienda Virtual
│   ├── src/
│   │   ├── App.jsx           # Dashboard, modales, inventario, pedidos y caja
│   │   ├── PublicTiendaVirtual.jsx # Tienda Virtual pública y Chatbot CortIA
│   │   ├── Icons.jsx         # Iconografía SVG moderna
│   │   └── index.css         # Sistema de diseño, tokens, sombras y responsive
│   ├── vercel.json           # Configuración de enrutamiento SPA para Vercel
│   ├── .env.example          # Plantilla de variables de entorno del cliente
│   └── package.json
└── landing/                  # 🌐 Landing Page comercial (Vite + React + Tailwind v4)
```

---

## 💻 Instalación y Ejecución en Local

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL (Local o cuenta en Neon)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Novato777/El-buen-corte-.git
cd El-buen-corte-
```

### 2. Configurar y arrancar el Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/el_buen_corte
PORT=5000
JWT_SECRET=tu_clave_secreta_jwt_2026
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```
Inicia el servidor de desarrollo:
```bash
npm run dev
# Servidor escuchando en http://localhost:5000
```

### 3. Configurar y arrancar el Frontend
```bash
cd ../frontend
npm install
```
Crea un archivo `.env` en la carpeta `frontend/`:
```env
VITE_API_BASE=http://localhost:5000/api
```
Inicia la aplicación web:
```bash
npm run dev
# Dashboard disponible en http://localhost:5173/
# Tienda Virtual disponible en http://localhost:5173/tienda
```

---

## ☁️ Guía de Despliegue a Producción

```mermaid
flowchart LR
    A[🧑‍💻 Clientes / Admin] --> B[🌐 Vercel (Frontend)]
    B --> C[🚀 Render (Backend API)]
    C --> D[🗄️ Neon (PostgreSQL)]
    C --> E[☁️ Cloudinary (Imágenes)]
```

1. **Base de Datos en Neon**:
   - Crea un proyecto en [Neon.tech](https://neon.tech/) y copia la cadena `DATABASE_URL` con `sslmode=require`.
2. **Imágenes en Cloudinary**:
   - Crea una cuenta en [Cloudinary.com](https://cloudinary.com/) y copia tu `Cloud Name`, `API Key` y `API Secret`.
3. **Backend en Render**:
   - Crea un **Web Service** en [Render.com](https://render.com/) apuntando al directorio raíz `backend`.
   - Agrega las variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. **Frontend en Vercel**:
   - Importa el repositorio en [Vercel.com](https://vercel.com/) seleccionando el directorio raíz `frontend`.
   - Agrega la variable de entorno: `VITE_API_BASE=https://tu-api.onrender.com/api`.

---

## 👑 Credenciales de Acceso Iniciales

| Tipo de Usuario | Usuario / Correo | Contraseña |
| :--- | :--- | :--- |
| **Super Administrador** | `superadmin` / `superadmin@elbuencorte.com` | `superadmin123` |

---

## 📬 Créditos y Soporte

Desarrollado con dedicación y excelencia por **Brayan Cardozo** (<span style="color:#2563eb;font-weight:bold;">NeXo</span>).

- **WhatsApp**: [+57 322 206 7870](https://wa.me/573222067870)
- **Email**: cardozobrayan334@gmail.com
- **Licencia**: Propietaria / Todos los derechos reservados.

# 🥩 El Buen Corte — SaaS Multi-Inquilino & POS Inteligente para Carnicerías

> **Plataforma Integral de Gestión Cloud, Punto de Venta (POS), Control de Mermas, Calculadora de Res, Arqueo de Caja, Tienda Virtual con IA (CortIA) y Alertas de Voz en Tiempo Real.**

---

## 🌟 Descripción General

**El Buen Corte** es una plataforma SaaS moderna diseñada específicamente para el sector cárnico (carnicerías de barrio, frigoríficos, salsamentarias y distribuidoras mayoristas). Combina un potente **Sistema POS Administrativo Multi-Sede** con una **Tienda Virtual Pública** para clientes finales, integrada con pedidos directos por WhatsApp, chatbot asistente con IA y notificaciones de voz en tiempo real.

El sistema está optimizado para **computadoras de bajos recursos** (Celeron, 4GB RAM) y cuenta con una arquitectura **Mobile-First 100% ergonómica** que permite gestionar pedidos, inventario y caja cómodamente desde cualquier smartphone.

---

## 🛠️ Stack Tecnológico Completo

### Frontend (Dashboard POS & Tienda Virtual)
- **Core**: React 19 (`^19.2.8`) + Vite 6 (`^6.3.5`)
- **Estilos**: Vanilla CSS con Tokens de Diseño SaaS, Glassmorphism, Micro-animaciones y soporte integral para **Modo Oscuro / Modo Claro** (`[data-theme="dark"]`).
- **Arquitectura de Rendimiento**:
  - Code-splitting y carga bajo demanda con `React.lazy()` y `<Suspense>`.
  - División de paquetes Rollup (`manualChunks`) aislando `vendor-react` del código de negocio.
  - Soporte para aceleración por hardware y `@media (prefers-reduced-motion: reduce)`.
- **Iconografía**: Lucide React (`^1.34.0`) con iconos SVG personalizados.
- **Generación de Reportes**: `jspdf` (`^4.2.1`) para arqueos de caja y exportación de comprobantes de cierre.
- **APIs del Navegador**:
  - **Web Speech API**: Síntesis de voz en español para anuncios de nuevos pedidos entrantes.
  - **Web Audio API**: Campanilla digital sintetizada.
  - **BroadcastChannel API & Storage Events**: Sincronización instantánea multi-pestaña y multi-dispositivo.
- **Calidad de Código**: Oxlint (`^1.79.0`) para análisis estático ultra-rápido.

### Landing Page Comercial (`/landing`)
- **Core**: React 19 (`^19.1.0`) + Vite 6 (`^6.3.5`)
- **Estilos**: Tailwind CSS v4 (`^4.1.5`) con `@tailwindcss/vite`
- **Iconografía**: React Icons (`^5.6.0`)

### Backend (API RESTful)
- **Runtime**: Node.js (v18+)
- **Framework**: Express 5 (`^5.2.1`) en arquitectura de módulos ES (`type: "module"`)
- **Optimización de Red**: `compression` (`^1.8.1`) con compresión HTTP GZIP / Brotli (reducción de payload en un 75-80%).
- **Seguridad y Autenticación**:
  - JSON Web Tokens (JWT) (`^9.0.3`) con validación de roles (`superadmin`, `admin`, `cajero`).
  - Encriptación de contraseñas con BcryptJS (`^3.0.3`) (10 salt rounds).
  - Middleware de Idempotencia (`idempotency.js`) para evitar duplicación de cobros y transacciones.
  - CORS (`^2.8.6`) para protección de orígenes cruzados.
- **Persistencia & Cloud**:
  - PostgreSQL (`pg` `^8.23.0`) con Pool de conexiones optimizado para entornos Serverless y Cloud.
  - Cloudinary SDK (`^2.11.0`) para almacenamiento y entrega optimizada de imágenes de cortes.

### Infraestructura & Despliegue
- **Frontend SPA**: Vercel (CDN Global)
- **Backend API**: Render (Web Service con auto-ping anti-inactividad)
- **Base de Datos**: PostgreSQL 16 (Neon Serverless con SSL / PostgreSQL local)
- **Media CDN**: Cloudinary Media Cloud

---

## 🚀 Módulos del Sistema

### 1. 📊 Dashboard Ejecutivo & Métricas
- Cuadrícula métrica móvil de **2 columnas** con KPIs de ventas del día, pedidos activos, egresos totales y saldo neto en caja.
- **Acciones Rápidas Simétricas (Grid 2x2)**: Accesos directos a *Nuevo Pedido*, *Abastecer Stock*, *Registrar Merma* y botón inteligente de *Caja* (alterna entre *Cerrar Caja* o *Abrir Caja* según el estado actual).
- Historial de transacciones del turno con filtros por método de pago.

### 2. 📱 Barra de Navegación Inferior Móvil (Bottom Nav)
- Barra ergonómica fija en celulares (`max-width: 768px`) con 5 accesos directos al alcance del pulgar:
  1. 🏠 **Inicio**: Dashboard y KPIs.
  2. 📋 **Pedidos**: Con badge numérico en vivo de pedidos pendientes.
  3. 📦 **Stock**: Con indicador de alerta de existencias críticas.
  4. 💰 **Caja**: Con punto de luz verde pulsante si la caja está abierta.
  5. ☰ **Menú**: Acceso lateral a Perfil, Calculadora, tema y cierre de sesión.
- **Ocultamiento Automático de Barra**: Al abrir cualquier modal o formulario a pantalla completa, la barra inferior se oculta automáticamente para garantizar máxima visibilidad táctil.

### 3. 🛒 Gestión de Pedidos & Despacho
- Filtros segmentados en **4 columnas visibles sin scroll horizontal**: `Todos`, `Pendientes`, `Entregados`, `Cancelados`.
- Notificación toast flotante y voz sintetizada al entrar un pedido desde la tienda virtual.
- Modal de cobro y despacho con cálculo automático de vueltas para efectivo y registro de comprobantes de transferencia.
- Tarjetas táctiles adaptadas a modo oscuro de alto contraste.

### 4. 📦 Inventario, Mermas & Multi-Unidad
- Soporte para unidades de medida: **Kilogramos (kg)**, **Libras (lb)** y **Unidades (und)** con conversión automática.
- Selector de categorías organizado en cuadrícula de **3 columnas x 2 filas** (`Todos`, `Carnes Rojas`, `Pollos`, `Cerdo`, `Embutidos`, `Otras`).
- Módulo de mermas para descontar inventario por recorte, hueso o secado en cámara con justificación auditable.

### 5. 💵 Caja & Contabilidad Operativa
- Barra superior de acciones balanceada:
  - Fila 1 (Lado a Lado): `🛒 Registrar Venta` (Verde) y `💸 Registrar Gasto` (Rojo).
  - Fila 2 (Ancho Completo): `🔒 Realizar Cierre de Caja` (Oro).
- Arqueo de caja digital con cálculo de base inicial, ingresos en efectivo/transferencia, egresos y exportación de informe en **PDF**.

### 6. ⚖️ Calculadora de Rendimiento de Res
- Estimación precisa de aprovechamiento de carne limpia, hueso y grasa a partir del peso en pie y costo de compra.
- Cálculo de punto de equilibrio y costo real por kilogramo.
- Historial de pesajes y simulaciones anteriores.

### 7. 🛍️ Tienda Virtual Pública (`/tienda?tenant=X`)
- Catálogo interactivo de 2 columnas en teléfonos móviles.
- Carrito flotante con animación de adición y ajuste de peso en kilogramos.
- **CortIA**: Asistente virtual inteligente para asesorar cortes, recetas y términos de asado.
- Despacho directo a WhatsApp con mensaje preformateado y detalle de cortes seleccionados.

### 8. 👑 Portal SuperAdministrador (SaaS Global)
- Consola independiente lazy-loaded para administración de sedes y carnicerías.
- Control de usuarios (bloqueo/desbloqueo instantáneo, restablecimiento de credenciales).
- Gestión de licencias y renovación de suscripciones SaaS.

---

## 📁 Estructura del Proyecto

```
El-buen-corte-/
├── backend/                  # ⚙️ Servidor API RESTful
│   ├── db.js                 # Conexión PostgreSQL con soporte SSL/Local
│   ├── idempotency.js        # Middleware de prevención de peticiones duplicadas
│   ├── index.js              # Controladores, autenticación JWT, compresión e índices SQL
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/                 # 💻 Aplicación Web POS + Tienda Virtual
│   ├── src/
│   │   ├── App.jsx           # Enrutador raíz, Dashboard POS, Caja, Pedidos e Inventario
│   │   ├── LoginView.jsx     # Vista modular de autenticación (POS vs SuperAdmin)
│   │   ├── SuperAdminPortal.jsx # Consola SaaS para control de inquilinos y licencias
│   │   ├── PublicTiendaVirtual.jsx # Tienda Virtual pública y chatbot CortIA
│   │   ├── Icons.jsx         # Iconos SVG Lucide unificados
│   │   ├── utils/
│   │   │   ├── idempotency.js # Generador de claves de idempotencia UUID
│   │   │   └── units.js       # Utilidades de conversión kg, lb y und
│   │   └── index.css         # Sistema de diseño, tokens, dark mode y media queries
│   ├── vite.config.js        # Configuración de chunks dinámicos Rollup
│   ├── package.json
│   └── .env.example
│
└── landing/                  # 🌐 Landing Page de presentación comercial
    ├── src/
    │   ├── App.jsx           # Landing page interactiva con Tailwind CSS v4
    │   └── main.jsx
    └── package.json
```

---

## 💻 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v18.0 o superior
- **PostgreSQL**: Base de datos local o instancia en la nube (Neon, Supabase, Render)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Novato777/El-buen-corte-.git
cd El-buen-corte-
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/`:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_bd
PORT=5000
JWT_SECRET=clave_secreta_jwt_2026
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```
Iniciar el servidor:
```bash
npm run dev
# API escuchando en http://localhost:5000
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```
Crea un archivo `.env` en la carpeta `frontend/`:
```env
VITE_API_BASE=http://localhost:5000/api
```
Iniciar la app:
```bash
npm run dev
# Dashboard disponible en: http://localhost:5173/
# Tienda Virtual disponible en: http://localhost:5173/tienda?tenant=1
```

---

## 👑 Credenciales por Defecto

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Super Administrador** | `superadmin` / `superadmin@elbuencorte.com` | `superadmin123` |
| **Administrador POS** | `admin` | *(Configurable desde SuperAdmin)* |
| **Cajero** | `cajero` | *(Configurable desde SuperAdmin)* |

---

## 📬 Desarrollador & Soporte

Diseñado y desarrollado con los más altos estándares de calidad por **Brayan Cardozo** (<span style="color:#2563eb;font-weight:bold;">NeXo</span>).

- **WhatsApp**: [+57 322 206 7870](https://wa.me/573222067870)
- **Email**: cardozobrayan334@gmail.com
- **Licencia**: Propietaria / Todos los derechos reservados © 2026.

# 🥩 El Buen Corte — Landing

Landing page de **El Buen Corte**, un software de gestión inteligente para
carnicerías. La página presenta el producto a clientes potenciales y los invita
a solicitar una demo por WhatsApp.

> Construida como sitio independiente con **Vite + React + Tailwind CSS v4**.
> Proyecto hermano de [NeXo](https://ne-xo-page.vercel.app).

---

## ✨ Qué muestra la landing

La web presenta, sección por sección, todo lo que hace el software:

- **Reportes diarios y contabilidad** — cierre de caja automático.
- **Gestión de pedidos** — registro y seguimiento de cada venta.
- **Promos para clientes VIP** — descuentos automáticos a los mejores clientes.
- **Pagos de nómina** — control de pagos, horas y adelantos.
- **Control de inventario** — stock y mermas en tiempo real.
- **🤖 Cálculo inteligente de la res** — el visitante ingresa el peso del animal
  y una **calculadora interactiva** le muestra al instante cuántos kilos son
  aprovechables (carne, hueso, grasa) y cuánto es merma.

Incluye además: planes/precios, pasos para empezar, carrusel de tecnologías y un
CTA final que abre WhatsApp con un mensaje predefinido.

---

## 🚀 Correr en local

Requiere [Node.js](https://nodejs.org) 18+.

```bash
npm install      # instala dependencias
npm run dev      # desarrollo → http://localhost:5180
npm run build    # genera /dist para producción
npm run preview  # previsualiza el build de producción
```

El puerto está fijado en `5180` (ver `vite.config.js`) para no chocar con otros
proyectos. Si está ocupado, Vite avisa con un error claro en vez de cambiarlo en
silencio.

---

## 🧩 Stack

| Herramienta | Uso |
|---|---|
| [Vite](https://vite.dev) | Bundler / dev server |
| [React 19](https://react.dev) | UI |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilos |
| [react-icons](https://react-icons.github.io/react-icons/) | Íconos del carrusel de tecnologías |

Sin dependencias extra: las animaciones de aparición usan `IntersectionObserver`
nativo y los íconos de la UI son SVG propios.

---

## 📁 Estructura

```
carnes/
├─ index.html              # HTML raíz (título y meta del software)
├─ vite.config.js          # Config de Vite (puerto 5180 fijo)
├─ public/
│  ├─ favicon.svg
│  └─ img/
│     └─ fondo.png         # Imagen de fondo del hero y del CTA final
└─ src/
   ├─ main.jsx             # Punto de entrada de React
   ├─ index.css            # Tailwind + estilos base
   ├─ App.jsx              # Toda la landing (datos + secciones)
   ├─ Icons.jsx            # Íconos SVG de la interfaz
   ├─ LogoLoop.jsx         # Carrusel infinito de tecnologías
   └─ LogoLoop.css         # Estilos del carrusel
```

---

## 🎨 Personalizar

Casi todo se edita en bloques al inicio de [`src/App.jsx`](src/App.jsx):

| Constante | Qué controla |
|---|---|
| `PRODUCTO` | Nombre, dueño, WhatsApp, email del contacto. |
| `FUNCIONES` | Tarjetas de funciones del software. |
| `BENEFICIOS` | Bloque "Por qué elegirnos". |
| `PASOS` | Los 3 pasos para empezar. |
| `PLANES` | Planes y precios (referenciales, edítalos). |
| `STATS` | Cifras del strip bajo el hero. |
| `REND` | Porcentajes de la calculadora de la res (rendimiento en canal, carne, hueso, grasa, merma). |
| `techLogos` | Tecnologías del carrusel inferior. |

### Imágenes

Guarda las imágenes en `public/img/`. Si falta alguna, se muestra un degradado de
respaldo, así la landing **nunca se ve rota**. La imagen de fondo actual es
`public/img/fondo.png` (se usa en el hero y en el CTA final).

---

## ☁️ Deploy en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel → **New Project** → importa el repo (detecta Vite automáticamente).
   - Build command: `npm run build`
   - Output directory: `dist`
3. Listo. Copia la URL final.

---

## 📬 Contacto

Desarrollado por **Brayan Cardozo**.

- WhatsApp: [+57 322 206 7870](https://wa.me/573222067870)
- Email: cardozobrayan334@gmail.com

---

<p align="center">Hecho con 🥩 y código · <a href="https://ne-xo-page.vercel.app">NeXo</a></p>

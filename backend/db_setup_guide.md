# Guía de Creación y Configuración de la Base de Datos - El Buen Corte

Esta guía contiene los pasos detallados para crear la base de datos PostgreSQL localmente usando **DBeaver**, conectarla a nuestro backend en Node.js, y finalmente migrarla a producción en **Neon**.

---

## 1. Estructura de la Base de Datos (Esquema SQL)

Ejecuta el siguiente script en tu consola SQL de **DBeaver** para crear las tablas necesarias:

```sql
-- 1. Tabla de Perfil de Negocio (Almacena la configuración general en formato JSONB)
CREATE TABLE IF NOT EXISTS business_profile (
    id SERIAL PRIMARY KEY,
    general JSONB NOT NULL,
    identidad JSONB NOT NULL,
    contacto JSONB NOT NULL,
    ubicacion JSONB NOT NULL,
    redes JSONB NOT NULL,
    horarios JSONB NOT NULL,
    financiero JSONB NOT NULL,
    adicional JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Inventario de Productos
CREATE TABLE IF NOT EXISTS inventario (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    foto TEXT,
    precio_venta NUMERIC(12, 2) NOT NULL,
    stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    limite_min NUMERIC(10, 2) NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(50) PRIMARY KEY,
    cliente VARCHAR(150) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    fecha VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Ítems del Pedido (Relación uno a muchos)
CREATE TABLE IF NOT EXISTS pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id VARCHAR(50) REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id VARCHAR(50),
    nombre VARCHAR(150) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL
);

-- 5. Tabla de Transacciones (Contabilidad / Caja)
CREATE TABLE IF NOT EXISTS transacciones (
    id VARCHAR(50) PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL, -- 'Ingreso' o 'Egreso'
    descripcion TEXT NOT NULL,
    monto NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(20),   -- 'Efectivo' o 'Transferencia'
    fecha VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Mermas (Pérdidas de inventario)
CREATE TABLE IF NOT EXISTS mermas (
    id VARCHAR(50) PRIMARY KEY,
    producto_nombre VARCHAR(150) NOT NULL,
    peso NUMERIC(10, 2) NOT NULL,
    motivo TEXT NOT NULL,
    fecha VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Simulaciones (Calculadora de Res)
CREATE TABLE IF NOT EXISTS simulaciones (
    id SERIAL PRIMARY KEY,
    fecha VARCHAR(50) NOT NULL,
    peso_pie NUMERIC(10, 2) NOT NULL,
    costo_total NUMERIC(12, 2) NOT NULL,
    carne_kg NUMERIC(10, 2) NOT NULL,
    real_costo_kg NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserta el perfil por defecto inicial si no existe
INSERT INTO business_profile (id, general, identidad, contacto, ubicacion, redes, horarios, financiero, adicional)
VALUES (
    1,
    '{"nombre": "El Buen Corte", "nombreComercial": "", "razonSocial": "El Buen Corte S.A.S.", "tipoNegocio": "Carnicería", "tipoNegocioOtro": "", "descripcion": "Carnicería premium especializada en cortes finos de res, cerdo y embutidos artesanales.", "anoCreacion": "2024", "estado": "Activo"}'::jsonb,
    '{"logo": "", "portada": ""}'::jsonb,
    '{"telefonoPrincipal": "+57 322 206 7870", "telefonoSecundario": "", "whatsapp": "+57 322 206 7870", "email": "cardozobrayan334@gmail.com", "sitioWeb": "https://elbuencorte.com"}'::jsonb,
    '{"pais": "Colombia", "departamento": "Cundinamarca", "ciudad": "Bogotá", "direccion": "Calle 80 #15-20", "codigoPostal": "110111", "latitud": "", "longitud": ""}'::jsonb,
    '[{"id": "1", "plataforma": "Facebook", "usuario": "El Buen Corte", "url": "https://facebook.com/elbuencorte"}, {"id": "2", "plataforma": "Instagram", "usuario": "@elbuencorte", "url": "https://instagram.com/elbuencorte"}]'::jsonb,
    '{"Lunes": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Martes": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Miércoles": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Jueves": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Viernes": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Sábado": {"abierto": true, "apertura": "08:00", "cierre": "20:00"}, "Domingo": {"abierto": false, "apertura": "09:00", "cierre": "14:00"}}'::jsonb,
    '{"moneda": "COP", "simbolo": "$", "nit": "901.234.567-8", "responsable": "Brayan Cardozo"}'::jsonb,
    '{"mision": "Proveer los mejores cortes de carne con altos estándares de higiene y servicio excepcional.", "vision": "Ser la carnicería líder y de confianza preferida por los hogares y restaurantes de la región.", "servicios": ["Venta de carnes", "Servicio a domicilio", "Cortes personalizados", "Empaque al vacío"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;
```

---

## 2. Paso a Paso en DBeaver (Local)

1. Abre **DBeaver** y crea una nueva conexión a PostgreSQL haciendo clic en el icono de enchufe en la esquina superior izquierda.
2. Selecciona **PostgreSQL** y haz clic en **Next**.
3. Rellena los datos de tu PostgreSQL local:
   * **Host:** `localhost`
   * **Port:** `5432`
   * **Database:** `el_buen_corte` (si no existe, puedes dejar `postgres` y luego crear la base de datos).
   * **Username:** `postgres`
   * **Password:** Tu contraseña local de PostgreSQL.
4. Haz clic en **Test Connection** para verificar que todo está correcto, luego haz clic en **Finish**.
5. Si necesitas crear la base de datos, haz clic derecho sobre **Databases** en el árbol de conexión de DBeaver, selecciona **Create New Database** y llámala `el_buen_corte`.
6. Selecciona la nueva base de datos `el_buen_corte`, haz clic en **SQL Editor** -> **New SQL Script**, pega todo el script del **Esquema SQL** de arriba y presiona **Ctrl + Enter** (o haz clic en el botón de reproducción) para crear las tablas.

---

## 3. Conexión del Backend en Node.js (Servidor)

1. En la consola del proyecto, navega a la carpeta del backend e instala el driver cliente de PostgreSQL:
   ```bash
   cd backend
   npm install pg
   ```
2. Abre el archivo `.env` del backend (`backend/.env`) y agrega las credenciales locales:
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:TU_CONTRASEÑA@localhost:5432/el_buen_corte
   ```
   *(Reemplaza `TU_CONTRASEÑA` por tu clave real).*

---

## 4. Paso a Paso para Desplegar en Neon (Producción)

**Neon** es una base de datos PostgreSQL Serverless ideal para producción.

1. Regístrate en **[Neon.tech](https://neon.tech/)** y crea un nuevo proyecto llamado `el-buen-corte`.
2. Neon te dará automáticamente un string de conexión de base de datos (`Connection String`), que lucirá así:
   ```text
   postgres://alex:xxxxx-xxxx-xxxx@ep-soft-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copia ese string de conexión.
4. **Ejecutar el esquema SQL en Neon:**
   * En el panel de control de tu proyecto en Neon, ve a la pestaña **SQL Editor** en la barra lateral.
   * Pega el mismo script del **Esquema SQL** (Paso 1) y haz clic en **Run**. Las tablas y el perfil por defecto se crearán instantáneamente.
5. **Configurar el Backend en Producción (Render):**
   * Cuando subas tu backend a Render, ve a la configuración de variables de entorno de tu Web Service.
   * Agrega la variable `DATABASE_URL` y pégale el string de conexión que copiaste de Neon.
   * Asegúrate de agregar `?sslmode=require` al final del string si no lo incluye, para garantizar una conexión cifrada obligatoria por Neon.

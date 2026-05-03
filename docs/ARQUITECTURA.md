# 🏗️ ARQUITECTURA DEL SISTEMA: BD + Backend + Frontend

**Estado:** Documentación técnica completa  
**Fecha:** 3 de abril de 2026  

---

## 🔷 DIAGRAMA GENERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (React Frontend)                          │
│                          http://localhost:3000                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │  LoginForm.jsx                                               │           │
│  │  ┌─────────────────────────────────────────────────────┐    │           │
│  │  │ Input: correo + password                            │    │           │
│  │  │ POST /api/auth/login                                │    │           │
│  │  │ {correo: "...", password: "..."}                   │    │           │
│  │  └──────────────┬──────────────────────────────────────┘    │           │
│  └─────────────────┼────────────────────────────────────────────┘           │
│                    │ HTTP POST                                              │
│                    ▼                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                INTERNET                                      │
└──────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│         EXPRESS.JS BACKEND (Node.js)                                        │
│         http://localhost:5000                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │  authController.js - POST /api/auth/login                  │           │
│  │                                                              │           │
│  │  1️⃣ Recibe: {correo, password}                             │           │
│  │     ↓                                                        │           │
│  │  2️⃣ Valida contra directores.json                          │           │
│  │     if (directores[correo].password === password) ✓        │           │
│  │     ↓                                                        │           │
│  │  3️⃣ Conecta a MySQL                                        │           │
│  │     SELECT * FROM directores WHERE correo = ?              │           │
│  │     ↓                                                        │           │
│  │  4️⃣ Si no existe → INSERT (crear automático)              │           │
│  │     Si existe → UPDATE (sincronizar datos)                 │           │
│  │     ↓                                                        │           │
│  │  5️⃣ Registra en login_logs                                │           │
│  │     INSERT INTO login_logs (director_id, fecha, exitoso)   │           │
│  │     ↓                                                        │           │
│  │  6️⃣ Devuelve JSON con datos director (SIN contraseña)   │           │
│  │     {success: true, director: {id, nombre, ...}}           │           │
│  │                                                              │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  Archivos clave:                                                            │
│  • authController.js  → Lógica de login                                    │
│  • config/db.js       → Conexión + validación                             │
│  • server.js          → Servidor Express                                    │
│  • routes/auth.js     → Rutas API                                          │
│  • data/directores.json → Credenciales (JSON)                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
         │             │              │                │
         │ JSON        │ SQL Queries  │                │
         │ Read        │              │                │
         ▼             ▼              │                │
   ┌──────────┐  ┌──────────────────┐│                │
   │ ARCHIVO  │  │                  ││                │
   │ JSON     │  │  MySQL - Laragon ││                │
   └──────────┘  │  (Puerto 3306)   ││                │
                 └──────────────────┘│                │
      directores │                   │                │
      .json      │  ┌────────────────┼────────────────┐
                 │  │                │                │
                 │  ▼                ▼                ▼
                 │ ┌──────────────────────────────────┐
                 │ │  BASE DE DATOS: ugel_db         │
                 │ │                                  │
                 │ │  Tablas:                         │
                 │ │  ┌──────────────────────────┐   │
                 │ │  │ directores               │   │
                 │ │  ├─────────────────────────┼┐  │
                 │ │  │ id (INT PK)             ││  │
                 │ │  │ dni (VARCHAR 8)         ││  │
                 │ │  │ nombre (VARCHAR)        ││  │
                 │ │  │ apellido (VARCHAR)      ││  │
                 │ │  │ correo (VARCHAR UNIQUE) ││  │
                 │ │  │ colegio (VARCHAR)       ││  │
                 │ │  │ password_hash (VARCHAR) ││  │
                 │ │  │ creado_en (TIMESTAMP)   ││  │
                 │ │  │ actualizado_en (TIMESTAMP)  │
                 │ │  └─────────────────────────┼┘  │
                 │ │                                  │
                 │ │  ┌──────────────────────────┐   │
                 │ │  │ login_logs              │   │
                 │ │  ├─────────────────────────┼┐  │
                 │ │  │ id (INT PK)             ││  │
                 │ │  │ director_id (INT FK)    ││  │
                 │ │  │ correo (VARCHAR)        ││  │
                 │ │  │ fecha (TIMESTAMP)       ││  │
                 │ │  │ exitoso (BOOLEAN)       ││  │
                 │ │  │ razon_fallo (VARCHAR)   ││  │
                 │ │  │ ip_address (VARCHAR)    ││  │
                 │ │  └─────────────────────────┼┘  │
                 │ │                                  │
                 │ └──────────────────────────────────┘
                 │
                 └─ Motor: InnoDB, Charset: utf8mb4
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
c:\Users\edgar\OneDrive\Desktop\prueba\
│
├── 📄 ANALISIS_BD_Y_VALIDACION.md
├── 📄 PROBLEMA_Y_SOLUCION.md
├── 📄 GUIA_RAPIDA.md
├── 📄 ARQUITECTURA.md (este archivo)
├── 📄 package.json (raíz)
│
├── 📁 backend/
│   ├── 📄 .env ⭐ CREAR (credenciales MySQL)
│   ├── 📄 .env.example (referencia)
│   ├── 📄 server.js (puerto 5000)
│   ├── 📄 package.json
│   │
│   ├── 📁 config/
│   │   └── 📄 db.js (conexión MySQL + validación JSON)
│   │
│   ├── 📁 controllers/
│   │   └── 📄 authController.js (POST /api/auth/login)
│   │
│   ├── 📁 routes/
│   │   └── 📄 auth.js (definición de rutas)
│   │
│   ├── 📁 data/
│   │   └── 📄 directores.json ⭐ Credenciales (fuente primaria)
│   │
│   ├── 📁 database/
│   │   ├── 📄 schema.sql ⭐ Crear BD en MySQL
│   │   └── 📄 importar-directores.js
│   │
│   └── 📁 env/
│       └── .env oculto
│
├── 📁 frontend/
│   ├── 📄 package.json
│   ├── 📄 src/
│   │
│   ├── 📁 public/
│   │   └── index.html (puerto 3000)
│   │
│   └── 📁 src/
│       ├── 📄 App.js (contenedor principal)
│       ├── 📄 index.js
│       │
│       ├── 📁 components/
│       │   ├── 📄 LoginForm.jsx ⚠️ NECESITA CAMBIOS (conectar al backend)
│       │   ├── 📄 DirectorDashboard.jsx
│       │   ├── 📄 DirectorSidebar.jsx
│       │   └── ...más componentes
│       │
│       └── 📁 data/
│           └── 📄 users.js (MOCK - NO USAR cuando backend esté activo)
```

---

## 🔄 FLUJO DE DATOS COMPLETO

### Escenario: Login Exitoso

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USUARIO INGRESA CREDENCIALES                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Correo: juan.perez@colegio.edu.pe                               │
│ Contraseña: password123                                         │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND → BACKEND (POST /api/auth/login)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ {                                                                │
│   "correo": "juan.perez@colegio.edu.pe",                       │
│   "password": "password123"                                     │
│ }                                                                │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. BACKEND: VALIDA CONTRA directores.json                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ Encuentra: juan.perez@colegio.edu.pe en JSON                  │
│ ✓ Contraseña coincide: password123                              │
│ → Continuar al paso 4                                            │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. BACKEND: BUSCA EN MySQL (tablaDirectores)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ SELECT * FROM directores                                         │
│ WHERE correo = 'juan.perez@colegio.edu.pe'                      │
│                                                                   │
│ ¿Resultado?                                                      │
│ ├─ SI EXISTE (ya login antes)                                   │
│ │  └─ UPDATE: Actualizar datos si cambiaron en JSON            │
│ │                                                                │
│ └─ NO EXISTE (primera vez que accede)                           │
│    └─ INSERT: Crear registro automáticamente                    │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. BACKEND: REGISTRA EN login_logs (AUDITORÍA)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ INSERT INTO login_logs (                                         │
│   director_id: 1,                                                │
│   correo: 'juan.perez@colegio.edu.pe',                          │
│   fecha: NOW(),                                                  │
│   exitoso: true,                                                 │
│   ip_address: '127.0.0.1'                                        │
│ )                                                                │
│                                                                   │
│ → Queda registro permanente de acceso                            │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. BACKEND → FRONTEND (RESPUESTA)                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ {                                                                │
│   "success": true,                                               │
│   "message": "Inicio de sesión exitoso.",                       │
│   "director": {                                                  │
│     "id": 1,                                                     │
│     "nombre": "Juan",                                            │
│     "apellido": "Pérez",                                         │
│     "correo": "juan.perez@colegio.edu.pe",                      │
│     "dni": "12345678",                                           │
│     "colegio": "Colegio Nacional Jorge Chávez"                  │
│   }                                                              │
│ }                                                                │
│                                                                   │
│ ⭐ NOTA: Password NUNCA se devuelve por seguridad              │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND: PROCESA RESPUESTA                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ Guarda datos director en contexto/localStorage               │
│ ✓ Redirige a DirectorDashboard                                  │
│ ✓ Muestra datos del usuario logueado                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

### Escenario: Login Fallido

```
┌──────────────────────────────────────────────────────────────────┐
│ ENTRADA INCORRECTA: Contraseña mal                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Correo: juan.perez@colegio.edu.pe                               │
│ Contraseña: PASSWORD_INCORRECTA ❌                               │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
                   BACKEND
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ VALIDACIÓN FALLIDA: JSON no coincide                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ directores['juan.perez@colegio.edu.pe'].password = "password123"│
│ input.password = "PASSWORD_INCORRECTA"                           │
│ ✗ NO COINCIDEN                                                   │
│                                                                   │
│ → Retorna error ANTES de acceder a BD                            │
│ → NUNCA se registra en login_logs (optimización)               │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ RESPUESTA AL FRONTEND                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ HTTP 401 Unauthorized                                            │
│                                                                   │
│ {                                                                │
│   "success": false,                                               │
│   "message": "Correo o contraseña incorrectos."                 │
│ }                                                                │
│                                                                   │
│ → Frontend muestra error al usuario                             │
│ → NO redirige al dashboard                                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 FLUJO DE VALIDACIÓN

```
ENTRADA (correo + contraseña)
        │
        ▼
    ¿Existe en directores.json?
        │
        ├─── NO ──► Retornar: 401 Unauthorized
        │           "Correo o contraseña incorrectos"
        │
        └─── SÍ ──► ¿Contraseña coincide?
                    │
                    ├─── NO ──► Retornar: 401 Unauthorized
                    │           "Correo o contraseña incorrectos"
                    │
                    └─── SÍ ──► Continuar...
                                │
                                ▼
                        Buscar en BD MySQL
                                │
                                ├─── NO EXISTE ──► INSERT (crear)
                                │
                                └─── EXISTE ──► UPDATE (sincronizar)
                                        │
                                        ▼
                                Registrar en login_logs
                                        │
                                        ▼
                                Retornar: 200 OK
                                {director data}
```

---

## 📊 TABLAS MYSQL

### Tabla: directores
```sql
+──────────────────────────────────────────────────────────────┐
│                        directores                            │
├────────────────────────┬──────────────┬──────────────────────┤
│ Columna                │ Tipo         │ Propósito            │
├────────────────────────┼──────────────┼──────────────────────┤
│ id (PK)                │ INT          │ Identificador único  │
│ dni                    │ VARCHAR(8)   │ DNI del director     │
│ nombre                 │ VARCHAR(100) │ Nombre               │
│ apellido               │ VARCHAR(100) │ Apellido             │
│ correo (UNIQUE)        │ VARCHAR(100) │ Correo (clave)       │
│ colegio                │ VARCHAR(150) │ Nombre del colegio   │
│ password_hash          │ VARCHAR(255) │ Contraseña (bcrypt)  │
│ ultimo_login           │ TIMESTAMP    │ Último acceso        │
│ creado_en              │ TIMESTAMP    │ Fecha creación       │
│ actualizado_en         │ TIMESTAMP    │ Última actualización │
└────────────────────────┴──────────────┴──────────────────────┘
```

### Tabla: login_logs
```sql
+──────────────────────────────────────────────────────────────┐
│                      login_logs                              │
├────────────────────────┬──────────────┬──────────────────────┤
│ Columna                │ Tipo         │ Propósito            │
├────────────────────────┼──────────────┼──────────────────────┤
│ id (PK)                │ INT          │ Identificador único  │
│ director_id (FK)       │ INT          │ Referencia director  │
│ correo                 │ VARCHAR(100) │ Correo del acceso    │
│ fecha                  │ TIMESTAMP    │ Cuándo se logueó     │
│ exitoso                │ BOOLEAN      │ Login exitoso o no   │
│ razon_fallo            │ VARCHAR(255) │ Por qué falló (si es)│
│ ip_address             │ VARCHAR(45)  │ IP del cliente       │
└────────────────────────┴──────────────┴──────────────────────┘
```

---

## 🛠️ TECNOLOGÍAS USADAS

| Componente | Tecnología | Versión | Puerto | Rol |
|-----------|-----------|---------|--------|-----|
| **Frontend** | React | 18.x | 3000 | UI/Interfaz |
| **Backend** | Node.js + Express | 20.x | 5000 | API/Lógica |
| **BD** | MySQL | 5.7+ | 3306 | Persistencia |
| **Validación** | JSON (directores.json) | - | - | Fuente primaria |
| **Seguridad** | bcryptjs | 2.4.x | - | Hash contraseñas |

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [x] Base de datos MySQL creada
- [x] Tablas (directores, login_logs) creadas
- [x] Backend configurado (Express)
- [x] Rutas de autenticación definidas
- [x] Validación contra JSON implementada
- [x] Sincronización a BD automática
- [x] Respuestas seguras (sin contraseña)
- [ ] ⚠️ Frontend conectado al backend (PENDIENTE)
- [ ] LoginForm debe hacer POST a /api/auth/login
- [ ] Tests de integración
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Rate limiting en login
- [ ] Manejo de sesiones con JWT (futuro)

---

## 🔗 ENDPOINTS API

### POST /api/auth/login
**Descripción:** Autentica un director

**Request:**
```json
{
  "correo": "juan.perez@colegio.edu.pe",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "director": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@colegio.edu.pe",
    "dni": "12345678",
    "colegio": "Colegio Nacional Jorge Chávez"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Correo o contraseña incorrectos."
}
```

### POST /api/auth/change-password
**Descripción:** Cambia contraseña de director

**Request:**
```json
{
  "correo": "juan.perez@colegio.edu.pe",
  "newPassword": "nuevacontraseña123"
}
```

---

## 🎯 RESUMEN ARQUITECTURA

```
                    CLIENTE (React)
                    ↓ HTTP/JSON ↓
                    SERVIDOR (Node/Express)
                    ↓ Validación ↓
            JSON (directores.json)
                    ↓ Sincronización ↓
            MySQL (ugel_db)
```

**Características:**
- ✅ Validación de 2 fuentes (JSON + BD)
- ✅ Sincronización automática
- ✅ Auditoría completa
- ✅ Seguridad (sin exposición de contraseña)
- ✅ Escalable (ilimitados directores)

---

**Documento generado para entender la arquitectura completa del sistema.**

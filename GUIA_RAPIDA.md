# ⚡ GUÍA RÁPIDA: Activar BD MySQL + Backend (Laragon)

**Objetivo:** En 10 minutos tener base de datos + validación funcionando  
**Requisito:** Laragon instalado  

---

## 📋 CHECKLIST DE 5 PASOS

### PASO 1: Crear archivo `.env` en Backend [2 min]
```
📁 c:\Users\edgar\OneDrive\Desktop\prueba\backend\
```

**Crear archivo:** `.env`

**Contenido:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ugel_db
DB_USER=root
DB_PASSWORD=root

PORT=5000
NODE_ENV=development
```

✅ **Verificar:** El archivo `.env` existe en `backend/`

---

### PASO 2: Crear BD en MySQL (phpMyAdmin) [3 min]

**1. Abre Laragon**

**2. Haz clic en: Herramientas → phpMyAdmin**

**3. Se abre en navegador:**
```
http://localhost/phpmyadmin
```

**4. Ve a pestaña "SQL"** (arriba a la izquierda)

**5. Copia TODO el contenido de:**
```
backend/database/schema.sql
```

**6. Pega en phpMyAdmin → Ejecutar**

**7. Deberías ver:**
```
✅ Base de datos creada: ugel_db
✅ Tabla creada: directores
✅ Tabla creada: login_logs
```

**Verificar datos:**
```sql
USE ugel_db;
SELECT * FROM directores;
```

Debe mostrar 3 directores de ejemplo.

---

### PASO 3: Iniciar Backend (Node.js) [2 min]

**Opción A: Usando Terminal Power Shell**
```powershell
cd c:\Users\edgar\OneDrive\Desktop\prueba\backend
npm start
```

**Opción B: Usando Laragon Terminal**
```bash
cd backend
npm start
```

**Esperado:**
```
✅ Conectado a MySQL correctamente
✅ Servidor corriendo en http://localhost:5000
✅ Credenciales de directores cargadas desde JSON
```

✅ **DEJAR ESTA TERMINAL ABIERTA** (servidor activo)

---

### PASO 4: Iniciar Frontend (React) [2 min]

**En nueva terminal Power Shell:**
```powershell
cd c:\Users\edgar\OneDrive\Desktop\prueba\frontend
npm start
```

**Esperado:**
```
✅ Servidor React en http://localhost:3000
✅ Se abre navegador automáticamente
```

✅ **DEJAR ESTA TERMINAL ABIERTA** (servidor activo)

---

### PASO 5: Probar Login [1 min]

**En navegador (http://localhost:3000):**

**1. Ingresa:**
```
Correo: juan.perez@colegio.edu.pe
Contraseña: password123
```

**2. Verifica que funciona:**
```
✅ Se conecta al backend (/api/auth/login)
✅ Valida contra directores.json
✅ Se crea/actualiza en BD MySQL
✅ Se registra en login_logs
✅ Redirige al dashboard
```

---

## 🧪 CREDENCIALES DE PRUEBA

Elige una de estas 3:

```
┌─────────────────────────────────┬──────────────────┐
│ CORREO                          │ CONTRASEÑA       │
├─────────────────────────────────┼──────────────────┤
│ juan.perez@colegio.edu.pe       │ password123      │
│ maria.garcia@colegio.edu.pe     │ password456      │
│ carlos.lopez@colegio.edu.pe     │ director123      │
└─────────────────────────────────┴──────────────────┘
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot find module 'mysql2'"
```bash
cd backend
npm install mysql2 bcryptjs cors express
```

### ❌ Error: "ECONNREFUSED 127.0.0.1:3306"
- Verifica que MySQL en Laragon está corriendo
- En Laragon: Herramientas → Services → MySQL "ON"

### ❌ Error: "Access denied for user 'root'"
- Revisa credenciales en `.env`
- En Laragon, contraseña por defecto de MySQL es: `root`

### ❌ Error: "Cannot GET /api/auth/login"
- Verifica backend está corriendo en puerto 5000
- Abre http://localhost:5000 - debe mostrar "API UGEL funcionando"

### ❌ LoginForm sigue usando MOCK
- Frontend aún NO está conectado al backend
- Necesita actualizar LoginForm.jsx (se detalla en PROBLEMA_Y_SOLUCION.md)

---

## 📊 VERIFICACIÓN COMPLETA

### 1. BD MySQ Creada ✅
```sql
-- Ver en phpMyAdmin:
USE ugel_db;
SHOW TABLES;  -- Debe mostrar: directores, login_logs
SELECT COUNT(*) FROM directores;  -- Debe ser: 3
```

### 2. Backend Corriendo ✅
```
http://localhost:5000/
Respuesta: {"message":"API UGEL funcionando correctamente ✅"}
```

### 3. Frontend Corriendo ✅
```
http://localhost:3000/
Debe cargar página de login correctamente
```

### 4. Validación de Credentials ✅
```bash
# Desde otra terminal, prueba:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan.perez@colegio.edu.pe","password":"password123"}'

# Respuesta debe ser:
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "director": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    ...
  }
}
```

---

## 🚀 PRÓXIMO PASO: CONECTAR FRONTEND AL BACKEND

Actualmente LoginForm.jsx usa MOCK_USERS. Para conectar al backend:

**Archivo a modificar:** `frontend/src/components/LoginForm.jsx`

**Ver detalles en:** `PROBLEMA_Y_SOLUCION.md` (línea ~80)

**Cambio rápido:**
1. Cambiar campo "DNI" a "Correo"  
2. Reemplazar `handleSubmit` para hacer POST a `/api/auth/login`
3. Usar respuesta del backend en lugar de MOCK_USERS

---

## 📋 RESUMEN RÁPIDO

| Paso | Acción | Tiempo | Estado |
|------|--------|--------|--------|
| 1 | Crear `.env` en backend | 2 min | ✅ Manual |
| 2 | Ejecutar schema.sql en phpMyAdmin | 3 min | ✅ Manual |
| 3 | Iniciar Backend (npm start) | 2 min | ✅ Automático |
| 4 | Iniciar Frontend (npm start) | 2 min | ✅ Automático |
| 5 | Probar login | 1 min | ✅ Manual |
| **TOTAL** | **Activar BD + Backend** | **~10 min** | **✅ LISTO** |

---

**Nota Final:** Los pasos 1-5 activan BD + Backend con validación.  
Para conectar completamente el frontend, ver: `PROBLEMA_Y_SOLUCION.md`

¿Necesitas ayuda con algún paso?

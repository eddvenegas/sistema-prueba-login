# Integración MySQL + Credenciales de Directores (JSON)

## 📋 Descripción

Este proyecto ha sido actualizado para:
1. **Usar MySQL** en lugar de PostgreSQL
2. **Validar credenciales** de directores desde un archivo JSON (`data/directores.json`)
3. **Sincronizar automáticamente** datos de directores a la base de datos MySQL

---

## 🔧 Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

Luego edita `.env` con tus credenciales de MySQL:

```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ugel_db
DB_USER=root
DB_PASSWORD=directoresugel

# Configuración de servidor
PORT=5000
NODE_ENV=development
```

### 2. Crear la Base de Datos

Ejecuta el script SQL en MySQL:

```bash
mysql -u root -p < backend/database/schema.sql
```

O manualmente en MySQL Workbench/phpMyAdmin:
- Abre `backend/database/schema.sql`
- Ejecuta todo el contenido

---

## 👨‍💼 Archivo de Credenciales (directores.json)

El archivo `backend/data/directores.json` contiene las credenciales de todos los directores:

```json
{
  "juan.perez@colegio.edu.pe": {
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "colegio": "Colegio Nacional Jorge Chávez",
    "correo": "juan.perez@colegio.edu.pe"
  }
}
```

**Estructura requerida:**
- **password**: Contraseña en texto plano (se recomienda hashear en producción)
- **nombre**: Nombre del director
- **apellido**: Apellido del director
- **dni**: DNI peruano de 8 dígitos
- **colegio**: Nombre del colegio donde es director
- **correo**: Correo electrónico (clave para identificar al director)

---

## 🔐 Flujo de Autenticación

```
1. Director ingresa correo + contraseña
   ↓
2. Sistema valida contra directores.json
   ├─ ✗ Credenciales inválidas → Error 401
   └─ ✓ Credenciales válidas → Continuar
   ↓
3. Sistema busca director en BD MySQL
   ├─ No existe → Crear director automáticamente
   └─ Existe → Actualizar datos
   ↓
4. Devolver datos del director sin contraseña
```

---

## 📝 Archivos Modificados

### `backend/config/db.js`
- **Cambio**: PostgreSQL → MySQL (mysql2/promise)
- **Nuevas funciones**:
  - `validateDirectorCredentials(correo, password)` - Valida contra JSON
  - `getDirectorData(correo)` - Obtiene datos del director desde JSON
  - `reloadDirectorCredentials()` - Recarga JSON en tiempo real

### `backend/controllers/authController.js`
- **Login**: Ahora valida contra JSON de directores y sincroniza con BD
- **Change Password**: Usa estructura de MySQL correcta para directores

### `backend/database/schema.sql`
- **Cambio**: PostgreSQL → MySQL
- **Nueva tabla**: `directores` con estructura según especificación
- **Nueva tabla**: `login_logs` para auditoría

### Nuevos Archivos
- `backend/data/directores.json` - Credenciales de directores
- `backend/.env.example` - Plantilla de variables de entorno

---

## 🚀 Instalación y Arranque

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar .env
cp .env.example .env
# Edita .env con tus credenciales MySQL

# 3. Crear base de datos
mysql -u root -p < database/schema.sql

# 4. Iniciar servidor
npm start
```

---

## 📌 Endpoints de Autenticación

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "correo": "juan.perez@colegio.edu.pe",
  "password": "password123"
}

Response:
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

### Cambiar Contraseña
```
POST /api/auth/change-password
Content-Type: application/json

{
  "correo": "juan.perez@colegio.edu.pe",
  "newPassword": "nueva_contraseña_123"
}

Response:
{
  "success": true,
  "message": "Contraseña actualizada correctamente."
}
```

---

## ⚠️ Recomendaciones de Seguridad

1. **Hashear contraseñas en teachers.json**:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash('password123', 10);
   ```

2. **Usar variables de entorno** para datos sensibles, no versionar `.env`

3. **Validar email** en formato válido

4. **Implementar rate limiting** para prevenir fuerza bruta

5. **Usar HTTPS** en producción

6. **Auditar login_logs** regularmente

---

## 🔄 Actualizar Credenciales en Tiempo Real

Para recargar el archivo `directores.json` sin reiniciar el servidor:

```javascript
// En tu endpoint o ruta admin
const { reloadDirectorCredentials } = require('./config/db');

app.post('/api/admin/reload-credentials', (req, res) => {
  const success = reloadDirectorCredentials();
  if (success) {
    res.json({ message: 'Credenciales de directores recargadas' });
  } else {
    res.status(500).json({ error: 'Error cargando credenciales' });
  }
});
```

---

## 🐛 Solución de Problemas

### Error: "Conectando a MySQL: ECONNREFUSED"
- Verifica que MySQL esté corriendo
- Comprueba `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` en `.env`

### Error: "Tabla no existe"
- Ejecuta el script SQL: `mysql -u root -p < schema.sql`

### Error: "Credenciales de directores cargadas desde JSON no encontradas"
- Verifica que `backend/data/directores.json` exista y sea JSON válido
- Comprueba que el correo en el JSON coincida exactamente

### Error: "1 high severity vulnerability"
- Ejecuta: `npm audit fix`

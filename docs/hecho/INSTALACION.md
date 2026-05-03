# 🚀 Guía de Instalación del Sistema UGEL

Esta guía detalla los pasos necesarios para clonar, configurar y ejecutar el **Sistema de Gestión Financiera Educativa** en cualquier ordenador nuevo desde cero.

---

## 📋 1. Requisitos Previos

Antes de empezar, asegúrate de tener instalado en el nuevo ordenador:
*   **[Node.js](https://nodejs.org/es/)** (Versión 18 o superior).
*   **[Git](https://git-scm.com/)** (Para clonar el repositorio).
*   **[Laragon](https://laragon.org/download/)** o XAMPP (Para el servidor MySQL local y phpMyAdmin).

---

## 🗄️ 2. Configuración de la Base de Datos

1.  Abre **Laragon** y presiona **"Iniciar Todo"** (Asegúrate de que MySQL esté corriendo).
2.  Abre **phpMyAdmin** (usualmente en `http://localhost/phpmyadmin`).
3.  Ve a la pestaña **"Bases de datos"** y crea una nueva llamada:
    `ugel_db` *(Codificamiento recomendado: utf8mb4_spanish_ci)*.
4.  Haz clic sobre `ugel_db` en el panel izquierdo, ve a la pestaña **"Importar"**.
5.  Selecciona el archivo de backup `.sql` (generado desde el sistema anterior) o utiliza el archivo `schema.sql` que se encuentra en la carpeta `/backend/database/` del proyecto.
6.  Haz clic en **Continuar**. Las tablas y los usuarios de prueba se crearán automáticamente.

---

## ⚙️ 3. Configuración del Backend (Servidor)

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd ruta/del/proyecto/backend
   ```

2. Instala todas las dependencias y librerías necesarias:
   ```bash
   npm install
   ```

3. Crea un archivo llamado `.env` en la raíz de la carpeta `backend` y configura tus variables de entorno (asegúrate de poner la contraseña correcta de tu MySQL en Laragon):
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=firma_secreta_ugel_2026
   
   # Credenciales de la Base de Datos Local
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ugel_db
   ```

4. Inicia el servidor backend:
   ```bash
   npm start
   ```
   *Deberías ver en consola: "Servidor corriendo en el puerto 5000" y "Conectado a la base de datos MySQL".*

---

## 💻 4. Configuración del Frontend (Interfaz)

1. Abre una **nueva** pestaña en tu terminal y navega a la carpeta del frontend:
   ```bash
   cd ruta/del/proyecto/frontend
   ```

2. Instala todas las dependencias de React:
   ```bash
   npm install
   ```

3. Inicia la aplicación web:
   ```bash
   npm start
   ```
   *El navegador se abrirá automáticamente en `http://localhost:3000` con la pantalla de inicio de sesión.*

---

## 🔑 5. Credenciales de Acceso

Si importaste la base de datos de prueba, puedes utilizar las siguientes cuentas para probar los distintos módulos del sistema:

**👨‍💻 Administrador de TI (Soporte)**
*   **Correo:** `edgard.venegas@ugel.edu.pe`
*   **Contraseña:** `(La que configuraste en tu sistema)`

**🕵️‍♂️ Especialista UGEL (Auditor)**
*   **Correo:** `especialista@ugel.edu.pe` *(Revisar BD para correo exacto)*
*   **Contraseña:** `(Revisar BD)`

**👨‍🏫 Director de I.E. (Declarante)**
*   **Correo:** `sariber19@hotmail.com` *(O cualquier otro colegio)*
*   **Contraseña:** `password123` *(O la que esté vigente)*

---

🎉 **¡Listo! El sistema debería estar funcionando al 100% en tu entorno local.**
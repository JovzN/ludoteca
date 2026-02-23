## 🚀 Cómo correr el proyecto (Paso a paso)

### Requisitos previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)

### 1. Configuración de la Base de Datos
1. Crea una base de datos en PostgreSQL llamada `ludoteca`.
2. Ejecuta el contenido del archivo `database.sql` (ubicado en la raíz) para crear las tablas e insertar los datos iniciales.

### 2. Configuración del Servidor (Backend)
1. Ve a la carpeta del servidor: `cd servidor`
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` basado en `.env.example` (incluido en la carpeta).
4. Inicia el servidor: `npm run dev` (El servidor correrá en http://localhost:3000).

### 3. Configuración del Cliente (Frontend)
1. Ve a la carpeta del cliente: `cd cliente`
2. Instala las dependencias: `npm install`
3. Inicia la aplicación: `npm run dev`
4. Abre http://localhost:5173 en tu navegador.

## 🔑 Credenciales de Prueba
| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | Juan | admin123 |
| **Alumno** | Oscar | alum123 |
| **Alumno** | Raul | alum456 |

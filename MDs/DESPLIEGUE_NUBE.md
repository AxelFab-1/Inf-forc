# 🚀 Hito Arquitectónico: Despliegue en la Nube de Infinity Force

## Objetivo
Este documento registra el avance arquitectónico para el pase a producción de **Infinity Force**. El objetivo principal de estas configuraciones es garantizar que la plataforma esté en línea, accesible a través de Vercel (Frontend) y Railway (Backend), y fuertemente blindada en términos de seguridad perimetral. Con esto logramos que los usuarios puedan interactuar con la interfaz enfocada en el control atlético y las rutinas de manera estable y segura.

---

## 1. 🌐 Frontend (Preparación para Vercel)
Para asegurar que la aplicación en Angular pueda consumir la API de producción sin dependencias de red codificadas rígidamente y funcionar como una SPA (Single Page Application) fluida:
* **`api-config.ts`**: Se creó este archivo en la ruta `src/app/shared/utils/api-config.ts` para centralizar la URL de consumo (`API_URL`) hacia el backend en Railway. Se refactorizaron 11 componentes para inyectar esta constante en las llamadas `fetch`.
* **`vercel.json`**: Se creó en la raíz del frontend para configurar las reglas de `rewrites`. Esto asegura que Vercel redirija todas las peticiones a `index.html`, permitiendo que el router de Angular maneje las rutas correctamente sin arrojar errores 404 al recargar la página.

---

## 2. 🛡️ Backend (Preparación para Railway y Refactorización de Seguridad)
Se llevó a cabo una limpieza exhaustiva en la capa de controladores para evitar conflictos de políticas de origen:
* Se eliminaron las anotaciones individuales `@CrossOrigin(origins = "*")` en los 7 controladores REST (`AsistenciaController`, `EjercicioController`, `NutricionController`, `ProductoController`, `RutinaController`, `SesionController` y `UsuarioController`). 

---

## 3. 🔐 Seguridad Global y Centralización de CORS
Con la limpieza de los controladores, toda la seguridad de la capa de red fue delegada al componente de configuración de Spring Security:
* **Centralización en `SecurityConfig.java`**: Se configuró la cadena de filtros (`SecurityFilterChain`) para manejar los permisos CORS de manera global.
* **Lista Blanca Estricta (`application.properties`)**: La configuración ahora permite estrictamente el tráfico proveniente del entorno de desarrollo (`http://localhost:4200`) y del dominio oficial de Vercel (`https://gym-web-eight-rosy.vercel.app`), bloqueando cualquier otro origen no autorizado y reforzando la seguridad de los endpoints.

> **Estado actual:** El proyecto se encuentra 100% preparado para la integración continua (CI/CD) y su despliegue final en Vercel y Railway.

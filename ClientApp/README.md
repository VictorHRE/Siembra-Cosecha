# ClientApp

Frontend del sistema `SalesInventorySystem`, desarrollado con `React 18` e integrado con el backend en `ASP.NET Core 8`.

## Descripción

Esta aplicación cliente funciona como una SPA para la operación diaria del sistema. Se encarga de:

- autenticación de usuarios
- carga dinámica de permisos
- protección de rutas por módulo
- navegación principal del sistema
- consumo de endpoints `/api/...`
- visualización de métricas y reportes
- exportación de datos en `PDF` y `Excel`

## Tecnologías utilizadas

- `React 18`
- `React Router DOM`
- `Bootstrap`
- `React Bootstrap`
- `Reactstrap`
- `SweetAlert2`
- `Chart.js`
- `react-chartjs-2`
- `react-datepicker`
- `jsPDF`
- `jspdf-autotable`
- `xlsx`

## Estructura principal

- `src/index.js`: configuración de rutas
- `src/App.js`: layout principal autenticado
- `src/context/UserProvider.js`: contexto del usuario autenticado
- `src/context/PermissionProvider.js`: contexto de permisos
- `src/componentes/ProtectedRoute.js`: protección de rutas según permisos
- `src/componentes/NavBar.js`: menú lateral dinámico
- `src/views/`: vistas del sistema
- `src/utils/exportHelpers.js`: exportación reutilizable a `PDF` y `Excel`
- `src/setupProxy.js`: configuración de proxy en desarrollo

## Vistas incluidas

La SPA incluye las siguientes pantallas principales:

- `Login`
- `Inicio`
- `Dashboard`
- `Usuarios`
- `Proveedores`
- `Productos`
- `Categorías`
- `Venta`
- `HistorialVenta`
- `ReporteVenta`
- `Ingreso`
- `Egreso`
- `Cierre`
- `AccessDenied`
- `NotFound`

## Sistema de permisos

El frontend implementa control de acceso por módulos:

- al iniciar sesión se obtiene el usuario autenticado
- luego se consultan los permisos desde `api/permisos/Usuario/{idUsuario}`
- el menú lateral se renderiza según los permisos disponibles
- las rutas se protegen con `ProtectedRoute`
- si el usuario no tiene acceso, se redirige a la vista correspondiente

Esto permite separar claramente módulos administrativos, inventario, ventas, finanzas y reportes.

## Dashboard y reportes

El dashboard consume `api/utilidad/Dashboard` y permite:

- consultar métricas generales
- ver ventas por día
- visualizar productos más vendidos o menos vendidos
- filtrar por rangos de fecha
- exportar resultados a `PDF` y `Excel`

## Scripts disponibles

En el directorio `ClientApp/` puedes usar:

### `npm start`

Inicia la aplicación en modo desarrollo.

### `npm run build`

Genera el build de producción.

### `npm test`

Ejecuta las pruebas configuradas para el cliente.

### `npm run lint`

Ejecuta `eslint` sobre `src/`.

## Variables de entorno

Actualmente el archivo `ClientApp/.env` contiene:

- `BROWSER=none`

Esto evita que el navegador se abra automáticamente al iniciar el frontend en desarrollo.

## Instalación

### 1. Instalar dependencias

Desde `ClientApp/`:

`npm install`

### 2. Ejecutar en desarrollo

`npm start`

## Integración con el backend

Este frontend está pensado para ejecutarse junto con el proyecto `ASP.NET Core` principal.

En desarrollo puede trabajar mediante proxy y también mediante la integración de `SpaProxy` configurada en el proyecto raíz.

## Objetivo del cliente

La aplicación fue diseñada para ofrecer una experiencia rápida y directa para operaciones de:

- caja
- ventas
- inventario
- administración
- consulta de reportes

Su enfoque principal es facilitar el uso diario del sistema desde una interfaz moderna, con navegación por permisos y herramientas de exportación listas para uso administrativo.

# SalesInventorySystem

> Sistema web para la gestión de inventario, ventas, finanzas operativas y control de acceso por permisos.

![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![SQL%20Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?logo=microsoftsqlserver&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-UI-7952B3?logo=bootstrap&logoColor=white)

## Descripción

`SalesInventorySystem` es una aplicación full stack orientada a pequeños y medianos negocios que necesitan controlar su operación diaria desde una sola plataforma.

El sistema permite administrar productos, categorías, proveedores, usuarios, permisos, ventas, ingresos, egresos, reportes y cierres contables, todo desde una interfaz web moderna construida con `React` y un backend en `ASP.NET Core 8`.

## Funcionalidades principales

- inicio de sesión con validación de credenciales
- hash y verificación de contraseñas con `BCrypt`
- gestión de usuarios y roles
- permisos por módulo para restringir acceso a vistas y acciones
- administración de productos, categorías y proveedores
- registro de ventas con detalle de productos
- historial de ventas y consulta por fecha o documento
- dashboard con métricas y gráficas de ventas
- control de ingresos y egresos
- cierre contable por rango de fechas, tipo de pago y moneda
- exportación de reportes en `PDF` y `Excel`
- frontend SPA con fallback para navegación usando `React Router`

## Módulos del sistema

### Administración
- `Usuarios`
- `Roles`
- `Permisos`

### Inventario
- `Productos`
- `Categorías`
- `Proveedores`
- `Historial de productos`

### Ventas
- `Nueva venta`
- `Historial de ventas`
- `Reporte de ventas`

### Finanzas
- `Ingresos`
- `Egresos`
- `Cierre contable`

### Análisis
- `Dashboard` con gráficas y filtros por rango de fechas

## Arquitectura

El proyecto está organizado como una solución web con backend y frontend integrados:

- **Backend**: `ASP.NET Core 8 Web API`
- **Acceso a datos**: `Entity Framework Core` + `SQL Server`
- **Frontend**: `React 18`
- **Estilo/UI**: `Bootstrap`, `React Bootstrap`, `Reactstrap`
- **Gráficas**: `Chart.js` y `react-chartjs-2`
- **Exportación**: `jsPDF`, `jspdf-autotable`, `xlsx`

### Estructura general

- `Controllers/`: endpoints HTTP del sistema
- `Repositories/`: acceso a datos y lógica de persistencia
- `Interfaces/`: contratos de repositorios y servicios
- `Models/`: entidades y DTOs
- `Services/`: servicios transversales, por ejemplo contraseñas
- `ClientApp/`: aplicación cliente en `React`
- `Program.cs`: configuración de servicios, CORS, compresión, archivos estáticos y fallback SPA

## Stack técnico

### Backend
- `ASP.NET Core 8`
- `Entity Framework Core 8`
- `Microsoft SQL Server`
- `BCrypt.Net-Next`

### Frontend
- `React 18`
- `React Router DOM`
- `Bootstrap 4`
- `SweetAlert2`
- `React DatePicker`
- `Chart.js`
- `jsPDF`
- `xlsx`

## Cómo funciona

1. El usuario inicia sesión desde el frontend.
2. El backend valida credenciales mediante `SessionController`.
3. El sistema obtiene los permisos del usuario desde `PermisosController`.
4. El menú lateral y las rutas protegidas se renderizan según los módulos permitidos.
5. Las operaciones del negocio se consumen desde la SPA usando endpoints `/api/...`.

## Rutas funcionales destacadas

En el cliente existen vistas para:

- `/dashboard`
- `/usuario`
- `/proveedor`
- `/producto`
- `/categoria`
- `/venta`
- `/historialventa`
- `/reporteventa`
- `/ingreso`
- `/egreso`
- `/cierre`

## Requisitos previos

Antes de ejecutar el proyecto necesitas:

- `.NET SDK 8`
- `Node.js` y `npm`
- `SQL Server`

## Ejecución en desarrollo

### 1. Clonar el repositorio

`git clone https://github.com/VictorHRE/Siembra-Cosecha.git`

### 2. Restaurar dependencias del backend

Desde la raíz del proyecto:

`dotnet restore`

### 3. Instalar dependencias del frontend

Desde `ClientApp/`:

`npm install`

### 4. Configurar la conexión a base de datos

Actualiza la cadena de conexión en `appsettings.json` con tu instancia local o servidor SQL.

### 5. Ejecutar la aplicación

Desde la raíz del proyecto:

`dotnet run`

El proyecto usa `SpaProxy`, por lo que en desarrollo el backend puede lanzar automáticamente la aplicación de `React` usando el comando configurado en `ClientApp/package.json`.

Si prefieres levantar el frontend manualmente:

Desde `ClientApp/`:

`npm start`

## Publicación

Durante el proceso de publicación:

- se ejecuta `npm install` dentro de `ClientApp`
- se genera el build de producción con `npm run build`
- los archivos generados se copian a `wwwroot`

Además, el backend configura:

- compresión `Gzip`
- archivos estáticos con caché
- `MapFallbackToFile("index.html")` para soportar rutas del frontend

## Seguridad y configuración

- las contraseñas se manejan con `BCrypt`
- el acceso a módulos se controla por permisos de usuario
- para producción, se recomienda mover credenciales y secretos a variables de entorno o secretos de usuario

## Estado del proyecto

Este repositorio representa una solución funcional orientada a la operación diaria de ventas e inventario, con énfasis en:

- control administrativo
- visibilidad operativa
- trazabilidad de ventas
- análisis básico del negocio
- exportación de información

## Autor

Desarrollado por `VictorHRE`.

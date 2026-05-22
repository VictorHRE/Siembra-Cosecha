-- Update default values for fechaRegistro to use UTC-6 timezone
use DBSiembra_VENTA
GO
-- Rol
ALTER TABLE Rol DROP CONSTRAINT DF_Rol_fechaRegistro;
ALTER TABLE Rol ADD CONSTRAINT DF_Rol_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Categoria
ALTER TABLE Categoria DROP CONSTRAINT DF_Categoria_fechaRegistro;
ALTER TABLE Categoria ADD CONSTRAINT DF_Categoria_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Proveedor
ALTER TABLE Proveedor DROP CONSTRAINT DF_Proveedor_fechaRegistro;
ALTER TABLE Proveedor ADD CONSTRAINT DF_Proveedor_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Producto
ALTER TABLE Producto DROP CONSTRAINT DF_Producto_fechaRegistro;
ALTER TABLE Producto ADD CONSTRAINT DF_Producto_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Venta
ALTER TABLE Venta DROP CONSTRAINT DF_Venta_fechaRegistro;
ALTER TABLE Venta ADD CONSTRAINT DF_Venta_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- NumeroDocumento
ALTER TABLE NumeroDocumento DROP CONSTRAINT DF_NumeroDocumento_fechaRegistro;
ALTER TABLE NumeroDocumento ADD CONSTRAINT DF_NumeroDocumento_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Ingreso
ALTER TABLE Ingreso DROP CONSTRAINT DF_Ingreso_fechaRegistro;
ALTER TABLE Ingreso ADD CONSTRAINT DF_Ingreso_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Egreso
ALTER TABLE Egreso DROP CONSTRAINT DF_Egreso_fechaRegistro;
ALTER TABLE Egreso ADD CONSTRAINT DF_Egreso_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- Modulo
ALTER TABLE Modulo DROP CONSTRAINT DF_Modulo_fechaRegistro;
ALTER TABLE Modulo ADD CONSTRAINT DF_Modulo_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO

-- UsuarioPermiso
ALTER TABLE UsuarioPermiso DROP CONSTRAINT DF_UsuarioPermiso_fechaRegistro;
ALTER TABLE UsuarioPermiso ADD CONSTRAINT DF_UsuarioPermiso_fechaRegistro 
    DEFAULT (DATEADD(HOUR, -6, GETUTCDATE())) FOR fechaRegistro;
GO
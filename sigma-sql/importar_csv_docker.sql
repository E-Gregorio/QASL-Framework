-- ============================================================
-- SIGMA - Importar CSV a Base de Datos (VERSION DOCKER)
-- Compatible con SQL Server 2019+
-- ============================================================
-- RUTA CSV: /tmp/data.csv (dentro del contenedor)
-- ============================================================

SET NOCOUNT ON;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'SIGMA')
BEGIN
    ALTER DATABASE SIGMA SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SIGMA;
END
GO

CREATE DATABASE SIGMA;
GO

USE SIGMA;
GO

PRINT '========================================';
PRINT 'SIGMA - Importar CSV (Docker)';
PRINT 'Inicio: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';

PRINT 'Creando estructura de tablas...';

-- Tabla: perfil
CREATE TABLE perfil (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    activo CHAR(1) NOT NULL CHECK (activo IN ('S', 'N')),
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Tabla: usuario
CREATE TABLE usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    perfil_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (perfil_id) REFERENCES perfil(id)
);

-- Tabla: contribuyente
CREATE TABLE contribuyente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cuit BIGINT NOT NULL UNIQUE,
    razon_social VARCHAR(250) NOT NULL,
    tipo_persona VARCHAR(50) NOT NULL,
    condicion_iva INT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: actividad
CREATE TABLE actividad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: contribuyente_actividad
CREATE TABLE contribuyente_actividad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contribuyente_id INT NOT NULL,
    actividad_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (actividad_id) REFERENCES actividad(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tributo
CREATE TABLE tributo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo INT NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    jurisdiccion VARCHAR(80) NOT NULL,
    activo CHAR(1) NOT NULL CHECK (activo IN ('S', 'N')),
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: regimen
CREATE TABLE regimen (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: campania
CREATE TABLE campania (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tipo_motivo
CREATE TABLE tipo_motivo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: motivo
CREATE TABLE motivo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_motivo_id INT NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tipo_motivo_id) REFERENCES tipo_motivo(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: linea_investigacion
CREATE TABLE linea_investigacion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: inconsistencia
CREATE TABLE inconsistencia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contribuyente_id INT NOT NULL,
    tributo_id INT NOT NULL,
    anticipo INT NULL,
    trx VARCHAR(50) NULL,
    regimen_id INT NULL,
    isib_anual DECIMAL(18,2) NULL,
    ddjjs_isib DECIMAL(5,2) NULL,
    png_anual DECIMAL(18,2) NULL,
    ddjjs_iva INT NULL,
    base_impuesto DECIMAL(18,2) NULL,
    alic_declarada DECIMAL(8,4) NULL,
    importe_declarado DECIMAL(18,2) NULL,
    observacion VARCHAR(500) NULL,
    alicuota_legal DECIMAL(8,4) NULL,
    importe_determinado DECIMAL(18,2) NULL,
    diferencia DECIMAL(18,2) NULL,
    categoria VARCHAR(100) NULL,
    fecha_proceso DATE NULL,
    contribuyente_actividad_id INT NULL,
    oficina_origen VARCHAR(100) NULL,
    campania_id INT NULL,
    motivo_id INT NULL,
    linea_investigacion_id INT NULL,
    relevancia_penal CHAR(1) CHECK (relevancia_penal IN ('S', 'N')),
    expediente_lote_nro VARCHAR(80) NULL,
    expediente_id INT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (tributo_id) REFERENCES tributo(id),
    FOREIGN KEY (regimen_id) REFERENCES regimen(id),
    FOREIGN KEY (campania_id) REFERENCES campania(id),
    FOREIGN KEY (motivo_id) REFERENCES motivo(id),
    FOREIGN KEY (linea_investigacion_id) REFERENCES linea_investigacion(id),
    FOREIGN KEY (contribuyente_actividad_id) REFERENCES contribuyente_actividad(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

PRINT 'Tablas creadas correctamente';
GO

PRINT '';
PRINT 'Insertando datos base...';

SET IDENTITY_INSERT perfil ON;
INSERT INTO perfil (id, nombre, descripcion, activo, modificado_por, creado_por)
VALUES (1, 'Sistema', 'Usuario del sistema', 'S', 1, 1);
SET IDENTITY_INSERT perfil OFF;

SET IDENTITY_INSERT usuario ON;
INSERT INTO usuario (id, perfil_id, modificado_por, creado_por)
VALUES (1, 1, 1, 1);
SET IDENTITY_INSERT usuario OFF;

INSERT INTO tributo (codigo, nombre, jurisdiccion, activo, modificado_por, creado_por)
VALUES (1, 'ISIB Local', 'Local', 'S', 1, 1), (2, 'ISIB Convenio Multilateral', 'Convenio Multilateral', 'S', 1, 1);

INSERT INTO regimen (nombre, modificado_por, creado_por)
VALUES ('LO', 1, 1), ('CM', 1, 1);

PRINT 'Datos base insertados';
GO

PRINT '';
PRINT 'Importando CSV...';

IF OBJECT_ID('tempdb..#csv') IS NOT NULL DROP TABLE #csv;

CREATE TABLE #csv (
    CUIT VARCHAR(50),
    Razon_social VARCHAR(500),
    Anticipo VARCHAR(50),
    TRX VARCHAR(100),
    Regimen VARCHAR(50),
    ISIB_Anual VARCHAR(100),
    DDJJs_ISIB VARCHAR(50),
    PNG_Anual VARCHAR(100),
    DDJJs_IVA VARCHAR(50),
    Cod_Act VARCHAR(50),
    Desc_Act VARCHAR(1000),
    Base_Imp VARCHAR(100),
    AlicDec VARCHAR(50),
    Imp_Decla VARCHAR(100),
    Obs VARCHAR(100),
    Alic_Leg VARCHAR(50),
    Imp_Determ VARCHAR(100),
    Diferencia VARCHAR(100),
    Categoria VARCHAR(200),
    Fecha_Proceso VARCHAR(50),
    tipo_persona VARCHAR(100)
);

-- RUTA DOCKER: /tmp/data.csv
BULK INSERT #csv
FROM '/tmp/data.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"'
);
PRINT 'Registros CSV: ' + CAST(@@ROWCOUNT AS VARCHAR);

INSERT INTO actividad (nombre, modificado_por, creado_por)
SELECT DISTINCT LEFT(Cod_Act, 30), 1, 1 FROM #csv
WHERE Cod_Act IS NOT NULL AND Cod_Act != '';
PRINT 'Actividades: ' + CAST(@@ROWCOUNT AS VARCHAR);

INSERT INTO contribuyente (cuit, razon_social, tipo_persona, modificado_por, creado_por)
SELECT DISTINCT TRY_CAST(CUIT AS BIGINT), Razon_social, tipo_persona, 1, 1
FROM #csv
WHERE TRY_CAST(CUIT AS BIGINT) IS NOT NULL;
PRINT 'Contribuyentes: ' + CAST(@@ROWCOUNT AS VARCHAR);

INSERT INTO inconsistencia (
    contribuyente_id, tributo_id, anticipo, trx, regimen_id,
    isib_anual, ddjjs_isib, png_anual, ddjjs_iva,
    base_impuesto, alic_declarada, importe_declarado, observacion,
    alicuota_legal, importe_determinado, diferencia, categoria,
    fecha_proceso, modificado_por, creado_por
)
SELECT
    c.id,
    CASE WHEN csv.Regimen = 'LO' THEN 1 ELSE 2 END,
    TRY_CAST(csv.Anticipo AS INT),
    csv.TRX,
    r.id,
    TRY_CAST(REPLACE(REPLACE(csv.ISIB_Anual, '.', ''), ',', '.') AS DECIMAL(18,2)),
    TRY_CAST(REPLACE(csv.DDJJs_ISIB, ',', '.') AS DECIMAL(5,2)),
    TRY_CAST(REPLACE(REPLACE(csv.PNG_Anual, '.', ''), ',', '.') AS DECIMAL(18,2)),
    TRY_CAST(csv.DDJJs_IVA AS INT),
    TRY_CAST(REPLACE(REPLACE(csv.Base_Imp, '.', ''), ',', '.') AS DECIMAL(18,2)),
    TRY_CAST(REPLACE(csv.AlicDec, ',', '.') AS DECIMAL(8,4)),
    TRY_CAST(REPLACE(REPLACE(csv.Imp_Decla, '.', ''), ',', '.') AS DECIMAL(18,2)),
    csv.Obs,
    TRY_CAST(REPLACE(csv.Alic_Leg, ',', '.') AS DECIMAL(8,4)),
    TRY_CAST(REPLACE(REPLACE(csv.Imp_Determ, '.', ''), ',', '.') AS DECIMAL(18,2)),
    TRY_CAST(REPLACE(REPLACE(csv.Diferencia, '.', ''), ',', '.') AS DECIMAL(18,2)),
    csv.Categoria,
    TRY_CONVERT(DATE, csv.Fecha_Proceso, 3),
    1, 1
FROM #csv csv
INNER JOIN contribuyente c ON c.cuit = TRY_CAST(csv.CUIT AS BIGINT)
INNER JOIN regimen r ON r.nombre = csv.Regimen;
PRINT 'Inconsistencias: ' + CAST(@@ROWCOUNT AS VARCHAR);

DROP TABLE #csv;

PRINT '';
PRINT '========================================';
PRINT 'IMPORTACION COMPLETADA';
PRINT '========================================';
GO

SELECT 'RESUMEN' AS Info, '' AS Total
UNION ALL SELECT 'Contribuyentes', CAST(COUNT(*) AS VARCHAR) FROM contribuyente
UNION ALL SELECT 'Inconsistencias', CAST(COUNT(*) AS VARCHAR) FROM inconsistencia
UNION ALL SELECT 'Actividades', CAST(COUNT(*) AS VARCHAR) FROM actividad;
GO

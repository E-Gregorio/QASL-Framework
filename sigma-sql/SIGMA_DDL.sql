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

-- Tabla: modulo
CREATE TABLE modulo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
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

-- Tabla: accion
CREATE TABLE accion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
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

-- Tabla: permisos
CREATE TABLE permisos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    perfil_id INT NOT NULL,
    modulo_id INT NOT NULL,
    accion_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (perfil_id) REFERENCES perfil(id),
    FOREIGN KEY (modulo_id) REFERENCES modulo(id),
    FOREIGN KEY (accion_id) REFERENCES accion(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
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

-- Tabla: tipo_estado_contribuyente
CREATE TABLE tipo_estado_contribuyente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    fecha DATETIME2 NOT NULL,
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

-- Tabla: estado_contribuyente
CREATE TABLE estado_contribuyente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_estado_contribuyente_id INT NOT NULL,
    fecha DATE NOT NULL,
    contribuyente_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tipo_estado_contribuyente_id) REFERENCES tipo_estado_contribuyente(id),
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
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

-- Tabla: tipo_estado_inconsistencia
CREATE TABLE tipo_estado_inconsistencia (
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

-- Tabla: estado_inconsistencia
CREATE TABLE estado_inconsistencia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_estado_inconsistencia_id INT NOT NULL,
    fecha DATE NOT NULL,
    inconsistencia_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tipo_estado_inconsistencia_id) REFERENCES tipo_estado_inconsistencia(id),
    FOREIGN KEY (inconsistencia_id) REFERENCES inconsistencia(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: localidad
CREATE TABLE localidad (
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

-- Tabla: domicilio
CREATE TABLE domicilio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    calle VARCHAR(80) NOT NULL,
    numero INT NOT NULL,
    piso INT NULL,
    dpto_oficina VARCHAR(80) NULL,
    cpa INT NULL,
    barrio VARCHAR(80) NULL,
    localidad_id INT NOT NULL,
    contribuyente_id INT NOT NULL,
    activo CHAR(1) NOT NULL CHECK (activo IN ('S', 'N')),
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (localidad_id) REFERENCES localidad(id),
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: condiciones_iva
CREATE TABLE condiciones_iva (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo INT NOT NULL,
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

-- Tabla: condicion_tributaria
CREATE TABLE condicion_tributaria (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tributo_id INT NOT NULL,
    contribuyente_id INT NOT NULL,
    cuit BIGINT NOT NULL,
    condicion_tributo VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NULL,
    fechadesde DATE NOT NULL,
    fechahasta DATE NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tributo_id) REFERENCES tributo(id),
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: plan_fiscalizacion
CREATE TABLE plan_fiscalizacion (
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

-- Tabla: expediente
CREATE TABLE expediente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    plan_fiscalizacion_id INT NOT NULL,
    tipo_expediente INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (plan_fiscalizacion_id) REFERENCES plan_fiscalizacion(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tipo_estado_expediente
CREATE TABLE tipo_estado_expediente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(80) NOT NULL,
    fecha DATE NOT NULL,
    expediente_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (expediente_id) REFERENCES expediente(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: estado_expediente
CREATE TABLE estado_expediente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_estado_expediente_id INT NOT NULL,
    expediente_id INT NOT NULL,
    fecha DATE NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tipo_estado_expediente_id) REFERENCES tipo_estado_expediente(id),
    FOREIGN KEY (expediente_id) REFERENCES expediente(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: candidatos
CREATE TABLE candidatos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contribuyente_id INT NOT NULL,
    cuit BIGINT NOT NULL,
    inconsistencia_id INT NOT NULL,
    expediente_id INT NULL,
    fecha DATE NOT NULL,
    ponderacion VARCHAR(30) NOT NULL,
    fiscalizacion VARCHAR(80) NOT NULL,
    diferencia_fiscal_estimada DECIMAL(18,2) NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (inconsistencia_id) REFERENCES inconsistencia(id),
    FOREIGN KEY (expediente_id) REFERENCES expediente(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: cargo
CREATE TABLE cargo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero INT NOT NULL,
    plan_fiscalizacion_id INT NOT NULL,
    expediente_id INT NOT NULL,
    candidato_id INT NOT NULL,
    relevancia_penal CHAR(1) CHECK (relevancia_penal IN ('S', 'N')),
    boleta_deuda CHAR(1) CHECK (boleta_deuda IN ('S', 'N')),
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (plan_fiscalizacion_id) REFERENCES plan_fiscalizacion(id),
    FOREIGN KEY (expediente_id) REFERENCES expediente(id),
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tipo_estado_cargo
CREATE TABLE tipo_estado_cargo (
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

-- Tabla: estado_cargo
CREATE TABLE estado_cargo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_estado_cargo_id INT NOT NULL,
    fecha DATE NOT NULL,
    cargo_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (tipo_estado_cargo_id) REFERENCES tipo_estado_cargo(id),
    FOREIGN KEY (cargo_id) REFERENCES cargo(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tipo_movimiento
CREATE TABLE tipo_movimiento (
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

-- Tabla: movimiento
CREATE TABLE movimiento (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cargo_id INT NULL,
    expediente_id INT NULL,
    tipo_movimiento_id INT NOT NULL,
    motivo_id INT NOT NULL,
    fecha DATE NOT NULL,
    observaciones VARCHAR(500) NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (cargo_id) REFERENCES cargo(id),
    FOREIGN KEY (expediente_id) REFERENCES expediente(id),
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipo_movimiento(id),
    FOREIGN KEY (motivo_id) REFERENCES motivo(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: documentos
CREATE TABLE documentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    link VARCHAR(500) NOT NULL,
    fecha DATE NOT NULL,
    envio_contribuyente CHAR(1) NOT NULL CHECK (envio_contribuyente IN ('S', 'N')),
    movimiento_id INT NOT NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (movimiento_id) REFERENCES movimiento(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: tipo_acreditacion
CREATE TABLE tipo_acreditacion (
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

-- Tabla: acta_requerimiento
CREATE TABLE acta_requerimiento (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_acta INT NOT NULL,
    documento_id INT NOT NULL,
    fecha_hora DATETIME2 NOT NULL,
    localidad_id INT NOT NULL,
    numero_isib INT NULL,
    responsable VARCHAR(100) NOT NULL,
    resposable_cargo VARCHAR(100) NULL,
    responsable_dni VARCHAR(10) NOT NULL,
    evidencia VARCHAR(80) NULL,
    tipo_acreditacion_id INT NULL,
    lugar_documentacion VARCHAR(80) NULL,
    listado_documentacion VARCHAR(250) NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (documento_id) REFERENCES documentos(id),
    FOREIGN KEY (localidad_id) REFERENCES localidad(id),
    FOREIGN KEY (tipo_acreditacion_id) REFERENCES tipo_acreditacion(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: acta_constatacion
CREATE TABLE acta_constatacion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_acta INT NOT NULL,
    documento_id INT NOT NULL,
    fecha_hora DATETIME2 NOT NULL,
    localidad_id INT NOT NULL,
    numero_isib INT NULL,
    responsable VARCHAR(100) NOT NULL,
    resposable_cargo VARCHAR(100) NULL,
    responsable_dni VARCHAR(10) NOT NULL,
    tipo_acreditacion_id INT NULL,
    lugar_documentacion VARCHAR(100) NULL,
    constata VARCHAR(250) NULL,
    modificado_por INT NOT NULL,
    creado_por INT NOT NULL,
    eliminado_por INT NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_modificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_eliminacion DATETIME2 NULL,
    FOREIGN KEY (documento_id) REFERENCES documentos(id),
    FOREIGN KEY (localidad_id) REFERENCES localidad(id),
    FOREIGN KEY (tipo_acreditacion_id) REFERENCES tipo_acreditacion(id),
    FOREIGN KEY (modificado_por) REFERENCES usuario(id),
    FOREIGN KEY (creado_por) REFERENCES usuario(id),
    FOREIGN KEY (eliminado_por) REFERENCES usuario(id)
);

-- Tabla: analista
CREATE TABLE analista (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cuit BIGINT NOT NULL,
    nombre_apellido VARCHAR(80) NOT NULL,
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

-- Tabla: inspector
CREATE TABLE inspector (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cuit BIGINT NOT NULL,
    nombre_apellido VARCHAR(80) NOT NULL,
    especialidad VARCHAR(80) NOT NULL,
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
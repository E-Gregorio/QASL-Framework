# SIGMA-SQL - Base de Datos de Pruebas

Base de datos SQL Server con datos enmascarados para pruebas E2E.

---

## Estructura de Archivos

```
sigma-sql/
├── SIGMA_DDL.sql              # Definicion completa de tablas (30+ tablas)
├── importar_csv_docker.sql    # Script para Docker (ruta /tmp/data.csv)
├── importar_csv_windows.sql   # Script para Windows (SSMS/sqlcmd local)
├── datos_prueba.csv           # ~911 registros enmascarados
└── README.md
```

---

## Conexion SQL Server (Docker)

Ya configurado en `docker-compose.yml`:

```
Host: localhost
Puerto: 1433
Usuario: sa
Password: MyStr0ngP4ssw0rd
Base de datos: SIGMA
```

---

## Cargar Datos de Prueba (Docker)

### Paso 1: Asegurar que Docker esta corriendo

```bash
npm run docker:up
```

### Paso 2: Copiar archivos al contenedor SQL Server

```powershell
# Copiar CSV
docker cp sigma-sql/datos_prueba.csv sqlserver:/tmp/data.csv

# Copiar script
docker cp sigma-sql/importar_csv_docker.sql sqlserver:/tmp/importar.sql
```

### Paso 3: Ejecutar script de importacion

```powershell
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -i /tmp/importar.sql
```

### Paso 4: Verificar datos

```powershell
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -d SIGMA -Q "SELECT 'Contribuyentes' AS Tabla, COUNT(*) AS Total FROM contribuyente UNION ALL SELECT 'Inconsistencias', COUNT(*) FROM inconsistencia UNION ALL SELECT 'Actividades', COUNT(*) FROM actividad"
```

---

## Tablas Principales

| Tabla | Descripcion | Registros |
|-------|-------------|-----------|
| `contribuyente` | Datos de contribuyentes (CUIT, razon social) | ~911 |
| `inconsistencia` | Inconsistencias tributarias | ~911 |
| `actividad` | Actividades economicas | ~173 |
| `usuario` | Usuarios del sistema | 1 (sistema) |
| `perfil` | Perfiles de usuario | 1 (sistema) |
| `tributo` | Tipos de tributo (ISIB) | 2 |
| `regimen` | Regimenes (LO, CM) | 2 |

---

## Estructura de Datos Enmascarados

### Contribuyente
```sql
SELECT cuit, razon_social, tipo_persona FROM contribuyente;
-- 30123456789 | Empresa Ficticia SA | Juridica
-- 20987654321 | Juan Perez Test     | Humana
```

### Inconsistencia
```sql
SELECT c.razon_social, i.diferencia, i.categoria
FROM inconsistencia i
JOIN contribuyente c ON i.contribuyente_id = c.id;
-- Empresa Ficticia SA | 697.33 | Masivo
```

---

## Uso en Tests E2E (Playwright)

### Ejemplo: Leer datos de SQL Server

```typescript
// e2e/utils/DatabaseHelper.ts
import sql from 'mssql';

const config = {
    server: 'localhost',
    port: 1433,
    user: 'sa',
    password: 'MyStr0ngP4ssw0rd',
    database: 'SIGMA',
    options: {
        trustServerCertificate: true
    }
};

export async function getContribuyente() {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .query('SELECT TOP 1 cuit, razon_social FROM contribuyente ORDER BY NEWID()');
    return result.recordset[0];
}
```

### Ejemplo: Usar en Test

```typescript
import { getContribuyente } from '../utils/DatabaseHelper';

test('TC-001: Buscar contribuyente', async ({ page }) => {
    const contribuyente = await getContribuyente();

    await page.fill('#cuit', contribuyente.cuit.toString());
    await page.click('#buscar');

    await expect(page.locator('#razon-social'))
        .toContainText(contribuyente.razon_social);
});
```

---

## Campos del CSV

| Columna | Descripcion | Ejemplo |
|---------|-------------|---------|
| CUIT | CUIT del contribuyente | 30123456789 |
| Razon social | Nombre/razon social | Empresa SA |
| Anticipo | Periodo anticipo | 12025 |
| TRX | Codigo transaccion | 3941206512 |
| Reg. | Regimen (LO o CM) | LO |
| ISIB Anual | Monto ISIB anual | "625.014,00" |
| DDJJs ISIB | Cantidad DDJJ ISIB | 12 |
| Base Imp. | Base imponible | "46.489,00" |
| Diferencia | Diferencia calculada | "697,33" |
| Categoria | Categoria | Masivo |
| tipo_persona | Tipo persona | Humana/Juridica |

---

## Notas de Seguridad

- Los datos son **100% ficticios/enmascarados**
- No contienen informacion real de contribuyentes
- Generados para pruebas de QA unicamente
- Cumple con buenas practicas de no usar datos de produccion

---

## Solucion de Problemas

### Error: "Cannot bulk load"
- Verificar que el CSV este copiado al contenedor
- Usar la ruta correcta: `/tmp/data.csv`

### Error: "Login failed"
- Esperar 30 segundos despues de `npm run docker:up`
- Verificar password: `MyStr0ngP4ssw0rd`

### Error: "Database SIGMA already exists"
- El script elimina y recrea la BD automaticamente
- Si falla, reiniciar el contenedor SQL Server

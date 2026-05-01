/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INFLUX CLIENT - Cliente para enviar métricas a InfluxDB
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Utilidad compartida para enviar métricas de E2E, API y ZAP a InfluxDB
 * para visualización en el Centro de Control de Grafana.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_DB = process.env.INFLUX_DB || 'qa_metrics';

/**
 * Asegura que la base de datos qa_metrics exista
 */
async function ensureDatabase() {
    try {
        await fetch(`${INFLUX_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `q=CREATE DATABASE ${INFLUX_DB}`
        });
    } catch {
        // Silently ignore - database may already exist
    }
}

/**
 * Envía una métrica a InfluxDB
 * @param {string} measurement - Nombre de la medición (e2e_tests, api_tests, zap_security)
 * @param {object} tags - Tags para filtrar (test_suite, status, etc.)
 * @param {object} fields - Valores numéricos (passed, failed, duration, etc.)
 */
export async function sendMetric(measurement, tags, fields) {
    // Asegurar que la base de datos existe antes de enviar
    await ensureDatabase();

    const tagString = Object.entries(tags)
        .map(([k, v]) => `${k}=${String(v).replace(/ /g, '\\ ')}`)
        .join(',');

    const fieldString = Object.entries(fields)
        .map(([k, v]) => typeof v === 'string' ? `${k}="${v}"` : `${k}=${v}`)
        .join(',');

    const line = `${measurement},${tagString} ${fieldString}`;

    try {
        const response = await fetch(`${INFLUX_URL}/write?db=${INFLUX_DB}`, {
            method: 'POST',
            body: line
        });

        if (!response.ok) {
            console.error(`  ⚠️ Error enviando métrica: ${response.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`  ⚠️ InfluxDB no disponible: ${error.message}`);
        return false;
    }
}

/**
 * Verifica conexión a InfluxDB
 */
export async function checkInfluxConnection() {
    try {
        const response = await fetch(`${INFLUX_URL}/ping`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Envía métricas de E2E Tests
 */
export async function sendE2EMetrics({ suite, passed, failed, skipped, duration }) {
    const total = passed + failed + skipped;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return sendMetric('e2e_tests',
        { suite: suite || 'default', type: 'e2e' },
        {
            passed: passed,
            failed: failed,
            skipped: skipped,
            total: total,
            pass_rate: passRate,
            duration: duration || 0
        }
    );
}

/**
 * Envía métricas de API Tests
 */
export async function sendAPIMetrics({ collection, passed, failed, total_requests, duration }) {
    // Pass rate basado en assertions (passed vs passed+failed)
    const totalAssertions = passed + failed;
    const passRate = totalAssertions > 0 ? (passed / totalAssertions) * 100 : 0;

    return sendMetric('api_tests',
        { collection: collection || 'default', type: 'api' },
        {
            passed: passed,
            failed: failed,
            total_requests: total_requests,
            pass_rate: passRate,
            duration: duration || 0
        }
    );
}

/**
 * Envía métricas de K6 Performance (alto nivel, para tiles de Grafana).
 * Las métricas streaming detalladas las manda K6 directo via --out influxdb=...
 */
export async function sendK6Metrics({
    test_name,
    iterations,
    http_requests,
    http_failed_rate,
    p95_response_time,
    p99_response_time,
    max_vus,
    duration_seconds,
    thresholds_passed,
    thresholds_failed,
    checks_passed,
    checks_failed,
}) {
    return sendMetric('k6_performance',
        { test_name: test_name || 'default', type: 'performance' },
        {
            iterations: iterations || 0,
            http_requests: http_requests || 0,
            http_failed_rate: http_failed_rate || 0,
            p95_response_time: p95_response_time || 0,
            p99_response_time: p99_response_time || 0,
            max_vus: max_vus || 0,
            duration_seconds: duration_seconds || 0,
            thresholds_passed: thresholds_passed || 0,
            thresholds_failed: thresholds_failed || 0,
            checks_passed: checks_passed || 0,
            checks_failed: checks_failed || 0,
        }
    );
}

/**
 * Envía métricas de ZAP Security
 */
export async function sendZAPMetrics({ target, high, medium, low, informational }) {
    const total = high + medium + low + informational;

    return sendMetric('zap_security',
        { target: target || 'unknown', type: 'security' },
        {
            high: high,
            medium: medium,
            low: low,
            informational: informational,
            total_alerts: total
        }
    );
}

export default {
    sendMetric,
    checkInfluxConnection,
    sendE2EMetrics,
    sendAPIMetrics,
    sendK6Metrics,
    sendZAPMetrics
};

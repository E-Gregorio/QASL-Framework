import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://automationexercise.com';
const VUS = parseInt(__ENV.K6_VUS || '2', 10);
const HOLD_DURATION = __ENV.K6_DURATION || '20s';
const RAMP_UP = __ENV.K6_RAMP_UP || '5s';
const RAMP_DOWN = __ENV.K6_RAMP_DOWN || '5s';

const setupSuccess = new Rate('setup_create_account_success');
const authSuccess = new Rate('auth_verify_login_success');
const authdSuccess = new Rate('authd_search_product_success');
const teardownSuccess = new Rate('teardown_delete_account_success');
const tokenAcquisitionTime = new Trend('token_acquisition_ms', true);
const businessTransactions = new Counter('business_transactions_completed');

export const options = {
  stages: [
    { duration: RAMP_UP, target: VUS },
    { duration: HOLD_DURATION, target: VUS },
    { duration: RAMP_DOWN, target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.50'],
    setup_create_account_success: ['rate>0.50'],
    auth_verify_login_success: ['rate>0.50'],
    token_acquisition_ms: ['p(95)<2000'],
  },
  tags: {
    framework: 'QASL',
    feature: 'HU_REG_01',
    test_type: 'concurrency_demo',
  },
};

function uniqueUser() {
  const id = `${__VU}_${__ITER}_${Date.now()}`;
  return {
    name: `K6User${id}`,
    email: `k6_${id}@qaslframework.test`,
    password: 'K6TestPass123',
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1995',
    firstname: 'K6',
    lastname: 'Tester',
    company: 'QASL Framework',
    address1: '123 QA Street',
    address2: '',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    zipcode: 'A1B2C3',
    mobile_number: '+12345678901',
  };
}

function parseResponseCode(res) {
  try {
    const body = res.json();
    return typeof body === 'object' && body !== null ? body.responseCode : null;
  } catch {
    return null;
  }
}

export default function () {
  const user = uniqueUser();
  let token = null;

  group('SETUP · Create account (POST /api/createAccount)', function () {
    const res = http.post(`${BASE_URL}/api/createAccount`, user, {
      tags: { step: 'setup', endpoint: 'createAccount' },
    });
    const code = parseResponseCode(res);
    const ok = res.status === 200 && (code === 201 || code === 200);
    check(res, {
      'HTTP 200': (r) => r.status === 200,
      'responseCode 201 (created)': () => code === 201 || code === 200,
    });
    setupSuccess.add(ok);
  });

  group('AUTH · Verify login (token acquisition)', function () {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/verifyLogin`,
      { email: user.email, password: user.password },
      { tags: { step: 'auth', endpoint: 'verifyLogin' } },
    );
    const elapsed = Date.now() - start;
    const code = parseResponseCode(res);
    const ok = res.status === 200 && code === 200;
    check(res, {
      'HTTP 200': (r) => r.status === 200,
      'responseCode 200 (user exists)': () => code === 200,
    });
    authSuccess.add(ok);
    tokenAcquisitionTime.add(elapsed);
    if (ok) {
      token = `qasl-session-${user.email}-${Date.now()}`;
    }
  });

  group('AUTHENTICATED · Search products (uses simulated token)', function () {
    if (!token) {
      authdSuccess.add(false);
      return;
    }
    const res = http.post(
      `${BASE_URL}/api/searchProduct`,
      { search_product: 'top' },
      {
        tags: { step: 'authd', endpoint: 'searchProduct' },
        headers: { 'X-Auth-Token': token },
      },
    );
    const code = parseResponseCode(res);
    const ok = res.status === 200 && code === 200;
    check(res, {
      'HTTP 200': (r) => r.status === 200,
      'responseCode 200 (products returned)': () => code === 200,
      'token sent in header': () => res.request.headers['X-Auth-Token']?.[0] === token,
    });
    authdSuccess.add(ok);
    if (ok) businessTransactions.add(1);
  });

  group('TEARDOWN · Delete account (cleanup)', function () {
    const res = http.del(
      `${BASE_URL}/api/deleteAccount`,
      { email: user.email, password: user.password },
      { tags: { step: 'teardown', endpoint: 'deleteAccount' } },
    );
    const code = parseResponseCode(res);
    const ok = res.status === 200 && code === 200;
    check(res, {
      'HTTP 200': (r) => r.status === 200,
      'responseCode 200 (account deleted)': () => code === 200,
    });
    teardownSuccess.add(ok);
  });

  sleep(1);
}

export function handleSummary(data) {
  const summaryPath = __ENV.K6_SUMMARY_JSON || 'reports/k6/k6-summary.json';
  return {
    [summaryPath]: JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const lines = [];
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════════════════');
  lines.push('  QASL Framework · K6 Performance Summary · HU_REG_01');
  lines.push('═══════════════════════════════════════════════════════════════════════════');
  lines.push('');

  const m = data.metrics || {};
  const fmt = (v, d = 0) => (typeof v === 'number' ? v.toFixed(d) : 'n/a');
  const pct = (v) => (typeof v === 'number' ? `${(v * 100).toFixed(2)}%` : 'n/a');
  const get = (key, sub) => (m[key] && m[key].values ? m[key].values[sub] : undefined);

  lines.push(`  Iterations completed       : ${fmt(get('iterations', 'count'))}`);
  lines.push(`  HTTP requests              : ${fmt(get('http_reqs', 'count'))}`);
  lines.push(`  Request rate (req/s)       : ${fmt(get('http_reqs', 'rate'), 2)}`);
  lines.push(`  Failed requests            : ${pct(get('http_req_failed', 'rate'))}`);
  lines.push('');
  lines.push(`  Response time avg          : ${fmt(get('http_req_duration', 'avg'), 1)} ms`);
  lines.push(`  Response time p50          : ${fmt(get('http_req_duration', 'med'), 1)} ms`);
  lines.push(`  Response time p95          : ${fmt(get('http_req_duration', 'p(95)'), 1)} ms`);
  lines.push(`  Response time p99          : ${fmt(get('http_req_duration', 'p(99)'), 1)} ms`);
  lines.push(`  Response time max          : ${fmt(get('http_req_duration', 'max'), 1)} ms`);
  lines.push('');
  lines.push(`  Setup success rate         : ${pct(get('setup_create_account_success', 'rate'))}`);
  lines.push(`  Auth success rate          : ${pct(get('auth_verify_login_success', 'rate'))}`);
  lines.push(`  Authd request success rate : ${pct(get('authd_search_product_success', 'rate'))}`);
  lines.push(`  Teardown success rate      : ${pct(get('teardown_delete_account_success', 'rate'))}`);
  lines.push(`  Token acquisition p95      : ${fmt(get('token_acquisition_ms', 'p(95)'), 1)} ms`);
  lines.push(`  Business transactions      : ${fmt(get('business_transactions_completed', 'count'))}`);
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════════════════');
  lines.push('');
  return lines.join('\n');
}

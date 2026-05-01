export interface AccountInfo {
  password: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

const DEFAULT_ACCOUNT_DOMAIN = 'qaslframework.test';
const VALID_PASSWORD_BASE = 'Valid';

const DEFAULT_ACCOUNT_BASE: Omit<AccountInfo, 'password'> = {
  day: '15',
  month: '6',
  year: '1995',
  firstName: 'Test',
  lastName: 'User',
  address: '123 QA Automation Street',
  country: 'Canada',
  state: 'Ontario',
  city: 'Toronto',
  zipcode: 'A1B2C3',
  mobileNumber: '+12345678901',
};

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  '" OR "1"="1',
  "admin' --",
  "' OR 1=1 --",
] as const;

const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
] as const;

const INVALID_EMAIL_FORMATS = [
  'usuario@.com',
  '@example.com',
  'usuario',
  'usuario@',
  'usuario@@example.com',
  'usuario @example.com',
] as const;

export class DataGenerator {
  static uniqueEmail(prefix: string): string {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}@${DEFAULT_ACCOUNT_DOMAIN}`;
  }

  static randomName(prefix = 'TestUser'): string {
    const stamp = Date.now().toString(36);
    return `${prefix}_${stamp}`;
  }

  static validPassword(): string {
    return `${VALID_PASSWORD_BASE}${Date.now().toString().slice(-6)}`;
  }

  static passwordOfLength(length: number): string {
    const pool = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += pool.charAt(i % pool.length);
    }
    return result;
  }

  static longPassword(length = 20): string {
    return this.passwordOfLength(length);
  }

  static accountInfo(password: string): AccountInfo {
    return { ...DEFAULT_ACCOUNT_BASE, password };
  }

  static sqlInjectionPayload(index = 0): string {
    return SQL_INJECTION_PAYLOADS[index % SQL_INJECTION_PAYLOADS.length];
  }

  static xssPayload(index = 0): string {
    return XSS_PAYLOADS[index % XSS_PAYLOADS.length];
  }

  static invalidEmailFormat(index = 0): string {
    return INVALID_EMAIL_FORMATS[index % INVALID_EMAIL_FORMATS.length];
  }

  static get emptyValue(): string {
    return '';
  }
}

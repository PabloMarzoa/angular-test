import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Clear before each test
    localStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  });

  describe('LocalStorage', () => {
    it('should set and get local data', () => {
      const data = { foo: 'bar' };
      service.setLocal('test_key', data);
      expect(service.getLocal('test_key')).toEqual(data);
    });

    it('should store data encoded in base64', () => {
      const data = { foo: 'bar' };
      service.setLocal('test_key', data);
      const raw = localStorage.getItem('test_key');
      expect(raw).not.toContain('foo');
      expect(atob(raw!)).toContain('foo');
    });

    it('should remove local data', () => {
      service.setLocal('test_key', 'value');
      service.removeLocal('test_key');
      expect(service.getLocal('test_key')).toBeNull();
    });

    it('should clear all local storage', () => {
      service.setLocal('a', 1);
      service.setLocal('b', 2);
      service.clearLocal();
      expect(service.getLocal('a')).toBeNull();
      expect(service.getLocal('b')).toBeNull();
    });
  });

  describe('Cookies', () => {
    it('should set and get cookies', () => {
      service.setCookie('test_cookie', 'test_value');
      expect(service.getCookie('test_cookie')).toBe('test_value');
    });

    it('should remove cookies', () => {
      service.setCookie('test_cookie', 'test_value');
      service.removeCookie('test_cookie');
      expect(service.getCookie('test_cookie')).toBeNull();
    });
  });
});

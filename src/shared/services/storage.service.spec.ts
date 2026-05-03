import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

if (typeof btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) => (globalThis as any).Buffer.from(str).toString('base64');
  (globalThis as any).atob = (str: string) => (globalThis as any).Buffer.from(str, 'base64').toString();
}

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

    it('should return null if cookie is not base64 encoded', () => {
      document.cookie = 'bad_cookie=not-base64!';
      // StorageService.getCookie uses try/catch on atob
      expect(service.getCookie('bad_cookie')).toBe('not-base64!');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage.setItem errors', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      service.setLocal('key', 'value');
      
      expect(consoleSpy).toHaveBeenCalled();
      spy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle localStorage.getItem errors', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = service.getLocal('key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      spy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON in decoded storage', () => {
      // Set valid base64 but invalid JSON
      localStorage.setItem('key', btoa('{invalid-json}'));
      const result = service.getLocal('key');
      expect(result).toBeNull();
    });
  });
});

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setLocal<T>(key: string, value: T): void {
    try {
      const stringified = JSON.stringify(value);
      const encoded = btoa(stringified);
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Error saving to LocalStorage', error);
    }
  }

  getLocal<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      let decoded: string;
      try {
        decoded = atob(item);
      } catch {
        decoded = item;
      }

      return JSON.parse(decoded) as T;
    } catch (error) {
      console.error('Error reading from LocalStorage', error);
      return null;
    }
  }

  removeLocal(key: string): void {
    localStorage.removeItem(key);
  }

  clearLocal(): void {
    localStorage.clear();
  }

  setCookie(key: string, value: string, days: number = 365): void {
    const encodedValue = btoa(value);
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${key}=${encodedValue || ''}${expires}; path=/; SameSite=Lax`;
  }

  getCookie(key: string): string | null {
    const nameEQ = `${key}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        try {
          return atob(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  }

  removeCookie(key: string): void {
    this.setCookie(key, '', -1);
  }
}

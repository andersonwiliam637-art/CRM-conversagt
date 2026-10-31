// src/services/apiService.ts - Centralized API Service with Auth & Multi-Tenancy
import { Client, DocumentItem, Conversation, TransactionRecord } from '../types';

const TOKEN_KEY = 'conversa_auth_token';
const USER_KEY = 'conversa_auth_user';

export interface CurrentUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'AGENT' | 'VIEWER';
}

async function safeJson<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fallback;
    }
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

class ApiService {
  private token: string | null = null;
  private user: CurrentUser | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    } catch {
      // Storage unavailable
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): CurrentUser | null {
    return this.user;
  }

  public setSession(token: string, user: CurrentUser) {
    this.token = token;
    this.user = user;
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }

  public clearSession() {
    this.token = null;
    this.user = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }

  public getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Initializes session: checks existing session or requests default starter session
   */
  public async initSession(): Promise<CurrentUser | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await safeJson(res, { user: null });
        if (data.user) {
          this.user = data.user;
          return data.user;
        }
      }

      // If no valid session, auto-authenticate with starter account
      return await this.loginStarter();
    } catch {
      return null;
    }
  }

  public async loginStarter(): Promise<CurrentUser | null> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'andersonwiliam637@gmail.com',
          password: 'ConversaGT2026!SecureAuth',
        }),
      });

      if (res.ok) {
        const data = await safeJson(res, { token: null, user: null });
        if (data.token && data.user) {
          this.setSession(data.token, data.user);
          return data.user;
        }
      }
    } catch {}
    return null;
  }

  public async adminLogin(payload: { email?: string; password?: string; pin?: string }): Promise<{ success: boolean; user?: CurrentUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await safeJson<{ authenticated: boolean; user?: CurrentUser; token?: string; error?: string }>(res, { authenticated: false, error: 'Error al interpretar respuesta' });
      if (res.ok && data.authenticated && data.user) {
        this.setSession(data.token, data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Credenciales inválidas.' };
    } catch (err: any) {
      return { success: false, error: 'Error de conexión con el servidor.' };
    }
  }

  public async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
    } catch {}
    this.clearSession();
  }

  // --- CRM Clients ---
  public async getClients(): Promise<Client[]> {
    try {
      const res = await fetch('/api/clients', {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      const data = await safeJson(res, { clients: [] });
      return data.clients || [];
    } catch {
      return [];
    }
  }

  public async createClient(client: Partial<Client>): Promise<string> {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error('Error al registrar cliente');
    const data = await safeJson(res, { clientId: 'client-' + Date.now() });
    return data.clientId;
  }

  public async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar cliente');
  }

  // --- RAG Documents ---
  public async getDocuments(): Promise<DocumentItem[]> {
    try {
      const res = await fetch('/api/documents', {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      const data = await safeJson(res, { documents: [] });
      return data.documents || [];
    } catch {
      return [];
    }
  }

  public async createDocument(doc: { title: string; category: string; description?: string; content: string }): Promise<string> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(doc),
    });
    if (!res.ok) {
      const err = await safeJson(res, { error: 'Error al subir documento' });
      throw new Error(err.error || 'Error al guardar documento');
    }
    const data = await safeJson(res, { documentId: 'doc-' + Date.now() });
    return data.documentId;
  }

  public async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar documento');
  }

  // --- Conversations ---
  public async getConversations(): Promise<Conversation[]> {
    try {
      const res = await fetch('/api/conversations', {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      const data = await safeJson(res, { conversations: [] });
      return data.conversations || [];
    } catch {
      return [];
    }
  }

  // --- Billing Transactions ---
  public async getTransactions(): Promise<TransactionRecord[]> {
    try {
      const res = await fetch('/api/billing/transactions', {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      const data = await safeJson(res, { transactions: [] });
      return data.transactions || [];
    } catch {
      return [];
    }
  }

  // --- Audit Logs (Admin only) ---
  public async getAuditLogs(): Promise<any[]> {
    try {
      const res = await fetch('/api/security/audit-logs', {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      const data = await safeJson(res, { logs: [] });
      return data.logs || [];
    } catch {
      return [];
    }
  }
}

export const api = new ApiService();

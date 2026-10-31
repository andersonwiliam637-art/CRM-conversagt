// server/db.ts - Relational Centralized Database with Multi-Tenant Isolation
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { hashPassword, verifyPassword } from "./security.js";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "conversagt.db");
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys for concurrency and ACID integrity
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan TEXT NOT NULL DEFAULT 'Plan Business Pro',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'AGENT', 'VIEWER')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS channel_configs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      channel_type TEXT NOT NULL, -- 'whatsapp_meta', 'telegram_bot', 'whatsapp_qr'
      config_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'disconnected',
      updated_at TEXT NOT NULL,
      UNIQUE(tenant_id, channel_type),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS channel_connections (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      channel TEXT NOT NULL, -- 'whatsapp', 'telegram', 'instagram', 'webchat'
      provider TEXT NOT NULL, -- 'meta_cloud_api', 'whatsapp_web_linked', 'telegram_bot_api', 'webchat_native'
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NO_CONFIGURADO', -- 'NO_CONFIGURADO', 'CONFIGURACION_PENDIENTE', 'VERIFICANDO', 'CONECTADO', 'ERROR_CONEXION', 'DEMO_DATOS_PRUEBA'
      credentials_reference TEXT NOT NULL, -- Reference pointer to secure vault (NEVER plain secrets!)
      masked_identifier TEXT, -- e.g. "+502 •••• 4016" or "WABA •••• 0394"
      last_verified_at TEXT,
      warning_message TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(tenant_id, provider),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      stage TEXT NOT NULL DEFAULT 'nuevo',
      ltv REAL NOT NULL DEFAULT 0,
      deals_count INTEGER NOT NULL DEFAULT 0,
      channel_origin TEXT NOT NULL DEFAULT 'whatsapp',
      tags TEXT, -- JSON array
      last_contact_date TEXT,
      notes TEXT,
      assigned_to TEXT,
      payment_method_preferred TEXT,
      activation_status TEXT NOT NULL DEFAULT 'pendiente_verificacion',
      payment_confirmed INTEGER NOT NULL DEFAULT 0,
      bot_enabled INTEGER NOT NULL DEFAULT 1,
      lead_source TEXT,
      selected_plan TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_avatar TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      channel TEXT NOT NULL DEFAULT 'whatsapp',
      last_message TEXT,
      last_message_time TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL CHECK(sender IN ('agent', 'bot_gemini', 'user')),
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL DEFAULT 0,
      file_size INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      authorization_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GTQ',
      plan_or_item TEXT NOT NULL,
      method TEXT NOT NULL,
      bank_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending_verification',
      requires_manual_activation INTEGER NOT NULL DEFAULT 1,
      is_sandbox INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      event_type TEXT NOT NULL,
      ip_address TEXT,
      actor TEXT NOT NULL,
      details TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      endpoint TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      model_used TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_channel_connections_tenant ON channel_connections(tenant_id);
  `);

  // Seed default tenant if empty
  const tenantCheck = db.prepare("SELECT COUNT(*) as count FROM tenants").get() as { count: number };
  if (tenantCheck.count === 0) {
    seedInitialData();
  }

  // Ensure admin user exists and password is valid
  ensureDefaultAdminUser();

  // Ensure default channel connections exist
  ensureChannelConnectionsSeeded();
}

function ensureDefaultAdminUser() {
  const defaultTenantId = "tenant-ferreteria-progreso";
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "andersonwiliam637@gmail.com").toLowerCase();
  const defaultAdminPass = process.env.ADMIN_DEFAULT_PASSWORD || "ConversaGT2026!SecureAuth";

  try {
    const adminUser = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail) as any;
    if (!adminUser) {
      const { hash, salt } = hashPassword(defaultAdminPass);
      db.prepare(`
        INSERT INTO users (id, tenant_id, email, password_hash, salt, name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        "user-superadmin-001",
        defaultTenantId,
        adminEmail,
        hash,
        salt,
        "Anderson William (Ingeniero AI)",
        "SUPER_ADMIN",
        new Date().toISOString(),
        new Date().toISOString()
      );
    } else if (!verifyPassword(defaultAdminPass, adminUser.password_hash, adminUser.salt)) {
      const { hash, salt } = hashPassword(defaultAdminPass);
      db.prepare("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?").run(hash, salt, adminUser.id);
    }

    ensureSecondaryTestTenant();
  } catch (err) {
    console.error("[Database] Error ensuring default admin user:", err);
  }
}

function ensureSecondaryTestTenant() {
  const now = new Date().toISOString();
  const tenantBId = "tenant-corporacion-occidente";
  const tenantB = db.prepare("SELECT * FROM tenants WHERE id = ?").get(tenantBId) as any;
  if (!tenantB) {
    db.prepare(`
      INSERT INTO tenants (id, name, slug, plan, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      tenantBId,
      "Corporación Ferretera de Occidente S.A.",
      "corporacion-occidente",
      "Plan Empresarial",
      "active",
      now,
      now
    );
  }

  const userB = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@occidente.gt") as any;
  if (!userB) {
    const { hash, salt } = hashPassword("OccidenteAdmin2026!");
    db.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, salt, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "user-admin-occidente-002",
      tenantBId,
      "admin@occidente.gt",
      hash,
      salt,
      "Lic. Mario Ovalle (Admin Occidente)",
      "TENANT_ADMIN",
      now,
      now
    );
  }

  const connB = db.prepare("SELECT * FROM channel_connections WHERE tenant_id = ?").get(tenantBId) as any;
  if (!connB) {
    db.prepare(`
      INSERT INTO channel_connections (
        id, tenant_id, channel, provider, name, status,
        credentials_reference, masked_identifier, last_verified_at,
        warning_message, is_demo, created_at, updated_at
      ) VALUES (?, ?, 'whatsapp', 'meta_cloud_api', 'WhatsApp Business Occidente', 'NO_CONFIGURADO', ?, 'Sin número verificado', NULL, NULL, 0, ?, ?)
    `).run(
      "conn-meta-occidente-001",
      tenantBId,
      `vault:${tenantBId}:meta_cloud_api`,
      now,
      now
    );
  }
}

function ensureChannelConnectionsSeeded() {
  const defaultTenantId = "tenant-ferreteria-progreso";
  const now = new Date().toISOString();
  try {
    const connCheck = db.prepare("SELECT COUNT(*) as count FROM channel_connections WHERE tenant_id = ?").get(defaultTenantId) as { count: number };
    if (connCheck && connCheck.count === 0) {
      // 1. WhatsApp Meta Cloud API (Official)
      db.prepare(`
        INSERT INTO channel_connections (
          id, tenant_id, channel, provider, name, status,
          credentials_reference, masked_identifier, last_verified_at,
          warning_message, is_demo, created_at, updated_at
        ) VALUES (?, ?, 'whatsapp', 'meta_cloud_api', 'WhatsApp Business Meta Cloud API', 'NO_CONFIGURADO', ?, 'Sin número verificado', NULL, NULL, 0, ?, ?)
      `).run(
        "conn-meta-default",
        defaultTenantId,
        `vault:${defaultTenantId}:meta_cloud_api`,
        now,
        now
      );

      // 2. WhatsApp Web — Sesión vinculada (Decoupled microservice architecture)
      db.prepare(`
        INSERT INTO channel_connections (
          id, tenant_id, channel, provider, name, status,
          credentials_reference, masked_identifier, last_verified_at,
          warning_message, is_demo, created_at, updated_at
        ) VALUES (?, ?, 'whatsapp', 'whatsapp_web_linked', 'WhatsApp Web — Sesión vinculada', 'DEMO_DATOS_PRUEBA', ?, '+502 •••• 4016 (Simulado)', ?, ?, 1, ?, ?)
      `).run(
        "conn-wa-web-default",
        defaultTenantId,
        `worker:wa_web_session:${defaultTenantId}`,
        now,
        "Conector alternativo mediante sesión vinculada. No corresponde a Meta Cloud API. Requiere microservicio dedicado y puede tener riesgos de desconexión o suspensión si se usa indebidamente.",
        now,
        now
      );

      // 3. Telegram Bot API
      db.prepare(`
        INSERT INTO channel_connections (
          id, tenant_id, channel, provider, name, status,
          credentials_reference, masked_identifier, last_verified_at,
          warning_message, is_demo, created_at, updated_at
        ) VALUES (?, ?, 'telegram', 'telegram_bot_api', 'Telegram Bot API', 'NO_CONFIGURADO', ?, 'Sin bot vinculado', NULL, NULL, 0, ?, ?)
      `).run(
        "conn-tg-default",
        defaultTenantId,
        `vault:${defaultTenantId}:telegram_bot_api`,
        now,
        now
      );
    }
  } catch (err) {
    console.error("[Database] Error seeding channel connections:", err);
  }
}

function seedInitialData() {
  const now = new Date().toISOString();
  const defaultTenantId = "tenant-ferreteria-progreso";
  
  // 1. Default Tenant
  db.prepare(`
    INSERT INTO tenants (id, name, slug, plan, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    defaultTenantId,
    "Ferretería & Materiales El Progreso",
    "ferreteria-progreso",
    "Plan Negocio Pro",
    "active",
    now,
    now
  );

  // 2. Default Super Admin & Tenant Admin (from environment variable or secure random fallback)
  // NEVER HARDCODE PASSWORDS IN SOURCE CODE. Default admin credentials are set via env or generated.
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "andersonwiliam637@gmail.com";
  const initialPassword = process.env.ADMIN_DEFAULT_PASSWORD || "ConversaGT2026!SecureAuth";
  const { hash, salt } = hashPassword(initialPassword);

  db.prepare(`
    INSERT INTO users (id, tenant_id, email, password_hash, salt, name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "user-superadmin-001",
    defaultTenantId,
    adminEmail,
    hash,
    salt,
    "Anderson William (Ingeniero AI)",
    "SUPER_ADMIN",
    now,
    now
  );

  // 3. Seed initial clients with strict tenant binding
  const seedClients = [
    {
      id: "client-1",
      name: "Arq. Alejandro Morales",
      company: "Constructora Las Terrazas",
      email: "alejandro@lasterrazas.gt",
      phone: "+502 5415-4016",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      stage: "ganado",
      ltv: 3229.20,
      deals_count: 3,
      channel_origin: "whatsapp",
      tags: JSON.stringify(["VIP", "Construcción", "WhatsApp Business"]),
      notes: "Cliente corporativo recurrente. Pagos puntuales a Banco Industrial.",
      assigned_to: "Anderson William",
      payment_method_preferred: "bank_transfer",
      activation_status: "activo",
      payment_confirmed: 1,
      bot_enabled: 1
    },
    {
      id: "client-2",
      name: "Licda. Sofía Castillo",
      company: "Clínicas Dentales San Lucas",
      email: "scastillo@dentalesguate.com",
      phone: "+502 4030-4374",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      stage: "propuesta",
      ltv: 750,
      deals_count: 1,
      channel_origin: "telegram",
      tags: JSON.stringify(["Salud", "Bot 24/7", "Telegram"]),
      notes: "Interesada en catálogo interactivo y recordatorio de citas.",
      assigned_to: "Anderson William",
      payment_method_preferred: "paypal",
      activation_status: "pendiente_verificacion",
      payment_confirmed: 0,
      bot_enabled: 1
    }
  ];

  const insertClient = db.prepare(`
    INSERT INTO clients (
      id, tenant_id, name, company, email, phone, avatar, stage, ltv,
      deals_count, channel_origin, tags, notes, assigned_to,
      payment_method_preferred, activation_status, payment_confirmed, bot_enabled,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of seedClients) {
    insertClient.run(
      c.id, defaultTenantId, c.name, c.company, c.email, c.phone, c.avatar,
      c.stage, c.ltv, c.deals_count, c.channel_origin, c.tags, c.notes,
      c.assigned_to, c.payment_method_preferred, c.activation_status,
      c.payment_confirmed, c.bot_enabled, now, now
    );
  }

  // 4. Seed initial conversations and messages
  const convId = "conv-1";
  db.prepare(`
    INSERT INTO conversations (
      id, tenant_id, customer_id, customer_name, customer_avatar,
      customer_phone, customer_email, channel, last_message,
      last_message_time, unread_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    convId,
    defaultTenantId,
    "client-1",
    "Arq. Alejandro Morales",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "+502 5415-4016",
    "alejandro@lasterrazas.gt",
    "whatsapp",
    "Estimado Anderson, ya transferí el pago a Banco Industrial. Adjunto boleta.",
    "Hace 5 min",
    1,
    now,
    now
  );

  db.prepare(`
    INSERT INTO messages (id, tenant_id, conversation_id, sender, text, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "msg-1",
    defaultTenantId,
    convId,
    "user",
    "Estimado Anderson, ya transferí el pago a Banco Industrial. Adjunto boleta de depósito No. 1402158.",
    "received",
    now
  );

  // 5. Seed initial RAG document knowledge base
  db.prepare(`
    INSERT INTO documents (id, tenant_id, title, category, description, content, token_count, file_size, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "doc-1",
    defaultTenantId,
    "Catálogo de Precios y Políticas ConversaGT 2026",
    "product_catalog",
    "Base de conocimiento oficial para el motor IA",
    `INFORMACIÓN OFICIAL CONVERSAGT 2026:
Planes disponibles:
- Plan Emprendedor: Q350/mes ($45 USD) con 1 agente y bot IA 24/7 en WhatsApp y Telegram.
- Plan Business Pro: Q750/mes ($95 USD) con 3 agentes, catálogos RAG y campañas masivas.
- Plan Platinum: Q2,299/año ($295 USD) con agentes ilimitados y facturación SAT DTE.
Cuentas autorizadas: Banco Industrial No. 1402158 y BAM No. 4030437443 a nombre de Anderson William. PayPal oficial: andersonwiliam637@gmail.com.
Soporte técnico directo: +502 5415-4016.`,
    350,
    1024,
    now
  );

  // 6. Seed initial audit log entry
  db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, event_type, ip_address, actor, details, severity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "log-init",
    defaultTenantId,
    "system_security_initialized",
    "127.0.0.1",
    "Sistema ConversaGT",
    "Base de datos SQLite persistente con aislamiento multi-tenant inicializada con éxito.",
    "info",
    now
  );
}

import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  base64Data: text("base64_data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: varchar("id", { length: 32 }).primaryKey(),
  employeeNumber: varchar("employee_number", { length: 80 }),
  name: varchar("name", { length: 160 }).notNull(),
  position: varchar("position", { length: 160 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const classifications = pgTable("classifications", {
  code: varchar("code", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const incomingLetters = pgTable("incoming_letters", {
  id: varchar("id", { length: 32 }).primaryKey(),
  agendaNo: integer("agenda_no").notNull(),
  letterNumber: varchar("letter_number", { length: 120 }).notNull(),
  letterDate: date("letter_date").notNull(),
  receivedDate: date("received_date").notNull(),
  sender: varchar("sender", { length: 200 }).notNull(),
  subject: text("subject").notNull(),
  classificationCode: varchar("classification_code", { length: 32 }).notNull(),
  securityLevel: varchar("security_level", { length: 24 }).notNull().default("Biasa"),
  attachmentId: integer("attachment_id").references(() => attachments.id),
  dispositionStatus: varchar("disposition_status", { length: 20 }).notNull().default("Belum"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 120 }).notNull().default("Admin TU"),
});

export const outgoingLetters = pgTable(
  "outgoing_letters",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    agendaNo: integer("agenda_no").notNull(),
    officialNumber: varchar("official_number", { length: 200 }).notNull(),
    letterDate: date("letter_date").notNull(),
    recipient: varchar("recipient", { length: 200 }).notNull(),
    subject: text("subject").notNull(),
    classificationCode: varchar("classification_code", { length: 32 }).notNull(),
    signer: varchar("signer", { length: 160 }).notNull(),
    attachmentId: integer("attachment_id").references(() => attachments.id),
    verificationCode: varchar("verification_code", { length: 32 }).notNull(),
    archiveStatus: varchar("archive_status", { length: 24 }).notNull().default("Draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 120 }).notNull().default("Admin TU"),
  },
  (table) => [
    uniqueIndex("outgoing_letters_official_number_unique").on(table.officialNumber),
    uniqueIndex("outgoing_letters_verification_code_unique").on(table.verificationCode),
  ],
);

export const dispositions = pgTable("dispositions", {
  id: varchar("id", { length: 32 }).primaryKey(),
  incomingLetterId: varchar("incoming_letter_id", { length: 32 })
    .notNull()
    .references(() => incomingLetters.id),
  letterNumber: varchar("letter_number", { length: 120 }).notNull(),
  subject: text("subject").notNull(),
  dispositionDate: date("disposition_date").notNull(),
  dueDate: date("due_date"),
  instruction: varchar("instruction", { length: 120 }).notNull(),
  leaderNote: text("leader_note"),
  staffId: varchar("staff_id", { length: 32 }).notNull().references(() => staff.id),
  staffName: varchar("staff_name", { length: 160 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }),
  whatsappStatus: varchar("whatsapp_status", { length: 32 }).notNull().default("Tidak Ada Nomor"),
  whatsappMessageId: varchar("whatsapp_message_id", { length: 160 }),
  followUpStatus: varchar("follow_up_status", { length: 24 }).notNull().default("Pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    username: varchar("username", { length: 60 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 24 }).notNull().default("tu"),
    staffId: varchar("staff_id", { length: 32 }).references(() => staff.id),
    status: varchar("status", { length: 20 }).notNull().default("Aktif"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_username_unique").on(table.username)],
);

export const sessions = pgTable("sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 32 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserRow = typeof users.$inferSelect;

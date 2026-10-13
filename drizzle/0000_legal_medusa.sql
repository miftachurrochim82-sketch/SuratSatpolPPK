CREATE TABLE "app_settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"base64_data" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classifications" (
	"code" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispositions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"incoming_letter_id" varchar(32) NOT NULL,
	"letter_number" varchar(120) NOT NULL,
	"subject" text NOT NULL,
	"disposition_date" date NOT NULL,
	"due_date" date,
	"instruction" varchar(120) NOT NULL,
	"leader_note" text,
	"staff_id" varchar(32) NOT NULL,
	"staff_name" varchar(160) NOT NULL,
	"whatsapp" varchar(32),
	"whatsapp_status" varchar(32) DEFAULT 'Tidak Ada Nomor' NOT NULL,
	"whatsapp_message_id" varchar(160),
	"follow_up_status" varchar(24) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_letters" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"agenda_no" integer NOT NULL,
	"letter_number" varchar(120) NOT NULL,
	"letter_date" date NOT NULL,
	"received_date" date NOT NULL,
	"sender" varchar(200) NOT NULL,
	"subject" text NOT NULL,
	"classification_code" varchar(32) NOT NULL,
	"security_level" varchar(24) DEFAULT 'Biasa' NOT NULL,
	"attachment_id" integer,
	"disposition_status" varchar(20) DEFAULT 'Belum' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(120) DEFAULT 'Admin TU' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outgoing_letters" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"agenda_no" integer NOT NULL,
	"official_number" varchar(200) NOT NULL,
	"letter_date" date NOT NULL,
	"recipient" varchar(200) NOT NULL,
	"subject" text NOT NULL,
	"classification_code" varchar(32) NOT NULL,
	"signer" varchar(160) NOT NULL,
	"attachment_id" integer,
	"verification_code" varchar(32) NOT NULL,
	"archive_status" varchar(24) DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(120) DEFAULT 'Admin TU' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"employee_number" varchar(80),
	"name" varchar(160) NOT NULL,
	"position" varchar(160) NOT NULL,
	"whatsapp" varchar(32),
	"status" varchar(20) DEFAULT 'Aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_incoming_letter_id_incoming_letters_id_fk" FOREIGN KEY ("incoming_letter_id") REFERENCES "public"."incoming_letters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "outgoing_letters_official_number_unique" ON "outgoing_letters" USING btree ("official_number");--> statement-breakpoint
CREATE UNIQUE INDEX "outgoing_letters_verification_code_unique" ON "outgoing_letters" USING btree ("verification_code");
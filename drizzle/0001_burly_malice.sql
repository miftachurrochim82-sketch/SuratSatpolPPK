CREATE TABLE "sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"username" varchar(60) NOT NULL,
	"name" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(24) DEFAULT 'tu' NOT NULL,
	"staff_id" varchar(32),
	"status" varchar(20) DEFAULT 'Aktif' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");
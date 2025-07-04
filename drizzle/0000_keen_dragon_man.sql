CREATE TABLE "dice_bets" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"amount" real NOT NULL,
	"choice" text NOT NULL,
	"target" integer NOT NULL,
	"roll" integer NOT NULL,
	"payout" real NOT NULL,
	"win" boolean NOT NULL,
	"server_seed" text NOT NULL,
	"server_seed_hash" text NOT NULL,
	"client_seed" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dice_users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"balance" real DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dice_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "dice_bets" ADD CONSTRAINT "dice_bets_user_id_dice_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."dice_users"("id") ON DELETE no action ON UPDATE no action;
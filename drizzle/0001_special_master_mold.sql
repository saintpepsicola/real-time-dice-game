ALTER TABLE "dice_bets" DROP CONSTRAINT "dice_bets_user_id_dice_users_id_fk";
--> statement-breakpoint
ALTER TABLE "dice_bets" ADD CONSTRAINT "dice_bets_user_id_dice_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."dice_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dice_bets_user_id_idx" ON "dice_bets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dice_bets_created_at_idx" ON "dice_bets" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "dice_bets_win_status_idx" ON "dice_bets" USING btree ("win");--> statement-breakpoint
CREATE INDEX "dice_bets_amount_idx" ON "dice_bets" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "dice_users_username_idx" ON "dice_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "dice_users_created_at_idx" ON "dice_users" USING btree ("created_at" DESC NULLS LAST);
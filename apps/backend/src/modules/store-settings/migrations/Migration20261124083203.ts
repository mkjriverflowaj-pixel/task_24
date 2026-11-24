import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261124083203 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "store_settings" ("id" text not null, "default_min_order_qty" integer not null default 1, "price_visibility" text check ("price_visibility" in ('everyone', 'logged_in')) not null default 'everyone', "purchase_access" text check ("purchase_access" in ('logged_in', 'everyone')) not null default 'logged_in', "enquiry_email" text not null default 'enquiries@example.com', "shipping_mode" text check ("shipping_mode" in ('placeholder', 'shiprocket')) not null default 'placeholder', "tax_mode" text check ("tax_mode" in ('placeholder', 'gst')) not null default 'placeholder', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_settings_deleted_at" ON "store_settings" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_settings" cascade;`);
  }

}

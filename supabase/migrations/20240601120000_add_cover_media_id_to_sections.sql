alter table "public"."memory_sections" add column "cover_media_id" uuid;

alter table "public"."memory_sections" add constraint "memory_sections_cover_media_id_fkey" FOREIGN KEY (cover_media_id) REFERENCES memory_media(id) ON DELETE SET NULL;

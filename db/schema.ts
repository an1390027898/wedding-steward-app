import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const weddings = sqliteTable("weddings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groom: text("groom").notNull(),
  bride: text("bride").notNull(),
  weddingDate: text("wedding_date").notNull(),
  banquetTime: text("banquet_time").notNull().default("11:38"),
  status: text("status").notNull().default("筹备中"),
  phone: text("phone").notNull().default(""),
  hotel: text("hotel").notNull().default(""),
  groomAddress: text("groom_address").notNull().default(""),
  brideAddress: text("bride_address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  customs: text("customs").notNull().default("[]"),
  times: text("times").notNull().default("{}"),
  schedule: text("schedule").notNull().default("[]"),
  contacts: text("contacts").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

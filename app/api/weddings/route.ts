import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { weddings } from "../../../db/schema";

const clean = (v: unknown) => typeof v === "string" ? v.trim() : "";
const json = (v: unknown) => JSON.stringify(Array.isArray(v) ? v : []);

export async function GET() {
  try {
    const rows = await getDb().select().from(weddings).orderBy(desc(weddings.weddingDate));
    return Response.json({ weddings: rows.map((row) => ({
      ...row,
      customs: JSON.parse(row.customs),
      schedule: JSON.parse(row.schedule),
      contacts: JSON.parse(row.contacts),
    })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!clean(body.groom) || !clean(body.bride) || !clean(body.weddingDate)) {
      return Response.json({ error: "请填写新人姓名和婚期" }, { status: 400 });
    }
    const now = new Date();
    const [row] = await getDb().insert(weddings).values({
      groom: clean(body.groom), bride: clean(body.bride), weddingDate: clean(body.weddingDate),
      banquetTime: clean(body.banquetTime) || "11:38", status: clean(body.status) || "筹备中",
      phone: clean(body.phone), hotel: clean(body.hotel), groomAddress: clean(body.groomAddress),
      brideAddress: clean(body.brideAddress), notes: clean(body.notes), customs: json(body.customs),
      schedule: json(body.schedule), contacts: json(body.contacts), createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ wedding: row }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    if (!id) return Response.json({ error: "缺少客户编号" }, { status: 400 });
    const [row] = await getDb().update(weddings).set({
      groom: clean(body.groom), bride: clean(body.bride), weddingDate: clean(body.weddingDate),
      banquetTime: clean(body.banquetTime) || "11:38", status: clean(body.status) || "筹备中",
      phone: clean(body.phone), hotel: clean(body.hotel), groomAddress: clean(body.groomAddress),
      brideAddress: clean(body.brideAddress), notes: clean(body.notes), customs: json(body.customs),
      schedule: json(body.schedule), contacts: json(body.contacts), updatedAt: new Date(),
    }).where(eq(weddings.id, id)).returning();
    return Response.json({ wedding: row });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "缺少客户编号" }, { status: 400 });
  await getDb().delete(weddings).where(eq(weddings.id, id));
  return Response.json({ ok: true });
}

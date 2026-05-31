import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Simple DB ping to check connection
    await db.execute(sql`SELECT 1`);
    
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "Database connection failed" 
    }, { status: 503 });
  }
}

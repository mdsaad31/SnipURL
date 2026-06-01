import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    associatedApplications: [
      {
        applicationId: "1aaf7e44-3c88-4954-be8c-c7a2437c63d0"
      }
    ]
  });
}

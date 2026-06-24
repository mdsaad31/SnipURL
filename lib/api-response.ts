import { NextResponse } from "next/server";

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
  headers?: Record<string, string>
): NextResponse<SuccessResponse<T>> {
  const body: SuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status, headers });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  headers?: Record<string, string>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details !== undefined && { details }) } },
    { status, headers }
  );
}

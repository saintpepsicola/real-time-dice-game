import { NextResponse } from "next/server"

export class ApiError extends Error {
  status: number
  data?: Record<string, any>

  constructor(
    message: string,
    status: number = 500,
    data?: Record<string, any>
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }

  static fromResponse = async (response: Response): Promise<ApiError> => {
    try {
      const errorData = await response.json()
      return new ApiError(
        errorData.error || response.statusText,
        response.status,
        errorData
      )
    } catch {
      return new ApiError(response.statusText, response.status)
    }
  }
}

export const handleApiError = (error: unknown): NextResponse => {
  if (error instanceof ApiError) {
    const responseBody = {
      error: error.message,
      ...(error.data && { data: error.data }),
    }
    return NextResponse.json(responseBody, { status: error.status })
  }

  const message =
    error instanceof Error
      ? error.message
      : "An unknown internal error occurred."
  return NextResponse.json({ error: message }, { status: 500 })
}

type ApiHandler = (req: Request) => Promise<NextResponse | Response>;

export const withApiErrorHandling = (handler: ApiHandler) => {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
};
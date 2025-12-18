const SAFE_ERROR_MESSAGES = new Set([
  "Lottery not found",
  "Lottery is not active",
  "Lottery has ended",
  "You cannot enter your own lottery",
  "Insufficient points",
  "You must add a shipping address before entering lotteries",
  "You have already entered this lottery. Use boost to add more points.",
  "You have not entered this lottery yet",
  "Only the lottery creator can draw a winner",
  "Only the lottery creator can cancel",
  "Cannot cancel a completed lottery",
  "Cannot cancel an already cancelled lottery",
  "Lottery already has a winner",
  "No entries in this lottery",

  "Address not found",
  "Address does not belong to you",

  "Invalid credentials",
  "Email already registered",
  "User not found",

  "Validation failed",
  "Unauthorized",
  "Not found",
]);

const SAFE_PATTERNS = [
  /^Minimum entry is \d+ points$/,
  /^Maximum \d+ participants reached$/,
];

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (SAFE_ERROR_MESSAGES.has(message)) {
      return message;
    }

    for (const pattern of SAFE_PATTERNS) {
      if (pattern.test(message)) {
        return message;
      }
    }
  }

  return "Operation failed";
}

export function createErrorResponse(error: unknown, status: number = 500) {
  const message = getSafeErrorMessage(error);
  console.error("API Error:", error);
  return Response.json({ error: message }, { status });
}
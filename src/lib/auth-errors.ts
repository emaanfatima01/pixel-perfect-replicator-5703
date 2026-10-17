/** Turns raw sign-in / sign-up errors into plain-English messages. */
export function friendly(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Incorrect email or password. If you forgot your password, use \"Forgot password?\" to set a new one.";
  if (m.includes("not confirmed")) return "Your email isn't confirmed yet. Open the link we emailed you, or resend it below.";
  if (m.includes("already registered") || m.includes("already exists")) return "An account with this email already exists. Sign in instead, or use \"Forgot password?\".";
  if (m.includes("known to be weak") || m.includes("pwned") || m.includes("weak password")) return "This password has appeared in public data leaks. Please choose a stronger, unique password.";
  if (m.includes("email address is not allowed") || m.includes("invalid format") || m.includes("is invalid")) return "This email address can't receive mail. Please use your real email address.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Can't reach the server. Check your internet connection and try again.";
  return msg;
}

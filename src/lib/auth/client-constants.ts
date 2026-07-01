export const CLIENT_SESSION_COOKIE = "ois_client_session";
export const CLIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const CLIENT_LOGIN_CHALLENGE_COOKIE = "ois_client_login_challenge";
export const CLIENT_LOGIN_CHALLENGE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export const CLIENT_VISIBLE_INVOICE_STATUSES = ["SENT", "PAID", "OVERDUE"] as const;

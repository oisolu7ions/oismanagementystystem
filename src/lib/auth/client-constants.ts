export const CLIENT_SESSION_COOKIE = "ois_client_session";
export const CLIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Client portal session ends after this many seconds without server-tracked activity. */
export const CLIENT_SESSION_IDLE_TIMEOUT_SECONDS = 60 * 5;

/** Throttle how often lastSeenAt is written while the client user is active. */
export const CLIENT_SESSION_LAST_SEEN_UPDATE_SECONDS = 30;

export const CLIENT_LOGIN_CHALLENGE_COOKIE = "ois_client_login_challenge";
export const CLIENT_LOGIN_CHALLENGE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export const CLIENT_VISIBLE_INVOICE_STATUSES = ["SENT", "PAID", "OVERDUE"] as const;

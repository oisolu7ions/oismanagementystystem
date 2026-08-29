export const SESSION_COOKIE = "ois_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Admin session ends after this many seconds without server-tracked activity. */
export const ADMIN_SESSION_IDLE_TIMEOUT_SECONDS = 60 * 5;

/** Throttle how often lastSeenAt is written while the admin is active. */
export const ADMIN_SESSION_LAST_SEEN_UPDATE_SECONDS = 30;

export const ADMIN_MFA_CHALLENGE_COOKIE = "ois_admin_mfa_challenge";
export const ADMIN_MFA_CHALLENGE_MAX_AGE_SECONDS = 60 * 5;

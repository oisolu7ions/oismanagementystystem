const STORAGE_KEY = "ois.inAppNavStack";

function readStack(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
}

export function pushInAppHistory(href: string) {
  const stack = readStack();
  if (stack[stack.length - 1] === href) return;

  stack.push(href);
  if (stack.length > 100) {
    stack.shift();
  }

  writeStack(stack);
}

export function syncInAppHistoryOnPop() {
  const stack = readStack();
  if (stack.length <= 1) return;

  stack.pop();
  writeStack(stack);
}

export function getInAppHistoryDepth(): number {
  return readStack().length;
}

export function getPreviousInAppHref(): string | null {
  const stack = readStack();
  if (stack.length <= 1) return null;
  return stack[stack.length - 2] ?? null;
}

export function canNavigateBackInApp(): boolean {
  if (typeof window === "undefined") return false;
  if (getInAppHistoryDepth() > 1) return true;
  return window.history.length > 1;
}

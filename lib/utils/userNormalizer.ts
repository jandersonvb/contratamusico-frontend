import type { User } from "@/lib/types/user";

type UnknownRecord = Record<string, unknown>;

const USER_LIKE_KEYS = new Set([
  "id",
  "email",
  "firstName",
  "lastName",
  "userType",
  "role",
  "phone",
  "city",
  "state",
  "profileImageUrl",
  "profileImageKey",
  "musicianProfile",
]);

const USER_OUTPUT_KEYS: Array<keyof User> = [
  "id",
  "email",
  "firstName",
  "lastName",
  "userType",
  "role",
  "phone",
  "city",
  "state",
  "profileImageUrl",
  "profileImageKey",
  "musicianProfile",
  "createdAt",
  "updatedAt",
];

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isUserLike(record: UnknownRecord): boolean {
  for (const key of USER_LIKE_KEYS) {
    if (key in record) return true;
  }

  return false;
}

function extractUserCandidate(payload: unknown): UnknownRecord | null {
  const raw = asRecord(payload);
  if (!raw) return null;

  const directUser = asRecord(raw.user);
  if (directUser) return directUser;

  const data = asRecord(raw.data);
  if (data) {
    const nestedUser = asRecord(data.user);
    if (nestedUser) return nestedUser;

    if (isUserLike(data)) {
      return data;
    }
  }

  if (isUserLike(raw) || "url" in raw || "avatarUrl" in raw || "imageUrl" in raw) {
    return raw;
  }

  return null;
}

function normalizeUserImageFields<T extends UnknownRecord>(
  data: T
): T & { profileImageUrl?: string; profileImageKey?: string } {
  const normalizedImage =
    toNonEmptyString(data.profileImageUrl) ||
    toNonEmptyString(data.profileImageKey) ||
    toNonEmptyString(data.avatarUrl) ||
    toNonEmptyString(data.imageUrl) ||
    toNonEmptyString(data.url);

  if (!normalizedImage) {
    return data as T & { profileImageUrl?: string; profileImageKey?: string };
  }

  return {
    ...data,
    profileImageUrl: normalizedImage,
    profileImageKey: normalizedImage,
  };
}

function pickKnownUserFields(
  data: UnknownRecord
): Partial<User> {
  const picked: Partial<User> = {};

  for (const key of USER_OUTPUT_KEYS) {
    if (key in data) {
      (picked as UnknownRecord)[key] = data[key];
    }
  }

  return picked;
}

export function normalizeUserPayload(payload: unknown): User {
  const candidate = extractUserCandidate(payload);
  if (!candidate) {
    return (asRecord(payload) ?? {}) as unknown as User;
  }

  return pickKnownUserFields(normalizeUserImageFields(candidate)) as unknown as User;
}

export function normalizePartialUserPayload(payload: unknown): Partial<User> {
  const candidate = extractUserCandidate(payload);
  if (!candidate) {
    return (asRecord(payload) ?? {}) as Partial<User>;
  }

  return pickKnownUserFields(normalizeUserImageFields(candidate));
}

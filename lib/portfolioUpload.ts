export type PortfolioUploadKind = "IMAGE" | "VIDEO" | "AUDIO";

type PortfolioUploadRule = {
  kind: PortfolioUploadKind;
  mimeType: string;
  extensions: string[];
  maxSize: number;
};

const MB = 1024 * 1024;

const PORTFOLIO_UPLOAD_RULES: PortfolioUploadRule[] = [
  {
    kind: "IMAGE",
    mimeType: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    maxSize: 5 * MB,
  },
  {
    kind: "IMAGE",
    mimeType: "image/png",
    extensions: [".png"],
    maxSize: 5 * MB,
  },
  {
    kind: "IMAGE",
    mimeType: "image/webp",
    extensions: [".webp"],
    maxSize: 5 * MB,
  },
  {
    kind: "VIDEO",
    mimeType: "video/mp4",
    extensions: [".mp4"],
    maxSize: 50 * MB,
  },
  {
    kind: "VIDEO",
    mimeType: "video/webm",
    extensions: [".webm"],
    maxSize: 50 * MB,
  },
  {
    kind: "VIDEO",
    mimeType: "video/quicktime",
    extensions: [".mov"],
    maxSize: 50 * MB,
  },
  {
    kind: "AUDIO",
    mimeType: "audio/mpeg",
    extensions: [".mp3"],
    maxSize: 10 * MB,
  },
  {
    kind: "AUDIO",
    mimeType: "audio/wav",
    extensions: [".wav"],
    maxSize: 10 * MB,
  },
  {
    kind: "AUDIO",
    mimeType: "audio/ogg",
    extensions: [".ogg"],
    maxSize: 10 * MB,
  },
];

const MIME_TYPE_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "audio/mp3": "audio/mpeg",
  "audio/x-mpeg": "audio/mpeg",
  "audio/x-wav": "audio/wav",
  "audio/wave": "audio/wav",
  "video/x-m4v": "video/mp4",
};

const EXTENSION_TO_RULE = new Map<string, PortfolioUploadRule>();
const MIME_TYPE_TO_RULE = new Map<string, PortfolioUploadRule>();

for (const rule of PORTFOLIO_UPLOAD_RULES) {
  MIME_TYPE_TO_RULE.set(rule.mimeType, rule);

  for (const extension of rule.extensions) {
    EXTENSION_TO_RULE.set(extension, rule);
  }
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

export function resolvePortfolioUploadRule(file: Pick<File, "name" | "type">) {
  const normalizedMimeType = MIME_TYPE_ALIASES[file.type.toLowerCase()] || file.type.toLowerCase();

  if (normalizedMimeType) {
    const byMimeType = MIME_TYPE_TO_RULE.get(normalizedMimeType);

    if (byMimeType) {
      return byMimeType;
    }
  }

  const extension = getFileExtension(file.name);

  if (!extension) {
    return null;
  }

  return EXTENSION_TO_RULE.get(extension) || null;
}

export function normalizePortfolioUploadFile(file: File) {
  const rule = resolvePortfolioUploadRule(file);

  if (!rule) {
    return null;
  }

  if (file.type === rule.mimeType) {
    return {
      file,
      rule,
    };
  }

  return {
    file: new File([file], file.name, {
      type: rule.mimeType,
      lastModified: file.lastModified,
    }),
    rule,
  };
}

export const PORTFOLIO_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
export const PORTFOLIO_MEDIA_ACCEPT = ".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg";

import { useState } from "react";

export type AvatarMood = "champion" | "happy" | "serious" | "sad";

interface PlayerAvatarProps {
  name: string;
  photoUrl: string;
  className?: string;
  mood?: AvatarMood;
}

const moodConfig: Record<
  AvatarMood,
  {
    eyes: string;
    mouth: string;
    animation: string;
  }
> = {
  champion: {
    eyes: "variant01",
    mouth: "variant02",
    animation: "fastest",
  },

  happy: {
    eyes: "variant02",
    mouth: "variant01",
    animation: "fast",
  },

  serious: {
    eyes: "variant08",
    mouth: "variant04",
    animation: "slow",
  },

  sad: {
    eyes: "variant04",
    mouth: "variant05",
    animation: "slowest",
  },
};

function buildAvatarUrl(photoUrl: string, mood: AvatarMood): string {
  if (!photoUrl) {
    return photoUrl;
  }

  try {
    const url = new URL(photoUrl);

    if (
      url.hostname !== "api.dicebear.com" ||
      !url.pathname.includes("/thumbs/")
    ) {
      return photoUrl;
    }

    url.pathname = url.pathname.replace(/^\/\d+\.x\//, "/10.x/");

    const config = moodConfig[mood];

    url.searchParams.set("eyesVariant", config.eyes);
    url.searchParams.set("mouthVariant", config.mouth);
    url.searchParams.set("animationVariant", config.animation);

    return url.toString();
  } catch {
    return photoUrl;
  }
}

export function PlayerAvatar({
  name,
  photoUrl,
  className = "",
  mood = "serious",
}: PlayerAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = buildAvatarUrl(photoUrl, mood);

  const failed = failedUrl === avatarUrl;

  return (
    <span className={`player-avatar avatar-${mood} ${className}`}>
      {failed || !avatarUrl ? (
        <span aria-label={`Foto de ${name}`}>{initials}</span>
      ) : (
        <img
          src={avatarUrl}
          alt={`Foto de ${name}`}
          onError={() => setFailedUrl(avatarUrl)}
        />
      )}
    </span>
  );
}

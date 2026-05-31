"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  pauseBotAction,
  startBotAction,
  stopBotAction,
} from "@/lib/bots/actions";
import type { BotStatus } from "@/lib/bots/types";
import {
  privateActionLinkClass,
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";

type Props = {
  botId: string;
  status: BotStatus;
  compact?: boolean;
};

export function BotRowActions({ botId, status, compact = false }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showStart = status === "draft" || status === "paused";
  const showPause = status === "active";
  const showStop = status === "active" || status === "paused";

  async function run(action: "start" | "pause" | "stop") {
    setError(null);
    setPending(action);
    try {
      const result =
        action === "start"
          ? await startBotAction(botId)
          : action === "pause"
            ? await pauseBotAction(botId)
            : await stopBotAction(botId);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Action failed");
    } finally {
      setPending(null);
    }
  }

  const btnClass = compact ? "text-[9px] tracking-[0.16em] px-3 h-8" : "";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/bots/${botId}`} className={privateActionLinkClass}>
          View
        </Link>
        <Link href={`/bots/${botId}/edit`} className={privateActionLinkClass}>
          Edit
        </Link>
        <Link href={`/bots/${botId}/copy`} className={privateActionLinkClass}>
          Copy
        </Link>
        {showStart ? (
          <button
            type="button"
            disabled={pending != null}
            onClick={() => run("start")}
            className={`${privatePrimaryButtonClass} ${btnClass}`}
          >
            {pending === "start" ? "…" : "Start"}
          </button>
        ) : null}
        {showPause ? (
          <button
            type="button"
            disabled={pending != null}
            onClick={() => run("pause")}
            className={`${privateSecondaryButtonClass} ${btnClass}`}
          >
            {pending === "pause" ? "…" : "Pause"}
          </button>
        ) : null}
        {showStop ? (
          <button
            type="button"
            disabled={pending != null}
            onClick={() => run("stop")}
            className={`${privateSecondaryButtonClass} ${btnClass}`}
          >
            {pending === "stop" ? "…" : "Stop"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-[11px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  pauseBotAction,
  startBotAction,
  stopBotAction,
} from "@/lib/bots/actions";
import type { BotStatus } from "@/lib/bots/types";
import { privatePrimaryButtonClass, privateSecondaryButtonClass } from "@/components/private/styles";

type Props = {
  botId: string;
  status: BotStatus;
};

export function BotLifecycleControls({ botId, status }: Props) {
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
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  }

  if (status === "stopped") {
    return (
      <p className="mt-6 text-[13px] leading-relaxed text-white/38">
        This bot is stopped and cannot be restarted.
      </p>
    );
  }

  if (!showStart && !showPause && !showStop) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {showStart ? (
        <button
          type="button"
          disabled={pending != null}
          onClick={() => run("start")}
          className={privatePrimaryButtonClass}
        >
          {pending === "start" ? "Starting…" : "Start Bot"}
        </button>
      ) : null}
      {showPause ? (
        <button
          type="button"
          disabled={pending != null}
          onClick={() => run("pause")}
          className={privateSecondaryButtonClass}
        >
          {pending === "pause" ? "Pausing…" : "Pause Bot"}
        </button>
      ) : null}
      {showStop ? (
        <button
          type="button"
          disabled={pending != null}
          onClick={() => run("stop")}
          className={privateSecondaryButtonClass}
        >
          {pending === "stop" ? "Stopping…" : "Stop Bot"}
        </button>
      ) : null}
      {error ? (
        <p className="w-full text-[13px] leading-6 text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

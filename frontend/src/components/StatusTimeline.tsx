import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderEvent, PipelineStage } from "@/lib/types";

export default function StatusTimeline({
  pipeline,
  events,
  currentStatus,
}: {
  pipeline: PipelineStage[];
  events: OrderEvent[];
  currentStatus: string;
}) {
  const currentIdx = pipeline.findIndex((s) => s.status === currentStatus);
  const eventByStatus = Object.fromEntries(events.map((e) => [e.status, e]));
  const delivered = currentStatus === "delivered";

  return (
    <ol className="space-y-0">
      {pipeline.map((stage, idx) => {
        const event = eventByStatus[stage.status];
        const isDone = idx < currentIdx || (delivered && idx === currentIdx);
        const isCurrent = idx === currentIdx && !delivered;
        const isLast = idx === pipeline.length - 1;

        return (
          <li key={stage.status} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute top-7 left-[13px] h-full w-0.5",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                isDone && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-background text-primary",
                !isDone && !isCurrent && "border-border bg-muted text-muted-foreground"
              )}
            >
              {isDone || isCurrent ? (
                <Check className="size-4" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  "leading-none font-medium",
                  !isDone && !isCurrent && "text-muted-foreground"
                )}
              >
                {stage.label}
              </p>
              {event ? (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Upcoming</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

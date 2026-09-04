"use client";

import { useActionState } from "react";
import {
  addApplicationNoteAction,
  moveApplicationStageAction,
} from "@/lib/actions/pipeline";
import { formatStage } from "@/lib/format";
import { APPLICATION_STAGES, type ApplicationStage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import { Textarea } from "@/components/ui/textarea";

export type PipelineCard = {
  id: string;
  stage: ApplicationStage;
  coverLetter: string | null;
  createdAt: Date;
  candidateName: string;
  candidateHeadline: string | null;
  notes: { id: string; body: string; author: string; createdAt: Date }[];
};

export function KanbanBoard({
  cards,
  canMove,
}: {
  cards: PipelineCard[];
  canMove: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {APPLICATION_STAGES.map((stage) => (
        <section
          key={stage}
          className="w-72 shrink-0 border border-line bg-fog/60 p-3"
        >
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            {formatStage(stage).toUpperCase()} ·{" "}
            {cards.filter((card) => card.stage === stage).length}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {cards
              .filter((card) => card.stage === stage)
              .map((card) => (
                <article key={card.id} className="border border-line bg-paper p-3">
                  <p className="font-heading text-base">{card.candidateName}</p>
                  {card.candidateHeadline ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {card.candidateHeadline}
                    </p>
                  ) : null}
                  {card.coverLetter ? (
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-ink/90">
                      {card.coverLetter}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No cover note.</p>
                  )}
                  {canMove ? <StageForm key={`${card.id}-${card.stage}`} card={card} /> : null}
                  <details className="mt-3">
                    <summary className="cursor-pointer font-mono text-[10px] tracking-wider text-muted-foreground">
                      NOTES ({card.notes.length})
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {card.notes.map((note) => (
                        <li key={note.id} className="text-xs">
                          <p className="text-muted-foreground">{note.author}</p>
                          <p className="whitespace-pre-wrap">{note.body}</p>
                        </li>
                      ))}
                    </ul>
                    {canMove ? <NoteForm applicationId={card.id} /> : null}
                  </details>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StageForm({ card }: { card: PipelineCard }) {
  const [state, formAction, pending] = useActionState(
    moveApplicationStageAction,
    null,
  );

  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <RefreshOnSuccess state={state} />
      <input type="hidden" name="applicationId" value={card.id} />
      <select
        name="stage"
        defaultValue={card.stage}
        className="h-7 flex-1 rounded-lg border border-input bg-transparent px-2 text-xs"
      >
        {APPLICATION_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {formatStage(stage)}
          </option>
        ))}
      </select>
      <Button type="submit" size="xs" disabled={pending}>
        Move
      </Button>
      {state && "error" in state ? (
        <p className="sr-only">{state.error}</p>
      ) : null}
    </form>
  );
}

function NoteForm({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(
    addApplicationNoteAction,
    null,
  );

  return (
    <form action={formAction} className="mt-3 grid gap-2">
      <RefreshOnSuccess state={state} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <Textarea name="body" rows={3} placeholder="Private hiring note" />
      {state && "error" in state ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}
"use client";

import Link from "next/link";
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
  resumeUrl: string | null;
  createdAt: Date;
  candidateName: string;
  candidateHeadline: string | null;
  candidateId: string;
  conversationId: string | null;
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
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {card.resumeUrl ? (
                      <a
                        href={card.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Resume
                      </a>
                    ) : null}
                    <Link
                      href={`/people/${card.candidateId}`}
                      className="text-primary hover:underline"
                    >
                      Profile
                    </Link>
                    {card.conversationId ? (
                      <Link
                        href={`/messages/${card.conversationId}`}
                        className="text-primary hover:underline"
                      >
                        Message
                      </Link>
                    ) : null}
                  </div>
                  {canMove ? <StageForm key={`${card.id}-${card.stage}`} card={card} /> : null}
                  <details className="mt-3">
                    <summary className="cursor-pointer font-mono text-[10px] tracking-wider text-muted-foreground">
                      PRIVATE NOTES ({card.notes.length})
                    </summary>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Visible to your hiring team only.
                    </p>
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
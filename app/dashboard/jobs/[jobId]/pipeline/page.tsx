import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { KanbanBoard, type PipelineCard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { requireEmployerCompany } from "@/lib/dashboard";
import { canManageApplications } from "@/lib/permissions";
import { getJobById, listJobPipeline } from "@/lib/queries";

type Params = { jobId: string };

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

export default async function JobPipelinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { jobId } = await params;
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }

  const job = await getJobById(jobId);
  if (!job || job.companyId !== company.id) {
    notFound();
  }

  const rows = await listJobPipeline(job.id);
  const cards: PipelineCard[] = rows.map((row) => ({
    id: row.application.id,
    stage: row.application.stage,
    coverLetter: row.application.coverLetter,
    createdAt: row.application.createdAt,
    candidateName: row.candidate.fullName ?? "Candidate",
    candidateHeadline: row.candidate.headline,
    notes: row.notes.map((item) => ({
      id: item.note.id,
      body: item.note.body,
      author: item.author.fullName ?? "Teammate",
      createdAt: item.note.createdAt,
    })),
  }));

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        PIPELINE
      </p>
      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">{job.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Move people through the stages. Cover notes and private hiring notes
            live on each card.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/jobs/${job.id}`}>Edit job</Link>
        </Button>
      </div>
      <KanbanBoard cards={cards} canMove={canManageApplications(access)} />
    </div>
  );
}

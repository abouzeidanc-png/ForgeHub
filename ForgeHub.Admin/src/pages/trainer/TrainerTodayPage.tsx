import { Activity, FileText, ListChecks, Users } from "lucide-react";
import { useState } from "react";
import { dashboardApi } from "../../api/dashboardApi";
import { trainerSessionsApi } from "../../api/trainerSessionsApi";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import type { GymClass } from "../../types/class";
import { timeLabel } from "../../utils/formatters";
import { TrainerClassAttendanceModal } from "./TrainerClassAttendanceModal";
import { ActionLink, ContactActions, MemberMiniCard, TimelineCard, TrainerHeader, TrainerShell } from "./TrainerComponents";
import { buildTrainerTimeline, isSameDay, isTomorrow, latestNoteForMember, membershipWarning, remainingSessions, sessionStatus } from "./trainerExperience";
import type { TrainerTimelineItem } from "./trainerExperience";

export function TrainerTodayPage() {
  const workspace = useApi(dashboardApi.getWorkspace, []);
  const sessions = useApi(() => trainerSessionsApi.getTrainerSessions(), []);
  const [savingId, setSavingId] = useState("");
  const [attendanceClass, setAttendanceClass] = useState<GymClass | null>(null);

  async function updateSession(item: TrainerTimelineItem, sessionType: string, note: string) {
    if (!item.session) return;
    setSavingId(item.id);
    try {
      await trainerSessionsApi.updateTrainerSession(item.sourceId, {
        ...item.session,
        sessionType,
        notes: [item.session.notes, note].filter(Boolean).join("\n")
      });
      await sessions.refresh();
    } finally {
      setSavingId("");
    }
  }

  if (workspace.loading || sessions.loading) return <LoadingState label="Loading trainer day..." />;
  if (workspace.error) return <ErrorState message={workspace.error} />;
  if (sessions.error) return <ErrorState message={sessions.error} />;

  const timeline = buildTrainerTimeline(workspace.data, sessions.data ?? []);
  const todayItems = timeline.filter((item) => isSameDay(item.startsAt));
  const nextItem = todayItems.find((item) => item.status === "ongoing") ?? todayItems.find((item) => item.status === "upcoming") ?? null;
  const completed = todayItems.filter((item) => item.status === "completed");
  const noShows = todayItems.filter((item) => item.status === "no-show");
  const missingNotes = todayItems.filter((item) => item.kind === "session" && sessionStatus(item.session!) === "completed" && !item.notes);
  const tomorrowFirst = timeline.find((item) => isTomorrow(item.startsAt));
  const members = (workspace.data?.members ?? []).slice(0, 6);

  return (
    <TrainerShell>
      <TrainerHeader title="Today" subtitle="Your next action, live schedule, and member context in one place." />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <Card className="border-forge-primary/30 bg-orange-50/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-forge-muted">Next up</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{nextItem?.title ?? "No upcoming work"}</h2>
                <p className="mt-1 text-sm text-slate-700">
                  {nextItem ? `${timeLabel(nextItem.startsAt)} · ${nextItem.subtitle} · ${nextItem.location}` : "Your schedule is clear for now."}
                </p>
              </div>
              {nextItem ? <Badge tone="info">{nextItem.kind}</Badge> : null}
            </div>
            {nextItem ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {nextItem.kind === "session" ? <Button disabled={savingId === nextItem.id} onClick={() => updateSession(nextItem, "Started", "Session started from Today.")}>Start session</Button> : <ActionLink to="/trainer/schedule" primary>View class</ActionLink>}
                <ActionLink to={nextItem.member ? `/trainer/member/${nextItem.member.id}` : "/trainer/schedule"}>View details</ActionLink>
                <div className="sm:col-span-2">
                  <ContactActions phone={nextItem.member?.phone} />
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Today timeline</h2>
              <Badge tone="neutral">{todayItems.length} items</Badge>
            </div>
            <div className="space-y-3">
              {todayItems.length ? todayItems.map((item) => (
                <TimelineCard
                  key={item.id}
                  item={item}
                  compact
                  onStart={(target) => updateSession(target, "Started", "Session started.")}
                  onComplete={(target) => updateSession(target, "Completed", "Session marked complete.")}
                  onNoShow={(target) => updateSession(target, "No-show", "Member reported as no-show.")}
                  onAttendance={(target) => setAttendanceClass(target.gymClass ?? null)}
                />
              )) : <EmptyState title="No sessions or classes today." message="Use quick note if you need to document member work outside the schedule." />}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-lg font-black text-slate-950">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <ActionLink to="/trainer/notes/new" primary><FileText size={16} /> Add note</ActionLink>
              <ActionLink to="/trainer/schedule"><ListChecks size={16} /> Mark complete</ActionLink>
              <ActionLink to="/trainer/schedule"><Users size={16} /> Record attendance</ActionLink>
              <ActionLink to="/trainer/members"><Activity size={16} /> View member</ActionLink>
              <ActionLink to="/trainer/schedule"><ListChecks size={16} /> Report no-show</ActionLink>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Member context</h2>
              <ActionLink to="/trainer/members">All</ActionLink>
            </div>
            <div className="space-y-3">
              {members.length ? members.map((member) => (
                <MemberMiniCard
                  key={member.id}
                  member={member}
                  note={latestNoteForMember(member.id, sessions.data ?? [])}
                  warning={membershipWarning(member)}
                  remaining={remainingSessions(member.id, sessions.data ?? [])}
                />
              )) : <EmptyState title="No assigned members." />}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-black text-slate-950">End-of-day</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-black">{completed.length}</p><p className="text-xs text-forge-muted">Done</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-black">{noShows.length}</p><p className="text-xs text-forge-muted">No-show</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-black">{missingNotes.length}</p><p className="text-xs text-forge-muted">Notes due</p></div>
            </div>
            <p className="mt-4 text-sm text-forge-muted">Tomorrow first: {tomorrowFirst ? `${timeLabel(tomorrowFirst.startsAt)} · ${tomorrowFirst.title}` : "Not scheduled"}</p>
          </Card>
        </aside>
      </div>
      {attendanceClass ? <TrainerClassAttendanceModal gymClass={attendanceClass} onClose={() => setAttendanceClass(null)} /> : null}
    </TrainerShell>
  );
}

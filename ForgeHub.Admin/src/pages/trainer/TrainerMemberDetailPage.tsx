import { Link, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";
import { dashboardApi } from "../../api/dashboardApi";
import { trainerSessionsApi } from "../../api/trainerSessionsApi";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { dateLabel, timeLabel } from "../../utils/formatters";
import { ActionLink, TrainerHeader, TrainerShell } from "./TrainerComponents";
import { memberName, membershipWarning, parseDate, sessionStatus } from "./trainerExperience";

export function TrainerMemberDetailPage() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const id = Number(pathParts[pathParts.length - 1]);
  const workspace = useApi(dashboardApi.getWorkspace, []);
  const sessions = useApi(() => trainerSessionsApi.getTrainerSessions({ memberId: id }), [id]);

  if (workspace.loading || sessions.loading) return <LoadingState label="Loading member context..." />;
  if (workspace.error) return <ErrorState message={workspace.error} />;
  if (sessions.error) return <ErrorState message={sessions.error} />;

  const member = workspace.data?.members.find((item) => item.id === id);
  if (!member) return <EmptyState title="Member not found." message="This member is not assigned to your trainer scope." />;

  const sortedSessions = [...(sessions.data ?? [])].sort((a, b) => String(b.sessionDate ?? "").localeCompare(String(a.sessionDate ?? "")));
  const nextSession = [...sortedSessions].reverse().find((session) => {
    const date = parseDate(session.sessionDate);
    return date && date >= new Date();
  });

  return (
    <TrainerShell>
      <TrainerHeader title={memberName(member)} subtitle="Member readiness, latest notes, and next session actions." />
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{memberName(member)}</h2>
                <p className="text-sm text-forge-muted">{member.email ?? "No email"}</p>
              </div>
              {membershipWarning(member) ? <Badge tone="warning">{membershipWarning(member)}</Badge> : <Badge tone="success">{member.status ?? "Active"}</Badge>}
            </div>
            <div className="mt-5 grid gap-2">
              {member.phone ? <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-forge-border bg-white px-3 text-sm font-semibold text-slate-800" href={`tel:${member.phone}`}><FileText size={16} /> Call</a> : null}
              {member.phone ? <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-forge-border bg-white px-3 text-sm font-semibold text-slate-800" href={`sms:${member.phone}`}><FileText size={16} /> Message</a> : null}
              {member.email ? <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-forge-border bg-white px-3 text-sm font-semibold text-slate-800" href={`mailto:${member.email}`}><FileText size={16} /> Email</a> : null}
              <ActionLink to={`/trainer/notes/new?memberId=${member.id}`} primary>Add note</ActionLink>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-black text-slate-950">Membership</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-forge-muted">Status</dt><dd className="font-bold">{member.status ?? "Unknown"}</dd></div>
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-forge-muted">Valid until</dt><dd className="font-bold">{dateLabel(member.membershipEndDate)}</dd></div>
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-forge-muted">Attendance</dt><dd className="font-bold">{member.attendanceToday ?? "No data"}</dd></div>
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-forge-muted">Payment</dt><dd className="font-bold">{member.paymentStatus ?? "No data"}</dd></div>
            </dl>
          </Card>
        </aside>

        <main className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Next session</h2>
              {nextSession ? <Badge tone="info">{timeLabel(nextSession.sessionDate)}</Badge> : null}
            </div>
            {nextSession ? (
              <div className="mt-4">
                <p className="font-bold text-slate-950">{nextSession.sessionType ?? "Personal training"}</p>
                <p className="text-sm text-forge-muted">{dateLabel(nextSession.sessionDate)} · {timeLabel(nextSession.sessionDate)}</p>
                <div className="mt-4"><ActionLink to={`/trainer/session/${nextSession.id}`} primary>Open session</ActionLink></div>
              </div>
            ) : <EmptyState title="No upcoming personal session." />}
          </Card>

          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-forge-muted">Session notes</h2>
            {sortedSessions.length ? sortedSessions.map((session) => (
              <Link key={session.id} to={`/trainer/session/${session.id}`} className="block rounded-2xl border border-forge-border bg-white p-4 shadow-panel transition hover:border-forge-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{session.sessionType ?? "Session"}</p>
                    <p className="text-sm text-forge-muted">{dateLabel(session.sessionDate)} · {timeLabel(session.sessionDate)}</p>
                  </div>
                  <Badge tone={sessionStatus(session) === "completed" ? "success" : "neutral"}>{sessionStatus(session)}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-700">{session.notes || "No note yet."}</p>
              </Link>
            )) : <EmptyState title="No session history yet." />}
          </section>
        </main>
      </div>
    </TrainerShell>
  );
}

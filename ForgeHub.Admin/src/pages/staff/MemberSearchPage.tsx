import { useEffect, useState } from "react";
import { membersApi } from "../../api/membersApi";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { Select } from "../../components/ui/Select";
import type { Member, StaffMemberDetails } from "../../types/member";
import { dateLabel, money } from "../../utils/formatters";

const pageSize = 10;

export function MemberSearchPage() {
  const [status, setStatus] = useState("");
  const [attendance, setAttendance] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Member[]; totalCount: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<StaffMemberDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    membersApi.searchStaffMembers({ page, pageSize, status, attendance, search: query })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load members.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attendance, page, query, status]);

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  async function openDetails(member: Member) {
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      setDetails(await membersApi.getStaffMemberDetails(Number(member.id)));
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : "Unable to load member details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const rows = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <PageHeader title="Member Search" description="Search and filter branch members from the backend." />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-slate-800">
            Status
            <Select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="FROZEN">Frozen</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-800">
            Attendance
            <Select value={attendance} onChange={(event) => updateFilter(setAttendance, event.target.value)}>
              <option value="">All</option>
              <option value="CurrentlyCheckedIn">Currently checked in</option>
              <option value="CheckedInToday">Checked in today</option>
              <option value="NotCheckedInToday">Not checked in today</option>
            </Select>
          </label>
        </div>
      </Card>
      <DataTable
        title="Member Search"
        rows={rows}
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "planId", label: "Plan" },
          { key: "status", label: "Status", badge: true },
          { key: "membershipEndDate", label: "Expiry", render: (row) => dateLabel(row.membershipEndDate) },
          { key: "paymentStatus", label: "Payment", badge: true },
          { key: "lastCheckIn", label: "Last check-in", render: (row) => dateLabel(row.lastCheckIn) }
        ]}
        searchValue={query}
        onSearchChange={(value) => updateFilter(setQuery, value)}
        actions={[{ label: "View Details", variant: "secondary", onClick: openDetails }]}
      />
      <PaginationControls page={page} totalPages={totalPages} totalCount={data?.totalCount ?? 0} pageSize={pageSize} onPageChange={setPage} />
      {detailsLoading ? <LoadingState /> : null}
      {detailsError ? <ErrorState message={detailsError} /> : null}
      {details ? (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Member details</h2>
            <Button type="button" variant="ghost" onClick={() => setDetails(null)}>Close</Button>
          </div>
          <div className="grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-3">
            <span>Name: {details.fullName || details.name || "No data"}</span>
            <span>Phone: {details.phone || "No data"}</span>
            <span>Email: {details.email || "No data"}</span>
            <span>Branch: {details.branchName || "Not assigned"}</span>
            <span>Plan: {details.planId || "Not assigned"}</span>
            <span>Status: {details.status || "No data"}</span>
            <span>Start: {dateLabel(details.membershipStartDate)}</span>
            <span>End: {dateLabel(details.membershipEndDate)}</span>
            <span>Total paid: {money(details.totalPaid ?? 0)}</span>
            <span>Last payment: {money(details.lastPaymentAmount ?? 0)}</span>
            <span>Last payment date: {dateLabel(details.lastPaymentAt)}</span>
            <span>Last check-in: {dateLabel(details.lastCheckIn)}</span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DataTable
              title="Recent Payments"
              rows={details.recentPayments ?? []}
              columns={[
                { key: "amount", label: "Amount", render: (row) => money(row.amountValue ?? row.amount ?? 0) },
                { key: "method", label: "Method" },
                { key: "paymentType", label: "Type" },
                { key: "paidAt", label: "Date", render: (row) => dateLabel(row.paidAt ?? row.at) }
              ]}
            />
            <DataTable
              title="Recent Check-ins"
              rows={details.recentCheckIns ?? []}
              columns={[
                { key: "status", label: "Status", badge: true },
                { key: "checkInTime", label: "In", render: (row) => dateLabel(row.checkInTime ?? row.at) },
                { key: "checkOutTime", label: "Out", render: (row) => dateLabel(row.checkOutTime) },
                { key: "source", label: "Source" }
              ]}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

import { membershipsApi } from "../../api/membershipsApi";
import { EntityPage } from "../shared/EntityPage";
import type { MemberMembership } from "../../types/membership";
export function RenewMembershipPage() { return <EntityPage<MemberMembership> title="Renew Membership" description="Membership renewal endpoint is represented by /membermemberships. Select a member from Member Search, then create a new membership record." loader={() => membershipsApi.getExpiringMemberships()} columns={[{ key: "memberId", label: "Member" }, { key: "planId", label: "Plan" }, { key: "endDate", label: "End date" }, { key: "status", label: "Status", badge: true }]} />; }

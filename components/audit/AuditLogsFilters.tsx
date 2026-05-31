"use client";

import { useRouter } from "next/navigation";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";
import { AUDIT_EVENT_TYPES, type AuditEventType } from "@/lib/audit/types";
import { auditEventLabel } from "@/lib/audit/labels";

type UserOption = { id: string; username: string };

type Props = {
  users: UserOption[];
  initial: {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    eventType?: AuditEventType;
  };
};

export function AuditLogsFilters({ users, initial }: Props) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const dateFrom = String(form.get("dateFrom") ?? "").trim();
    const dateTo = String(form.get("dateTo") ?? "").trim();
    const userId = String(form.get("userId") ?? "").trim();
    const eventType = String(form.get("eventType") ?? "").trim();

    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (userId) params.set("userId", userId);
    if (eventType) params.set("eventType", eventType);

    const qs = params.toString();
    router.push(qs ? `/admin/logs?${qs}` : "/admin/logs");
  }

  function clearFilters() {
    router.push("/admin/logs");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4 rounded-[20px] border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div>
        <label htmlFor="dateFrom" className={privateLabelClass}>
          From date
        </label>
        <input
          id="dateFrom"
          name="dateFrom"
          type="date"
          defaultValue={initial.dateFrom ?? ""}
          className={privateFieldClass}
        />
      </div>
      <div>
        <label htmlFor="dateTo" className={privateLabelClass}>
          To date
        </label>
        <input
          id="dateTo"
          name="dateTo"
          type="date"
          defaultValue={initial.dateTo ?? ""}
          className={privateFieldClass}
        />
      </div>
      <div>
        <label htmlFor="userId" className={privateLabelClass}>
          User
        </label>
        <select
          id="userId"
          name="userId"
          defaultValue={initial.userId ?? ""}
          className={privateFieldClass}
        >
          <option value="" className="bg-black text-white">
            All users
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-black text-white">
              {u.username}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="eventType" className={privateLabelClass}>
          Event type
        </label>
        <select
          id="eventType"
          name="eventType"
          defaultValue={initial.eventType ?? ""}
          className={privateFieldClass}
        >
          <option value="" className="bg-black text-white">
            All events
          </option>
          {AUDIT_EVENT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-black text-white">
              {auditEventLabel(type)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-1">
        <button type="submit" className={privatePrimaryButtonClass}>
          Apply
        </button>
        <button type="button" onClick={clearFilters} className={privateSecondaryButtonClass}>
          Clear
        </button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveCustomStrategyAction } from "@/lib/strategies/actions";
import {
  createEmptyRule,
  createEmptyRuleGroup,
} from "@/lib/strategies/defaults";
import { formatRuleSummary } from "@/lib/strategies/rule-summary";
import type { StrategyDefinition, StrategyRuleGroup } from "@/lib/strategies/types";
import { RuleCard } from "./RuleCard";
import {
  strategyCardClass,
  strategyFieldClass,
  strategyGhostButtonClass,
  strategyLabelClass,
  strategyMobileScrollPad,
  strategyPrimaryButtonClass,
  strategySecondaryButtonClass,
  strategyStickyBarClass,
} from "./styles";

type Props = {
  mode: "create" | "edit";
  strategyId?: string;
  initial: StrategyDefinition;
};

export function StrategyBuilder({ mode, strategyId, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [groupMatchMode, setGroupMatchMode] = useState(initial.groupMatchMode);
  const [ruleGroups, setRuleGroups] = useState<StrategyRuleGroup[]>(initial.ruleGroups);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateGroup(groupId: string, patch: Partial<StrategyRuleGroup>) {
    setRuleGroups((groups) =>
      groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    );
  }

  function addRule(groupId: string) {
    setRuleGroups((groups) =>
      groups.map((g) =>
        g.id === groupId ? { ...g, rules: [...g.rules, createEmptyRule()] } : g,
      ),
    );
  }

  function addGroup() {
    setRuleGroups((groups) => [...groups, createEmptyRuleGroup(groups.length + 1)]);
  }

  async function onSave() {
    setError(null);
    setPending(true);

    const definition: StrategyDefinition = {
      id: strategyId ?? "",
      name: name.trim(),
      description: description.trim() || undefined,
      version: 1,
      groupMatchMode,
      ruleGroups,
    };

    try {
      const result = await saveCustomStrategyAction({
        id: strategyId,
        name: definition.name,
        description: definition.description,
        definition,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/strategies/${result.id}`);
      router.refresh();
    } catch {
      setError("Could not save strategy. Check Supabase configuration.");
    } finally {
      setPending(false);
    }
  }

  const totalRules = ruleGroups.reduce((n, g) => n + g.rules.length, 0);

  return (
    <div className={strategyMobileScrollPad}>
      <div className="space-y-6">
        <div className={strategyCardClass}>
          <label htmlFor="strategy-name" className={strategyLabelClass}>
            Strategy name
          </label>
          <input
            id="strategy-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My momentum strategy"
            className={strategyFieldClass}
          />
          <label htmlFor="strategy-desc" className={`${strategyLabelClass} mt-4`}>
            Description (optional)
          </label>
          <textarea
            id="strategy-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What does this strategy look for?"
            className={`${strategyFieldClass} min-h-[96px] resize-none py-3`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={strategyLabelClass}>Groups match</span>
            {(["all", "any"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setGroupMatchMode(mode)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] ${
                  groupMatchMode === mode
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/10 text-white/42"
                }`}
              >
                {mode === "all" ? "All groups (AND)" : "Any group (OR)"}
              </button>
            ))}
          </div>
        </div>

        {ruleGroups.map((group, groupIndex) => (
          <section key={group.id} className="space-y-3">
            <div className={`${strategyCardClass} !p-0 overflow-hidden`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                onClick={() => updateGroup(group.id, { collapsed: !group.collapsed })}
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-white/32">
                    Group {groupIndex + 1} · {group.rules.length} rule
                    {group.rules.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 truncate text-[15px] font-medium text-white/88">{group.name}</p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                  {group.collapsed ? "Expand" : "Collapse"}
                </span>
              </button>

              {!group.collapsed ? (
                <div className="space-y-4 border-t border-white/8 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                  <div>
                    <label htmlFor={`group-name-${group.id}`} className={strategyLabelClass}>
                      Group name
                    </label>
                    <input
                      id={`group-name-${group.id}`}
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                      className={strategyFieldClass}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={strategyLabelClass}>Rules match</span>
                    {(["all", "any"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateGroup(group.id, { matchMode: m })}
                        className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] ${
                          group.matchMode === m
                            ? "border-white/20 bg-white/[0.08] text-white"
                            : "border-white/10 text-white/42"
                        }`}
                      >
                        {m === "all" ? "All (AND)" : "Any (OR)"}
                      </button>
                    ))}
                  </div>

                  {group.rules.map((rule, ruleIndex) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      index={ruleIndex}
                      canRemove={group.rules.length > 1}
                      onChange={(next) =>
                        updateGroup(group.id, {
                          rules: group.rules.map((r) => (r.id === rule.id ? next : r)),
                        })
                      }
                      onRemove={() =>
                        updateGroup(group.id, {
                          rules: group.rules.filter((r) => r.id !== rule.id),
                        })
                      }
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => addRule(group.id)}
                    className={strategyGhostButtonClass}
                  >
                    + Add rule to group
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/8 px-4 pb-4 pt-3 sm:px-5">
                  <ul className="space-y-2">
                    {group.rules.map((rule) => (
                      <li key={rule.id} className="text-[13px] leading-snug text-white/52">
                        {formatRuleSummary(rule)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}

        <button type="button" onClick={addGroup} className={strategyGhostButtonClass}>
          + Add rule group
        </button>

        {error ? (
          <p className="text-[13px] text-red-300/90" role="alert">
            {error}
          </p>
        ) : null}

        <p className="text-[12px] text-white/32">
          {totalRules} rule{totalRules === 1 ? "" : "s"} · Paper mode · No execution yet
        </p>
      </div>

      <div className={strategyStickyBarClass}>
        <div className="mx-auto flex max-w-3xl gap-3 lg:mt-10 lg:max-w-none">
          <button
            type="button"
            disabled={pending}
            onClick={onSave}
            className={strategyPrimaryButtonClass}
          >
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save strategy"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const activeGroup = ruleGroups[ruleGroups.length - 1];
              if (activeGroup) addRule(activeGroup.id);
              else addGroup();
            }}
            className={strategySecondaryButtonClass}
          >
            Add rule
          </button>
        </div>
      </div>
    </div>
  );
}

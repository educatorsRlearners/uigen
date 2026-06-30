"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

export function getToolLabel(toolName: string, args: Record<string, any>): string {
  const path: string | undefined = args?.path;

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create": return `Creating ${path ?? "file"}`;
      case "str_replace":
      case "insert": return `Editing ${path ?? "file"}`;
      case "view": return `Reading ${path ?? "file"}`;
      default: return path ? `Editing ${path}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename": return `Renaming ${path ?? "file"}`;
      case "delete": return `Deleting ${path ?? "file"}`;
      default: return path ? `Editing ${path}` : "Editing file";
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result";
  const label = getToolLabel(toolName, args ?? {});

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

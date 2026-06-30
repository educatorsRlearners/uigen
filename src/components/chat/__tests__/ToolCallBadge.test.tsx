import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getToolLabel

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" })).toBe("Editing /components/Card.jsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading /App.jsx");
});

test("getToolLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor missing path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" })).toBe("Renaming /old.jsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting /App.jsx");
});

test("getToolLabel: unknown tool returns tool name", () => {
  expect(getToolLabel("web_search", { query: "react hooks" })).toBe("web_search");
});

test("getToolLabel: empty args", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("Editing file");
});

// ToolCallBadge component

function makeInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    state: "result",
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: "File created",
    ...overrides,
  } as ToolInvocation;
}

test("ToolCallBadge renders friendly label for create", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolCallBadge renders friendly label for str_replace", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({ args: { command: "str_replace", path: "/components/Card.jsx" } })}
    />
  );
  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(<ToolCallBadge toolInvocation={makeInvocation({ state: "result" })} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge shows spinner when pending", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({ state: "call", result: undefined })}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  // spinner has animate-spin class
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "call", result: undefined })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge renders file_manager delete label", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/old.jsx" },
      })}
    />
  );
  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});

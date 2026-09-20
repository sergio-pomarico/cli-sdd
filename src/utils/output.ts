import Table from "cli-table3";

export interface DisplayTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatCreatedAt(value: Date): string {
  return [
    value.getFullYear(),
    "-",
    pad(value.getMonth() + 1),
    "-",
    pad(value.getDate()),
    " ",
    pad(value.getHours()),
    ":",
    pad(value.getMinutes()),
  ].join("");
}

export function formatTaskTable(tasks: readonly DisplayTask[]): string {
  if (tasks.length === 0) {
    return "No tasks found.";
  }

  const table = new Table({
    head: ["ID", "Title", "Status", "Priority", "Created"],
    colWidths: [8, 42, 15, 12, 18],
    style: { border: [], head: [] },
    wordWrap: true,
  });

  for (const task of tasks) {
    table.push([
      String(task.id),
      task.title,
      task.status,
      task.priority,
      formatCreatedAt(task.createdAt),
    ]);
  }

  return table.toString();
}

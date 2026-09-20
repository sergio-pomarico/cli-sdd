export class AppError extends Error {
  readonly exitCode = 1;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {}

export class NotFoundError extends AppError {}

export class OperationError extends AppError {}

export function toErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  return "Unexpected operation failure. Retry the command.";
}

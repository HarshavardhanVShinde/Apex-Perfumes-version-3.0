import { StackHandler } from "@stackframe/stack";

export default function Handler() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <StackHandler fullPage />
    </div>
  );
}

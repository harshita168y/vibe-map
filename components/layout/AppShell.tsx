import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-[#f6f2ff] text-zinc-950">
      <div className="mx-auto min-h-[100dvh] max-w-md bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}
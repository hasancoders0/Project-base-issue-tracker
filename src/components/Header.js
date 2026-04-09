import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          Issue Tracker
        </Link>

        <nav className="flex gap-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/issues">All Issues</Link>
          <Link href="/projects">All Projects</Link>
          <Link href="/projects/add">Add Project</Link>
          <Link href="/issues/new">New Issue</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
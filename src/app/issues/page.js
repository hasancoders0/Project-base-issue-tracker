import IssuesList from "@/components/IssuesList";

async function getIssues() {
  const res = await fetch("http://localhost:3000/api/issues", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch issues");
  }

  return res.json();
}

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <IssuesList issues={issues} />
    </div>
  );
}
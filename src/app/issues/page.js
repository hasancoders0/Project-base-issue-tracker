import IssuesList from "@/components/IssuesList";

async function getIssues() {
  const res = await fetch("http://localhost:3000/api/issues", {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("GET /api/issues failed:", data);
    throw new Error(data.message || "Failed to fetch issues");
  }

  return data;
}

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <IssuesList issues={issues} />
    </div>
  );
}
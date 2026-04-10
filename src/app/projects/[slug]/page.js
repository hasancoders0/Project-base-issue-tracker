import IssuesList from "@/components/IssuesList";
import ProjectDetailsSection from "@/components/ProjectDetailsSection";

async function getProject(slug) {
  const res = await fetch(`http://localhost:3000/api/projects/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }

  return res.json();
}

async function getProjectIssues(projectId) {
  const res = await fetch(
    `http://localhost:3000/api/issues/project/${projectId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch project issues");
  }

  return res.json();
}

export default async function ProjectDetailsPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const issues = await getProjectIssues(project._id);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="space-y-6">
        <ProjectDetailsSection project={project} />
        <IssuesList issues={issues} hideProjectFilter={true}/>
      </div>
    </div>
  );
}
async function getProject(slug) {
  const res = await fetch(`http://localhost:3000/api/projects/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }

  return res.json();
}

export default async function ProjectDetailsPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-gray-400 mb-2">{project.slug}</p>
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

        <div className="grid gap-3 sm:grid-cols-2 mb-6 text-sm">
          <p><span className="font-semibold">Client:</span> {project.clientName || "N/A"}</p>
          <p><span className="font-semibold">Country:</span> {project.country || "N/A"}</p>
          <p><span className="font-semibold">Value:</span> ${project.value || 0}</p>
          <p><span className="font-semibold">Type:</span> {project.type || "Other"}</p>
          <p><span className="font-semibold">Status:</span> {project.status}</p>
          <p><span className="font-semibold">Website:</span> {project.website || "N/A"}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Details</h2>
          <p className="text-gray-300">{project.details || "No details yet."}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Note</h2>
          <p className="text-gray-300">{project.note || "No note yet."}</p>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";

function getStatusClass(status) {
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
  if (status === "Complete") return "bg-green-100 text-green-700";
  if (status === "Cancel") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

async function getProjects() {
  const res = await fetch("http://localhost:3000/api/projects", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return res.json();
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
        <h1 className="text-3xl font-bold">All Projects</h1>
        <p className="mt-1 text-slate-500">
          Manage and track all projects
        </p>
      </div>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => {
            const imageUrl =
              project.image?.trim() ||
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

            return (
              <Link
                key={project._id}
                href={`/projects/${project.slug}`}
                className="group block overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-800 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6 md:p-7">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Project #{project.projectNumber ?? "N/A"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(project.status)}`}
                      >
                        {project.status}
                      </span>

                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {project.type || "Other"}
                      </span>
                    </div>

                    <h2 className="mb-2 text-2xl font-bold transition group-hover:text-violet-700">
                      {project.title}
                    </h2>

                    <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-500">
                      {project.details || "No description added yet."}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Start:</span>{" "}
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Complete:</span>{" "}
                        {project.completeDate
                          ? new Date(project.completeDate).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="h-56 w-full md:h-auto md:w-72">
                    <img
                      src={imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
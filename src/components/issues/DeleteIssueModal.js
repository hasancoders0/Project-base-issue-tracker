"use client";

export default function DeleteIssueModal({
  deleteTarget,
  setDeleteTarget,
  setSelectedIssue,
  router,
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-800 shadow-2xl">
        <h3 className="text-2xl font-bold">Delete Issue</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to delete this issue?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={async () => {
              const user = JSON.parse(localStorage.getItem("user") || "null");

              const res = await fetch(`/api/issues/${deleteTarget._id}`, {
                method: "DELETE",
                headers: {
                  "x-user-id": user?._id || "",
                  "x-user-email": user?.email || "",
                  "x-user-username": user?.username || "",
                  "x-user-role": user?.role || "",
                },
              });

              const data = await res.json();

              if (!res.ok) {
                alert(data.message || "Failed to delete issue");
                return;
              }

              setDeleteTarget(null);
              setSelectedIssue(null);
              router.refresh();
            }}
            className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

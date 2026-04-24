import Task from "@/models/Task";

export async function cleanupTasks() {
  const now = new Date();

  // 1. Archive tasks after 24 hours
  const archiveDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await Task.updateMany(
    {
      status: "done",
      completedAt: { $lte: archiveDate },
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
        archivedAt: new Date(),
      },
    }
  );

  // 2. Delete tasks after 30 days
  const deleteDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  await Task.deleteMany({
    status: "done",
    completedAt: { $lte: deleteDate },
  });
}
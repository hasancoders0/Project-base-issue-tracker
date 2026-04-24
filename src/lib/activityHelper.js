import Activity from "@/models/Activity";

export async function createActivity({
  entityType,
  entityId,
  projectId = null,
  action,
  field = "",
  from = null,
  to = null,
  performedBy,
}) {
  if (!entityType || !entityId || !action || !performedBy) {
    return null;
  }

  return await Activity.create({
    entityType,
    entityId,
    projectId,
    action,
    field,
    from,
    to,
    performedBy,
  });
}

export async function createManyActivities(items = []) {
  const validItems = items.filter(
    (item) =>
      item?.entityType &&
      item?.entityId &&
      item?.action &&
      item?.performedBy,
  );

  if (validItems.length === 0) {
    return [];
  }

  return await Activity.insertMany(validItems);
}

export function addActivityIfChanged({
  activities,
  entityType,
  entityId,
  projectId = null,
  action = "updated",
  field = "",
  from = null,
  to = null,
  performedBy,
}) {
  if (!activities || !Array.isArray(activities)) return;

  if (String(from ?? "") === String(to ?? "")) return;
  if (!entityType || !entityId || !action || !performedBy) return;

  activities.push({
    entityType,
    entityId,
    projectId,
    action,
    field,
    from,
    to,
    performedBy,
  });
}
export function isAdmin(user) {
  return user?.role === "admin";
}

export function isProjectManager(user) {
  return user?.role === "project-manager";
}

export function isEmployee(user) {
  return user?.role === "employee";
}

export function isClient(user) {
  return user?.role === "client";
}

// 🔥 ONLY INTERNAL USERS CAN USE TASKS
export function isInternalUser(user) {
  return (
    isAdmin(user) ||
    isProjectManager(user) ||
    isEmployee(user)
  );
}

// 🔥 CREATE TASK
export function canCreateTask(user) {
  if (!user) return false;

  return isAdmin(user) || isProjectManager(user);
}

export function canCreateProjectTask(user) {
  if (!user) return false;

  return isAdmin(user) || isProjectManager(user);
}

export function canCreateIndividualTask(user) {
  if (!user) return false;

  return isAdmin(user) || isProjectManager(user);
}

// 🔥 PROJECT ACCESS
export function canAccessProject(user, projectId) {
  if (!user || !projectId) return false;

  if (isAdmin(user)) return true;
  if (isProjectManager(user)) return true;

  const assignedProjects = (user.assignedProjects || []).map((id) =>
    String(id)
  );

  return assignedProjects.includes(String(projectId));
}

// 🔥 ASSIGN TASK
export function canAssignTaskToUser(currentUser, targetUser, projectId = null) {
  if (!currentUser || !targetUser) return false;

  if (!isInternalUser(currentUser)) return false;

  // Admin → full control (but only internal users)
  if (isAdmin(currentUser)) {
    return ["admin", "project-manager", "employee"].includes(targetUser.role);
  }

  // Project Manager
  if (isProjectManager(currentUser)) {
    const isSelf = String(currentUser._id) === String(targetUser._id);

    if (isSelf) return true;

    if (targetUser.role !== "employee") return false;

    if (projectId) {
      const targetAssignedProjects = (targetUser.assignedProjects || []).map((id) =>
        String(id)
      );

      return targetAssignedProjects.includes(String(projectId));
    }

    return true;
  }

  return false;
}

// 🔥 MANAGE TASK (EDIT / DELETE / FULL CONTROL)
export function canManageTask(currentUser, task) {
  if (!currentUser || !task) return false;

  if (!isInternalUser(currentUser)) return false;

  if (isAdmin(currentUser)) return true;

  if (isProjectManager(currentUser)) {
    if (task.type === "project" && task.projectId) {
      return canAccessProject(currentUser, task.projectId);
    }

    return String(task.createdBy) === String(currentUser._id);
  }

  return false;
}

// 🔥 VIEW TASK
export function canViewTask(currentUser, task) {
  if (!currentUser || !task) return false;

  if (!isInternalUser(currentUser)) return false;

  if (isAdmin(currentUser)) return true;

  if (isProjectManager(currentUser)) {
    if (task.type === "project" && task.projectId) {
      return canAccessProject(currentUser, task.projectId);
    }

    return (
      String(task.createdBy) === String(currentUser._id) ||
      String(task.assignedTo) === String(currentUser._id)
    );
  }

  if (isEmployee(currentUser)) {
    return String(task.assignedTo) === String(currentUser._id);
  }

  return false;
}

// 🔥 EMPLOYEE LIMITED UPDATE
export function canUpdateOwnTaskStatus(currentUser, task) {
  if (!currentUser || !task) return false;

  if (!isInternalUser(currentUser)) return false;

  if (isAdmin(currentUser)) return true;

  if (isEmployee(currentUser) || isProjectManager(currentUser)) {
    return String(task.assignedTo) === String(currentUser._id);
  }

  return false;
}
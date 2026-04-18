export async function validateStoredUser() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!storedUser?._id) {
      localStorage.removeItem("user");
      return null;
    }

    const res = await fetch(`/api/users/${storedUser._id}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data?.user || data.user.status !== "active") {
      localStorage.removeItem("user");
      return null;
    }

    return data.user;
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}
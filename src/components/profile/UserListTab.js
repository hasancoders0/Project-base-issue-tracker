"use client";

import { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";

export default function UserListTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("USER LIST ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FiUsers className="text-lg text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-900">User List</h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Manage all users in your system.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">
                      {user.name}
                    </td>

                    <td className="py-3 text-slate-500">{user.email}</td>

                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          user.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
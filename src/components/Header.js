"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiMenu,
  FiSearch,
  FiAlertCircle,
  FiFolder,
  FiChevronDown,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import MobileOffcanvas from "./MobileOffcanvas";

function getProjectStatusClass(status) {
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
  if (status === "Complete") return "bg-green-100 text-green-700";
  if (status === "Cancel") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function Header() {
  const router = useRouter();

  const dropdownRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const issueRef = useRef(null);
  const projectRef = useRef(null);
  const menuRef = useRef(null);
  const desktopMenuRef = useRef(null);

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issueLoading, setIssueLoading] = useState(false);

  const [projectOpen, setProjectOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }

      const clickedOutsideDesktop =
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target);

      const clickedOutsideMobile =
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setSearchOpen(false);
      }

      if (issueRef.current && !issueRef.current.contains(event.target)) {
        setIssueOpen(false);
      }

      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setProjectOpen(false);
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target)
      ) {
        setDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);

        const res = await fetch("/api/projects", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setProjects(data);
        }
      } catch (error) {
        console.log("PROJECT FETCH ERROR:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!issueOpen) return;

    const fetchIssues = async () => {
      try {
        setIssueLoading(true);

        const res = await fetch("/api/issues", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setIssues(data);
        }
      } catch (error) {
        console.log("ISSUE FETCH ERROR:", error);
      } finally {
        setIssueLoading(false);
      }
    };

    fetchIssues();
  }, [issueOpen]);

  const assignedProjects = useMemo(() => {
    if (!user?.assignedProjects) return [];
    return user.assignedProjects;
  }, [user]);

  const filteredProjects = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    if (!term) return [];

    return projects.filter((project) => {
      const title = project.title?.toLowerCase() || "";
      const status = project.status?.toLowerCase() || "";
      const type = project.type?.toLowerCase() || "";

      return (
        title.includes(term) || status.includes(term) || type.includes(term)
      );
    });
  }, [projects, searchText]);

  const issueStats = useMemo(() => {
    let open = 0;
    let progress = 0;
    let closed = 0;

    issues.forEach((issue) => {
      if (issue.status === "Open") open++;
      else if (issue.status === "In Progress") progress++;
      else if (issue.status === "Closed") closed++;
    });

    return {
      open,
      progress,
      closed,
    };
  }, [issues]);

  const inProgressProjects = useMemo(() => {
    return projects.filter((project) => project.status === "In Progress");
  }, [projects]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setUserMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-[44px_1fr_auto] items-center gap-4 px-4 py-4 lg:flex lg:justify-between lg:px-6">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700"
            >
              <FiMenu className="text-xl" />
            </button>
          </div>

          <Link
            href="/"
            className="text-center text-2xl font-bold text-slate-900 lg:hidden"
          >
            Lovin.
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Lovin.
            </Link>

            <div className="relative" ref={desktopMenuRef}>
              <button
                onClick={() => setDesktopMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 text-slate-700"
              >
                <FiMenu className="text-xl" />
                <span className="text-base font-medium">Menu</span>
              </button>

              {desktopMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-4 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <nav className="space-y-2">
                    <Link
                      href="/"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                    >
                      Home
                    </Link>

                    <Link
                      href="/issues"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                    >
                      All Issues
                    </Link>

                    <Link
                      href="/projects"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                    >
                      All Projects
                    </Link>

                    <Link
                      href="/projects/add"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                    >
                      Add Project
                    </Link>

                    <Link
                      href="/issues/new"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                    >
                      New Issue
                    </Link>

                    {!user && (
                      <Link
                        href="/login"
                        onClick={() => setDesktopMenuOpen(false)}
                        className="block rounded-xl bg-violet-600 px-4 py-3 text-center font-medium text-white"
                      >
                        Login
                      </Link>
                    )}
                  </nav>
                </div>
              )}
            </div>
          </div>

          <div
            className="hidden max-w-xl flex-1 lg:block"
            ref={desktopSearchRef}
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />

              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchText.trim()) setSearchOpen(true);
                }}
                placeholder="Search Project"
                className="w-full rounded-full border border-slate-300 bg-white py-4 pl-12 pr-4 text-slate-800 outline-none placeholder:text-slate-400"
              />

              {searchOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-[70] max-h-96 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
                  {projectsLoading ? (
                    <p className="px-3 py-6 text-center text-sm text-slate-500">
                      Loading...
                    </p>
                  ) : filteredProjects.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-slate-500">
                      No project found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredProjects.map((project) => (
                        <Link
                          key={project._id}
                          href={`/projects/${project.slug}`}
                          onClick={() => {
                            setSearchText("");
                            setSearchOpen(false);
                          }}
                          className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {project.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getProjectStatusClass(project.status)}`}
                            >
                              {project.status}
                            </span>

                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                              {project.type || "Other"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="relative" ref={issueRef}>
              <button
                onClick={() => setIssueOpen((prev) => !prev)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              >
                <FiAlertCircle className="text-xl" />
              </button>

              {issueOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Issue Summary
                  </h3>

                  {issueLoading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading...</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-600">Open</span>
                        <span className="font-semibold text-blue-600">
                          {issueStats.open}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-600">
                          In Progress
                        </span>
                        <span className="font-semibold text-yellow-600">
                          {issueStats.progress}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-600">Closed</span>
                        <span className="font-semibold text-green-600">
                          {issueStats.closed}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user?.role === "admin" && (
              <div className="relative" ref={projectRef}>
                <button
                  onClick={() => setProjectOpen((prev) => !prev)}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                >
                  <FiFolder className="text-xl" />
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {inProgressProjects.length}
                  </span>
                </button>

                {projectOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <h3 className="text-sm font-semibold text-slate-900">
                      In Progress Projects
                    </h3>

                    <div className="mt-4 space-y-2">
                      {inProgressProjects.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No in progress projects.
                        </p>
                      ) : (
                        inProgressProjects.map((project) => (
                          <Link
                            key={project._id}
                            href={`/projects/${project.slug}`}
                            onClick={() => setProjectOpen(false)}
                            className="block rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            {project.title}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full pl-2 pr-1 transition hover:bg-slate-50"
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    firstLetter
                  )}
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-sm text-slate-500">
                    {user ? "Hi, Welcome" : "Guest User"}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {user?.name || "Login First"}
                  </p>
                </div>

                <FiChevronDown className="text-lg text-slate-600" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  {user ? (
                    <>
                      <div className="border-b border-slate-100 pb-3">
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                          {user.role}
                        </p>
                      </div>

                      <div className="py-3">
                        <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                          Assigned Projects
                        </p>

                        {assignedProjects.length > 0 ? (
                          <div className="space-y-2">
                            {assignedProjects.map((project, index) => (
                              <Link
                                key={project._id || index}
                                href={
                                  project.slug
                                    ? `/projects/${project.slug}`
                                    : "#"
                                }
                                onClick={() => setUserMenuOpen(false)}
                                className="block rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              >
                                {project.title || "Project"}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No assigned projects
                          </p>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="mb-3 block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                      >
                        <FiLogOut />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                          <FiUser />
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            Not logged in
                          </p>
                          <p className="text-sm text-slate-500">
                            Please login to continue
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-medium text-white"
                      >
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <MobileOffcanvas
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        mobileSearchRef={mobileSearchRef}
        searchText={searchText}
        setSearchText={setSearchText}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        projectsLoading={projectsLoading}
        filteredProjects={filteredProjects}
        getProjectStatusClass={getProjectStatusClass}
        user={user}
      />
    </>
  );
}

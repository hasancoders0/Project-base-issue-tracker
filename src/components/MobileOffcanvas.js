"use client";

import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";

export default function MobileOffcanvas({
  menuOpen,
  setMenuOpen,
  menuRef,
  mobileSearchRef,
  searchText,
  setSearchText,
  searchOpen,
  setSearchOpen,
  projectsLoading,
  filteredProjects,
  getProjectStatusClass,
  user,
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[80] bg-black/50 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Offcanvas */}
      <div
        ref={menuRef}
        className={`fixed left-0 top-0 z-[90] h-full w-full max-w-sm bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Menu</h2>

          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-5" ref={mobileSearchRef}>
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
              className="w-full rounded-full border border-slate-300 bg-white py-4 pl-12 pr-4 text-slate-800 outline-none"
            />

            {searchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-[95] max-h-96 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
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
                          setMenuOpen(false);
                        }}
                        className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                      >
                        <h3 className="text-sm font-semibold text-slate-900">
                          {project.title}
                        </h3>

                        <div className="mt-1 flex gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${getProjectStatusClass(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>

                          <span className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">
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

        {/* Menu */}
        <nav className="space-y-2">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-700">
            Home
          </Link>

          <Link href="/issues" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-700">
            All Issues
          </Link>

          <Link href="/projects" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-700">
            All Projects
          </Link>

          <Link href="/projects/add" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-700">
            Add Project
          </Link>

          <Link href="/issues/new" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-700">
            New Issue
          </Link>

          {!user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block bg-violet-600 px-4 py-3 text-center text-white"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
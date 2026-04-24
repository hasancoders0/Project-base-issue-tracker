'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AddTaskSetupSection from './add-task/AddTaskSetupSection'
import TaskAssignmentSection from './add-task/TaskAssignmentSection'
import TaskScheduleSection from './add-task/TaskScheduleSection'

export default function AddTaskForm ({
  currentUser,
  projects = [],
  fixedProjectId = '',
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(true)
  const [showTimelineNote, setShowTimelineNote] = useState(true)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const [allUsers, setAllUsers] = useState([])

  const projectDropdownRef = useRef(null)
  const assigneeDropdownRef = useRef(null)

  const isAdmin = currentUser?.role === 'admin'
  const isProjectManager = currentUser?.role === 'project-manager'
  const isClient = currentUser?.role === 'client'
  const isEmployee = currentUser?.role === 'employee'
  const canUseTaskCreation = isAdmin || isProjectManager

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: fixedProjectId ? 'project' : 'individual',
    projectId: fixedProjectId || '',
    assignedTo: String(currentUser?._id || ''),
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    note: ''
  })

  useEffect(() => {
    async function fetchUsers () {
      try {
        setUsersLoading(true)
        const res = await fetch('/api/users', { cache: 'no-store' })
        const data = await res.json()

        setAllUsers(
          Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []
        )
      } catch {
        setAllUsers([])
      } finally {
        setUsersLoading(false)
      }
    }

    if (canUseTaskCreation) fetchUsers()
    else {
      setAllUsers([])
      setUsersLoading(false)
    }
  }, [canUseTaskCreation])

  useEffect(() => {
    if (fixedProjectId) {
      setFormData(prev => ({
        ...prev,
        type: 'project',
        projectId: fixedProjectId
      }))
    }
  }, [fixedProjectId])

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false)
      }

      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target)
      ) {
        setAssigneeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userNameMap = useMemo(() => {
    const map = {}

    for (const user of allUsers) {
      map[String(user._id)] =
        user.fullName || user.name || user.username || 'Unknown User'
    }

    return map
  }, [allUsers])

  const allowedProjects = useMemo(() => {
    if (!currentUser || !canUseTaskCreation) return []
    if (isAdmin || isProjectManager) return projects

    if (isEmployee) {
      const assignedIds = (currentUser.assignedProjects || []).map(item =>
        String(item?._id || item)
      )

      return projects.filter(project => assignedIds.includes(String(project._id)))
    }

    return []
  }, [projects, currentUser, canUseTaskCreation, isAdmin, isProjectManager, isEmployee])

  const selectedProject = useMemo(() => {
    return (
      allowedProjects.find(
        project => String(project._id) === String(formData.projectId)
      ) || null
    )
  }, [allowedProjects, formData.projectId])

  const filteredProjects = useMemo(() => {
    const keyword = projectSearch.trim().toLowerCase()
    if (!keyword) return allowedProjects

    return allowedProjects.filter(project => {
      const title = project.title?.toLowerCase() || ''
      const slug = project.slug?.toLowerCase() || ''
      const clientName = project.clientName?.toLowerCase() || ''
      const type = project.type?.toLowerCase() || ''
      const status = project.status?.toLowerCase() || ''

      const teamNames = (project.assignedTeamMembers || [])
        .map(member => {
          const memberId =
            typeof member === 'string' ? member : String(member?._id)
          return userNameMap[memberId] || ''
        })
        .join(' ')
        .toLowerCase()

      return (
        title.includes(keyword) ||
        slug.includes(keyword) ||
        clientName.includes(keyword) ||
        type.includes(keyword) ||
        status.includes(keyword) ||
        teamNames.includes(keyword)
      )
    })
  }, [allowedProjects, projectSearch, userNameMap])

  const projectTeamUsers = useMemo(() => {
    if (!selectedProject) return []

    const teamIds = (selectedProject.assignedTeamMembers || []).map(member =>
      typeof member === 'string' ? member : String(member?._id)
    )

    return allUsers
      .filter(user => teamIds.includes(String(user._id)))
      .filter(user => ['admin', 'project-manager', 'employee'].includes(user.role))
  }, [selectedProject, allUsers])

  const projectTeamNames = useMemo(() => {
    if (!selectedProject) return []

    return projectTeamUsers.map(
      user => user.fullName || user.name || user.username || 'Unknown User'
    )
  }, [selectedProject, projectTeamUsers])

  const assignableUsers = useMemo(() => {
    if (!currentUser || !canUseTaskCreation) return []

    if (formData.type === 'individual') {
      if (isAdmin) {
        return allUsers.filter(user =>
          ['admin', 'project-manager', 'employee'].includes(user.role)
        )
      }

      if (isProjectManager) {
        return allUsers.filter(user => {
          const isSelf = String(user._id) === String(currentUser._id)
          return isSelf || user.role === 'employee'
        })
      }

      return []
    }

    if (formData.type === 'project') {
      return projectTeamUsers.filter(user =>
        ['admin', 'project-manager', 'employee'].includes(user.role)
      )
    }

    return []
  }, [
    currentUser,
    canUseTaskCreation,
    formData.type,
    allUsers,
    projectTeamUsers,
    isAdmin,
    isProjectManager
  ])

  const filteredAssignees = useMemo(() => {
    const keyword = assigneeSearch.trim().toLowerCase()
    if (!keyword) return assignableUsers

    return assignableUsers.filter(user => {
      const fullName = user.fullName?.toLowerCase() || ''
      const username = user.username?.toLowerCase() || ''
      const email = user.email?.toLowerCase() || ''
      const role = user.role?.toLowerCase() || ''

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      )
    })
  }, [assignableUsers, assigneeSearch])

  const selectedAssignee = useMemo(() => {
    return (
      assignableUsers.find(
        user => String(user._id) === String(formData.assignedTo)
      ) || null
    )
  }, [assignableUsers, formData.assignedTo])

  function handleChange (e) {
    const { name, value } = e.target

    setFormData(prev => {
      const next = { ...prev, [name]: value }

      if (name === 'type' && value === 'individual') {
        next.projectId = ''
        next.assignedTo = String(currentUser?._id || '')
      }

      if (name === 'type' && value === 'project') {
        next.assignedTo = ''
      }

      if (fixedProjectId) {
        next.type = 'project'
        next.projectId = fixedProjectId
      }

      return next
    })
  }

  function handleProjectSelect (projectId) {
    setFormData(prev => ({
      ...prev,
      projectId: String(projectId),
      type: 'project',
      assignedTo: ''
    }))

    setProjectDropdownOpen(false)
    setProjectSearch('')
    setAssigneeSearch('')
  }

  function handleAssigneeSelect (userId) {
    setFormData(prev => ({
      ...prev,
      assignedTo: String(userId)
    }))

    setAssigneeDropdownOpen(false)
    setAssigneeSearch('')
  }

  useEffect(() => {
    if (!currentUser || !canUseTaskCreation) return

    if (formData.type === 'individual') {
      if (!formData.assignedTo) {
        setFormData(prev => ({
          ...prev,
          assignedTo: String(currentUser._id)
        }))
      }
      return
    }

    if (formData.type === 'project') {
      if (!selectedProject || assignableUsers.length === 0) {
        if (formData.assignedTo) {
          setFormData(prev => ({ ...prev, assignedTo: '' }))
        }
        return
      }

      const hasCurrentAssigned = assignableUsers.some(
        user => String(user._id) === String(formData.assignedTo)
      )

      if (hasCurrentAssigned) return

      const selfUser = assignableUsers.find(
        user => String(user._id) === String(currentUser._id)
      )

      const defaultUser = selfUser || assignableUsers[0]

      if (defaultUser) {
        setFormData(prev => ({
          ...prev,
          assignedTo: String(defaultUser._id)
        }))
      }
    }
  }, [
    currentUser,
    canUseTaskCreation,
    formData.type,
    formData.projectId,
    formData.assignedTo,
    selectedProject,
    assignableUsers
  ])

  useEffect(() => {
    if (!formData.assignedTo || !canUseTaskCreation) return

    const exists = assignableUsers.some(
      user => String(user._id) === String(formData.assignedTo)
    )

    if (!exists) {
      setFormData(prev => ({
        ...prev,
        assignedTo:
          formData.type === 'individual' && currentUser?._id
            ? String(currentUser._id)
            : ''
      }))
    }
  }, [
    assignableUsers,
    formData.assignedTo,
    formData.type,
    currentUser,
    canUseTaskCreation
  ])

  async function handleSubmit (e) {
    e.preventDefault()

    if (loading) return

    if (!currentUser?._id) {
      toast.error('Current user not found')
      return
    }

    if (!canUseTaskCreation) {
      toast.error('You do not have permission to create tasks')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (formData.type === 'project' && !formData.projectId) {
      toast.error('Please select a project')
      return
    }

    if (!formData.assignedTo) {
      toast.error('Please select an assignee')
      return
    }

    try {
      setLoading(true)

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        projectId:
          formData.type === 'project' && formData.projectId
            ? String(formData.projectId)
            : null,
        assignedTo: String(formData.assignedTo),
        assignedBy: String(currentUser._id),
        createdBy: String(currentUser._id),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        note: formData.note.trim(),
        currentUserId: String(currentUser._id),
        userId: String(currentUser._id),
        requesterId: String(currentUser._id)
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.message || 'Failed to create task')
        return
      }

      setFormData({
        title: '',
        description: '',
        type: fixedProjectId ? 'project' : 'individual',
        projectId: fixedProjectId || '',
        assignedTo: String(currentUser?._id || ''),
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        note: ''
      })

      setProjectSearch('')
      setAssigneeSearch('')
      setProjectDropdownOpen(false)
      setAssigneeDropdownOpen(false)

      onSuccess?.(data.task)
    } catch {
      toast.error('Something went wrong while creating task')
    } finally {
      setLoading(false)
    }
  }

  const inputWrap =
    'flex items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-3 shadow-sm transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20'
  const inputClass =
    'w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35'
  const textareaClass =
    'w-full rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white shadow-sm outline-none placeholder:text-white/35 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20'
  const labelClass = 'mb-2 block text-sm font-bold text-white/65'
  const sectionClass =
    'rounded-[20px] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur-md'
  const leftStackClass = 'space-y-4'
  const rightStackClass = 'space-y-4'

  if (!canUseTaskCreation) {
    return (
      <div className='rounded-[20px] border border-white/10 bg-white/[0.07] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
        <h2 className='text-xl font-bold'>Access Denied</h2>
        <p className='mt-2 text-sm text-white/55'>
          Only admin and project manager can create tasks.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm lg:p-6'
    >
      <AddTaskSetupSection
        fixedProjectId={fixedProjectId}
        isClient={isClient}
        currentUser={currentUser}
        formData={formData}
        setFormData={setFormData}
        selectedProject={selectedProject}
        projectTeamNames={projectTeamNames}
        allowedProjects={allowedProjects}
        filteredProjects={filteredProjects}
        projectDropdownOpen={projectDropdownOpen}
        setProjectDropdownOpen={setProjectDropdownOpen}
        projectDropdownRef={projectDropdownRef}
        projectSearch={projectSearch}
        setProjectSearch={setProjectSearch}
        handleChange={handleChange}
        handleProjectSelect={handleProjectSelect}
        userNameMap={userNameMap}
        inputWrap={inputWrap}
        inputClass={inputClass}
        textareaClass={textareaClass}
        labelClass={labelClass}
        sectionClass={sectionClass}
        leftStackClass={leftStackClass}
        rightStackClass={rightStackClass}
      />

      <TaskAssignmentSection
        formData={formData}
        currentUser={currentUser}
        selectedProject={selectedProject}
        selectedAssignee={selectedAssignee}
        projectTeamUsers={projectTeamUsers}
        filteredAssignees={filteredAssignees}
        usersLoading={usersLoading}
        showAssignmentDetails={showAssignmentDetails}
        setShowAssignmentDetails={setShowAssignmentDetails}
        assigneeDropdownOpen={assigneeDropdownOpen}
        setAssigneeDropdownOpen={setAssigneeDropdownOpen}
        setProjectDropdownOpen={setProjectDropdownOpen}
        assigneeSearch={assigneeSearch}
        setAssigneeSearch={setAssigneeSearch}
        handleAssigneeSelect={handleAssigneeSelect}
        assigneeDropdownRef={assigneeDropdownRef}
        inputWrap={inputWrap}
        inputClass={inputClass}
        labelClass={labelClass}
        sectionClass={sectionClass}
        leftStackClass={leftStackClass}
        rightStackClass={rightStackClass}
      />

      <TaskScheduleSection
        formData={formData}
        selectedProject={selectedProject}
        showTimelineNote={showTimelineNote}
        setShowTimelineNote={setShowTimelineNote}
        handleChange={handleChange}
        textareaClass={textareaClass}
        labelClass={labelClass}
        sectionClass={sectionClass}
        leftStackClass={leftStackClass}
        rightStackClass={rightStackClass}
        inputWrap={inputWrap}
        inputClass={inputClass}
      />

      <button
        type='submit'
        disabled={loading}
        className='w-full rounded-full bg-white py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}
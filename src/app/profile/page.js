'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FiUser } from 'react-icons/fi'

import DashboardTab from '@/components/profile/DashboardTab'
import MyProfileTab from '@/components/profile/MyProfileTab'
import UserListTab from '@/components/profile/UserListTab'
import AddUserTab from '@/components/profile/AddUserTab'
import EditProfileTab from '@/components/profile/EditProfileTab'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import MyProjectsTab from '@/components/profile/MyProjectsTab'
import MyTasksTab from '@/components/profile/MyTasksTab'
import TodoTab from '@/components/profile/TodoTab'
import AddTaskTab from '@/components/profile/AddTaskTab'
import AnalyticsTab from '@/components/profile/AnalyticsTab'
import TaskManagementTab from '@/components/profile/TaskManagementTab'

import AllActivitiesTab from '@/components/profile/AllActivitiesTab'
import MyActivitiesTab from '@/components/profile/MyActivitiesTab'

function AccessDenied ({ message }) {
  return (
    <div className='rounded-[20px] border border-white/10 bg-white/[0.07] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
      <h2 className='text-2xl font-bold'>Access Denied</h2>
      <p className='mt-2 text-sm text-white/55'>{message}</p>
    </div>
  )
}

export default function ProfilePage () {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [issues, setIssues] = useState([])
  const [checkingUser, setCheckingUser] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [users, setUsers] = useState([])

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = localStorage.getItem('user')

      if (!savedUser) {
        setCheckingUser(false)
        return
      }

      try {
        const parsedUser = JSON.parse(savedUser)

        const res = await fetch(`/api/users/${parsedUser._id}`, {
          cache: 'no-store'
        })

        const data = await res.json()

        if (!res.ok || !data?.user || data.user.status !== 'active') {
          localStorage.removeItem('user')
          setUser(null)
          setCheckingUser(false)
          return
        }

        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      } catch (error) {
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setCheckingUser(false)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectRes, issueRes, userRes] = await Promise.all([
          fetch('/api/projects', { cache: 'no-store' }),
          fetch('/api/issues', { cache: 'no-store' }),
          fetch('/api/users', { cache: 'no-store' })
        ])

        const projectData = projectRes.ok ? await projectRes.json() : []
        const issueData = issueRes.ok ? await issueRes.json() : []
        const userData = userRes.ok ? await userRes.json() : []

        setProjects(Array.isArray(projectData) ? projectData : [])
        setIssues(Array.isArray(issueData) ? issueData : [])
        setUsers(
          Array.isArray(userData?.users)
            ? userData.users
            : Array.isArray(userData)
            ? userData
            : []
        )
      } catch (error) {
        console.log('PROFILE DASHBOARD ERROR:', error)
      }
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    function handleTabChange (e) {
      if (e.detail?.tab) {
        setActiveSection(e.detail.tab)
      }
    }

    window.addEventListener('change-tab', handleTabChange)

    return () => {
      window.removeEventListener('change-tab', handleTabChange)
    }
  }, [])

  const assignedProjects = useMemo(() => {
    if (!user?.assignedProjects) return []
    return user.assignedProjects
  }, [user])

  const safeSection =
    user?.role === 'admin'
      ? activeSection
      : ['add-user', 'users', 'analytics'].includes(activeSection)
      ? 'dashboard'
      : activeSection

  const canUseTasks =
    user?.role === 'admin' ||
    user?.role === 'project-manager' ||
    user?.role === 'employee'

  const canViewAllActivities =
    user?.role === 'admin' || user?.role === 'project-manager'

  function renderContent () {
    if (safeSection === 'dashboard') {
      return <DashboardTab user={user} projects={projects} issues={issues} />
    }

    if (safeSection === 'all-activities') {
      return canViewAllActivities ? (
        <AllActivitiesTab user={user} />
      ) : (
        <AccessDenied message='Only admin and project manager can view all activities.' />
      )
    }

    if (safeSection === 'my-activities') {
      return <MyActivitiesTab user={user} />
    }

    if (safeSection === 'analytics') {
      return user?.role === 'admin' ? (
        <AnalyticsTab projects={projects} issues={issues} users={users} />
      ) : (
        <AccessDenied message='Only administrators can view analytics.' />
      )
    }

    if (safeSection === 'users') {
      return user?.role === 'admin' ? (
        <UserListTab currentUser={user} />
      ) : (
        <AccessDenied message='Only administrators can access users.' />
      )
    }

    if (safeSection === 'add-user') {
      return user?.role === 'admin' ? (
        <AddUserTab />
      ) : (
        <AccessDenied message='Only administrators can create users.' />
      )
    }

    if (safeSection === 'profile') {
      return <MyProfileTab user={user} assignedProjects={assignedProjects} />
    }

    if (safeSection === 'edit-profile') {
      return <EditProfileTab user={user} onUserUpdate={setUser} />
    }

    if (safeSection === 'my-projects') {
      return <MyProjectsTab user={user} projects={projects} />
    }

    if (safeSection === 'my-tasks') {
      return canUseTasks ? (
        <MyTasksTab user={user} projects={projects} issues={issues} />
      ) : (
        <AccessDenied message='Clients cannot access tasks.' />
      )
    }

    if (safeSection === 'todo') {
      return <TodoTab user={user} />
    }

    if (safeSection === 'task-management') {
      return canUseTasks ? (
        <TaskManagementTab user={user} />
      ) : (
        <AccessDenied message='Only admin and project manager can access task management.' />
      )
    }

    if (safeSection === 'add-task') {
      return canUseTasks ? (
        user?.role === 'employee' ? (
          <AccessDenied message='Employees cannot create tasks.' />
        ) : (
          <AddTaskTab user={user} />
        )
      ) : (
        <AccessDenied message='Clients cannot create tasks.' />
      )
    }

    if (safeSection === 'calendar') {
      return (
        <div className='rounded-[20px] border border-white/10 bg-white/[0.07] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
          <h2 className='text-2xl font-bold'>Calendar</h2>
        </div>
      )
    }

    if (safeSection === 'help') {
      return (
        <div className='rounded-[20px] border border-white/10 bg-white/[0.07] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
          <h2 className='text-2xl font-bold'>Help</h2>
        </div>
      )
    }

    return <DashboardTab user={user} projects={projects} issues={issues} />
  }

  if (checkingUser) return null

  if (!user) {
    return (
      <div className='mx-auto max-w-3xl p-6'>
        <div className='rounded-[20px] border border-white/10 bg-white/[0.07] p-8 text-center text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
          <FiUser className='mx-auto text-3xl text-white/70' />
          <h1 className='mt-4 text-3xl font-bold'>No User Found</h1>
          <Link href='/login' className='mt-4 inline-flex text-cyan-300'>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
        <div>{renderContent()}</div>

        <ProfileSidebar
          user={user}
          safeSection={safeSection}
          setActiveSection={setActiveSection}
        />
      </div>
    </div>
  )
}
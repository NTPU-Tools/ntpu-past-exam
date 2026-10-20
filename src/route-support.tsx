import { ReactNode, useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { getCookie } from "@/utils/cookie"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const API = process.env.NEXT_PUBLIC_API_ORIGIN

function applyTitle(title?: string) {
  if (title) {
    document.title = `${title} - NTPU 考古題`
    return
  }
  document.title = "NTPU 考古題"
}

function useFetchedTitle<T = any>(url?: string) {
  const [data, setData] = useState<T>()

  useEffect(() => {
    let active = true

    if (!url) {
      setData(undefined)
      return
    }

    const accessToken = getCookie("ntpu-past-exam-access-token")

    fetch(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return
        setData(data)
      })
      .catch(() => {
        if (active) {
          setData(undefined)
        }
      })

    return () => {
      active = false
    }
  }, [url])

  return data
}

export function StaticTitle({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  useDocumentTitle(title)
  return <>{children}</>
}

export function DepartmentTitleLayout() {
  const { department_id } = useParams()

  const data = useFetchedTitle(
    department_id ? `${API}/departments/${department_id}` : undefined,
  )

  useEffect(() => {
    applyTitle(data?.name)
  }, [data])

  return <Outlet />
}

export function CourseTitleLayout() {
  const { course_id } = useParams()

  const data = useFetchedTitle(course_id ? `${API}/courses/${course_id}` : undefined)

  useEffect(() => {
    applyTitle(data?.course?.name)
  }, [data])

  return <Outlet />
}

export function PostTitleLayout({ children }: { children: ReactNode }) {
  const { post_id } = useParams()

  const data = useFetchedTitle(post_id ? `${API}/posts/${post_id}` : undefined)

  useEffect(() => {
    applyTitle(data?.title)
  }, [data])

  return <>{children}</>
}

export function AdminTitleLayout({ children }: { children: ReactNode }) {
  const { admin_department_id } = useParams()

  const data = useFetchedTitle(
    admin_department_id ? `${API}/departments/${admin_department_id}` : undefined,
  )

  useEffect(() => {
    applyTitle(data?.name ? `${data.name} Admin` : undefined)
  }, [data])

  return <>{children}</>
}

export function AppGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let active = true

    async function verify() {
      const pathname = location.pathname
      const accessToken = getCookie("ntpu-past-exam-access-token")

      if (pathname === "/login") {
        if (!accessToken) {
          if (active) setIsChecking(false)
          return
        }

        try {
          const response = await fetch(`${API}/verify-token`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          if (response.ok) {
            navigate("/", { replace: true })
            return
          }
        } catch {
          // fall through and allow the login page to render
        }

        if (active) setIsChecking(false)
        return
      }

      if (pathname === "/admin") {
        navigate("/", { replace: true })
        return
      }

      if (!accessToken) {
        navigate("/login", { replace: true })
        return
      }

      try {
        const response = await fetch(`${API}/verify-token`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
          navigate("/login", { replace: true })
          return
        }

        if (pathname === "/") {
          if (active) setIsChecking(false)
          return
        }

        const data = await response.json()

        if (pathname.startsWith("/admin/")) {
          const departmentId = pathname.split("/admin/")[1]
          if (!data?.admin?.length || !data.admin.includes(departmentId)) {
            navigate("/", { replace: true })
            return
          }

          if (active) setIsChecking(false)
          return
        }

        const departmentId = pathname.split("/")[1]
        if (!data?.visible_departments?.includes(departmentId)) {
          navigate("/", { replace: true })
          return
        }

        if (active) setIsChecking(false)
      } catch {
        navigate("/login", { replace: true })
      }
    }

    verify()

    return () => {
      active = false
    }
  }, [location.pathname, navigate])

  if (isChecking) {
    return <div className="min-h-screen bg-background" />
  }

  return <>{children}</>
}

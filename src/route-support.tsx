import { ReactNode, useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import instance, { refreshSession } from "@/api-client/instance"
import { clearAccessToken, getAccessToken } from "@/api-client/session"
import { RouteLoading } from "@/components/RouteLoading"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { isUnknownTopLevelRoute } from "./route-paths"

interface DepartmentTitleResponse {
  name?: string
}

interface CourseTitleResponse {
  course?: { name?: string }
}

interface PostTitleResponse {
  title?: string
}

interface VerificationResponse {
  admin?: string[]
  visible_departments?: string[]
}

function applyTitle(title?: string) {
  if (title) {
    document.title = `${title} - NTPU 考古題`
    return
  }
  document.title = "NTPU 考古題"
}

function useFetchedTitle<T>(url?: string) {
  const [data, setData] = useState<T>()

  useEffect(() => {
    let active = true

    if (!url) {
      setData(undefined)
      return
    }

    instance
      .get<T>(url)
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

  const data = useFetchedTitle<DepartmentTitleResponse>(
    department_id ? `/departments/${department_id}` : undefined,
  )

  useEffect(() => {
    applyTitle(data?.name)
  }, [data])

  return <Outlet />
}

export function CourseTitleLayout() {
  const { course_id } = useParams()

  const data = useFetchedTitle<CourseTitleResponse>(
    course_id ? `/courses/${course_id}` : undefined,
  )

  useEffect(() => {
    applyTitle(data?.course?.name)
  }, [data])

  return <Outlet />
}

export function PostTitleLayout({ children }: { children: ReactNode }) {
  const { post_id } = useParams()

  const data = useFetchedTitle<PostTitleResponse>(
    post_id ? `/posts/${post_id}` : undefined,
  )

  useEffect(() => {
    applyTitle(data?.title)
  }, [data])

  return <>{children}</>
}

export function AdminTitleLayout({ children }: { children: ReactNode }) {
  const { admin_department_id } = useParams()

  const data = useFetchedTitle<DepartmentTitleResponse>(
    admin_department_id
      ? `/departments/${admin_department_id}`
      : undefined,
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
      setIsChecking(true)

      if (pathname === "/admin") {
        navigate("/", { replace: true })
        return
      }

      try {
        if (!getAccessToken()) {
          await refreshSession()
        }
        if (!active) return

        const data = await instance.get<VerificationResponse>("/verify-token")
        if (!active) return

        if (pathname === "/login") {
          navigate("/", { replace: true })
          return
        }

        if (pathname === "/") {
          if (active) setIsChecking(false)
          return
        }

        if (isUnknownTopLevelRoute(pathname)) {
          if (active) setIsChecking(false)
          return
        }

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
        if (!active) return
        clearAccessToken()

        if (pathname === "/login") {
          if (active) setIsChecking(false)
          return
        }

        navigate("/login", { replace: true })
      }
    }

    verify()

    return () => {
      active = false
    }
  }, [location.pathname, navigate])

  if (isChecking) {
    return <RouteLoading />
  }

  return <>{children}</>
}

import { useMemo } from "react"
import {
  useLocation,
  useNavigate,
  useParams as useRouterParams,
} from "react-router-dom"

export function useRouter() {
  const navigate = useNavigate()

  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  }
}

export function usePathname() {
  return useLocation().pathname
}

export function useSearchParams() {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useRouterParams() as T
}

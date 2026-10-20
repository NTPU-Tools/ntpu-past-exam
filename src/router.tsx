import { Outlet, createBrowserRouter, useLocation } from "react-router-dom"
import { Providers } from "@/app/providers"
import { RouteLoading } from "@/components/RouteLoading"
import dynamic from "next/dynamic"
import {
  AdminTitleLayout,
  AppGuard,
  CourseTitleLayout,
  DepartmentTitleLayout,
  PostTitleLayout,
  StaticTitle,
} from "./route-support"
import { isUnknownTopLevelRoute } from "./route-paths"

const routeOptions = { loading: RouteLoading }

const HomePage = dynamic(() => import("@/app/page"), routeOptions)
const LoginPage = dynamic(() => import("@/app/login/page"), routeOptions)
const NotFoundPage = dynamic(() => import("@/app/not-found"), routeOptions)
const DepartmentPage = dynamic(
  () => import("@/app/[department_id]/page"),
  routeOptions,
)
const CoursePage = dynamic(
  () => import("@/app/[department_id]/[course_id]/page"),
  routeOptions,
)
const PostPage = dynamic(
  () => import("@/app/[department_id]/[course_id]/[post_id]/page"),
  routeOptions,
)
const ThreadListPage = dynamic(
  () => import("@/app/[department_id]/[course_id]/thread/page"),
  routeOptions,
)
const ThreadDetailPage = dynamic(
  () => import("@/app/[department_id]/[course_id]/thread/[thread_id]/page"),
  routeOptions,
)
const AdminDashboard = dynamic(
  () => import("@/app/admin/[admin_department_id]/page"),
  routeOptions,
)

function DepartmentRouteLayout() {
  const { pathname } = useLocation()

  if (isUnknownTopLevelRoute(pathname)) {
    return (
      <StaticTitle title="找不到頁面">
        <NotFoundPage />
      </StaticTitle>
    )
  }

  return <DepartmentTitleLayout />
}

function RootLayout() {
  return (
    <AppGuard>
      <Providers>
        <Outlet />
      </Providers>
    </AppGuard>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <StaticTitle title="選擇社群">
            <HomePage />
          </StaticTitle>
        ),
      },
      {
        path: "login",
        element: (
          <StaticTitle title="登入">
            <LoginPage />
          </StaticTitle>
        ),
      },
      {
        path: "admin/:admin_department_id",
        element: (
          <AdminTitleLayout>
            <AdminDashboard />
          </AdminTitleLayout>
        ),
      },
      {
        path: ":department_id",
        element: <DepartmentRouteLayout />,
        children: [
          { index: true, element: <DepartmentPage /> },
          {
            path: ":course_id",
            element: <CourseTitleLayout />,
            children: [
              { index: true, element: <CoursePage /> },
              {
                path: ":post_id",
                element: (
                  <PostTitleLayout>
                    <PostPage />
                  </PostTitleLayout>
                ),
              },
              { path: "thread", element: <ThreadListPage /> },
              { path: "thread/:thread_id", element: <ThreadDetailPage /> },
            ],
          },
        ],
      },
      {
        path: "*",
        element: (
          <StaticTitle title="找不到頁面">
            <NotFoundPage />
          </StaticTitle>
        ),
      },
    ],
  },
])

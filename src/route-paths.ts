const UUID_ROUTE_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const STATIC_TOP_LEVEL_ROUTES = new Set(["admin", "login"])

export function isUnknownTopLevelRoute(pathname: string) {
  const [topLevelSegment] = pathname.split("/").filter(Boolean)

  if (
    !topLevelSegment ||
    STATIC_TOP_LEVEL_ROUTES.has(topLevelSegment)
  ) {
    return false
  }

  return !UUID_ROUTE_SEGMENT.test(topLevelSegment)
}

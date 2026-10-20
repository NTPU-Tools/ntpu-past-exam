import { describe, expect, it } from "vitest"
import { isUnknownTopLevelRoute } from "./route-paths"

const departmentId = "86d52fb0-a86c-49d5-9295-a1b6524b2551"

describe("isUnknownTopLevelRoute", () => {
  it("identifies an unknown top-level route for the NotFound boundary", () => {
    expect(isUnknownTopLevelRoute("/definitely-not-a-route")).toBe(true)
    expect(isUnknownTopLevelRoute("/definitely-not-a-route/child")).toBe(true)
  })

  it("preserves known static and UUID department routes", () => {
    expect(isUnknownTopLevelRoute("/")).toBe(false)
    expect(isUnknownTopLevelRoute("/login")).toBe(false)
    expect(isUnknownTopLevelRoute("/admin/department-id")).toBe(false)
    expect(isUnknownTopLevelRoute(`/${departmentId}`)).toBe(false)
    expect(isUnknownTopLevelRoute(`/${departmentId}/course-id`)).toBe(false)
  })
})

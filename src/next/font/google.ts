type FontOptions = {
  variable?: string
  [key: string]: unknown
}

function createFont(options?: FontOptions) {
  return {
    className: "",
    style: {},
    variable: options?.variable ?? "",
  }
}

export function Geist(options?: FontOptions) {
  return createFont(options)
}

export function Geist_Mono(options?: FontOptions) {
  return createFont(options)
}

export function Figtree(options?: FontOptions) {
  return createFont(options)
}

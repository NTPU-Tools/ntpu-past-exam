export interface Metadata {
  title?:
    | string
    | {
        default?: string
        template?: string
      }
}

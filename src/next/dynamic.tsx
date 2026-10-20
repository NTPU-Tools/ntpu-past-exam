import { ComponentType, Suspense, lazy } from "react"

type Loader<TProps> = () => Promise<
  | { default: ComponentType<TProps> }
  | ComponentType<TProps>
>

type DynamicOptions = {
  loading?: ComponentType
  ssr?: boolean
}

export default function dynamic<TProps extends object = {}>(
  loader: Loader<TProps>,
  options?: DynamicOptions,
) {
  const LazyComponent = lazy(async () => {
    const loaded = await loader()
    if (typeof loaded === "function") {
      return { default: loaded }
    }
    if ("default" in loaded) {
      return loaded
    }
    return { default: loaded as ComponentType<TProps> }
  })

  const Loading = options?.loading

  return function DynamicComponent(props: TProps) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

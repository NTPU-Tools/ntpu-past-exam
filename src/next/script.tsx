import { ScriptHTMLAttributes, useEffect } from "react"

type ScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  id?: string
  src?: string
  children?: string
}

export default function Script({ id, src, children, ...props }: ScriptProps) {
  useEffect(() => {
    const scriptId = id || src
    if (scriptId) {
      const existing = document.querySelector(`script[data-managed-script="${scriptId}"]`)
      if (existing) return
    }

    const script = document.createElement("script")
    if (scriptId) {
      script.dataset.managedScript = scriptId
    }
    if (src) {
      script.src = src
      script.async = true
    }
    if (props.type) {
      script.type = props.type
    }
    if (children) {
      script.text = children
    }

    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [children, id, props.type, src])

  return null
}

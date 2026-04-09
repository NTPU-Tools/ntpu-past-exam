import { AnchorHTMLAttributes, forwardRef } from "react"
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom"

export type LinkProps = Omit<RouterLinkProps, "to"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: RouterLinkProps["to"]
  }

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, reloadDocument, ...props }: LinkProps,
  ref,
) {
  return (
    <RouterLink
      ref={ref}
      to={href}
      reloadDocument={reloadDocument}
      {...props}
    />
  )
})

export default Link

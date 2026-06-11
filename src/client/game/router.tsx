import { createContext, useContext, useState, useEffect, useCallback, ReactNode, AnchorHTMLAttributes } from "react"

interface RouterContextValue {
  path: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextValue>({
  path: "/",
  navigate: () => {},
})

interface RouterProps {
  children: ReactNode
  /**
   * Starting path. In the default (embedding-safe) mode this is the initial
   * in-memory route. When `syncWithHistory` is set it overrides the initial
   * read of `window.location.pathname`.
   */
  initialPath?: string
  /**
   * When true the router reads from and writes to `window.location`/history,
   * for use as a standalone app that owns the page URL. When false (default)
   * the router keeps its path purely in memory, so embedding it never depends
   * on — or mutates — the host page's URL.
   */
  syncWithHistory?: boolean
}

export function Router({ children, initialPath = "/", syncWithHistory = false }: RouterProps) {
  const [path, setPath] = useState(() =>
    syncWithHistory ? window.location.pathname : initialPath
  )

  useEffect(() => {
    if (!syncWithHistory) return
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [syncWithHistory])

  const navigate = useCallback((to: string) => {
    if (syncWithHistory) {
      window.history.pushState(null, "", to)
    }
    setPath(to)
  }, [syncWithHistory])

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useNavigate() {
  return useContext(RouterContext).navigate
}

export function usePath() {
  return useContext(RouterContext).path
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string
  children?: ReactNode
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const { navigate } = useContext(RouterContext)
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault()
        onClick?.(e)
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

interface RouteProps {
  path: string
  element: ReactNode
}

export function Route(_props: RouteProps): null {
  return null
}

export function Routes({ children }: { children: ReactNode }) {
  const { path } = useContext(RouterContext)
  const routes = (Array.isArray(children) ? children : [children])
    .filter(Boolean)
    .map((child: any) => ({ path: child.props.path, element: child.props.element }))
  // Match the current path exactly, then fall back to an explicit catch-all
  // (`path="*"`) if one is provided. Unmatched paths render nothing rather than
  // silently showing the first route, which would otherwise make the rendered
  // page depend on the host's URL when embedded.
  const match =
    routes.find((r: RouteProps) => r.path === path) ??
    routes.find((r: RouteProps) => r.path === "*")
  return <>{match?.element ?? null}</>
}

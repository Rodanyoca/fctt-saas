export type NavigationIcon =
  | "dashboard"
  | "territory"
  | "league"
  | "entente"
  | "club"
  | "actors"
  | "athlete"
  | "coach"
  | "doctor"
  | "referee"
  | "official"
  | "other-actor"
  | "movement"
  | "license"
  | "competition"
  | "national-team"
  | "activity"
  | "document"
  | "settings"

export type NavigationItem = {
  name: string
  href?: string
  exact?: boolean
  icon?: NavigationIcon
  children?: readonly NavigationItem[]
}

export const dashboardNavigation: readonly NavigationItem[] = [
  { name: "Acteurs", children: [
    { name: "Joueurs", href: "/athletes", icon: "athlete" },
    { name: "Entraîneurs", href: "/coachs", icon: "coach" },
    { name: "Arbitres", href: "/arbitres", icon: "referee" },
    { name: "Officiels", href: "/officiels", icon: "official" },
    { name: "Médecins", href: "/medecins", icon: "doctor" },
    { name: "Autres acteurs", href: "/autres-acteurs", icon: "other-actor" },
  ] },
  { name: "Compétitions", href: "/competitions", icon: "competition" },
  { name: "Activités", href: "/activites", icon: "activity" },
  { name: "Documents", href: "/documents", icon: "document" },
] as const

export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.children?.some((child) => isNavigationItemActive(child, pathname))) return true
  if (!item.href) return false
  if (item.href === "/" || item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/**
 * `usePathname` can expose a different URL during server rendering and the
 * browser's first render (notably after a rewrite or a prefetched transition).
 * The navigation therefore waits until hydration before marking a link active.
 */
export function hydrationSafePathname(pathname: string, hydrated: boolean): string {
  return hydrated ? pathname : ""
}

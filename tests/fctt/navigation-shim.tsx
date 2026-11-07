import React from 'react'
export function usePathname() { return '/athletes' }
export function useRouter() { return { refresh() {}, push() {}, replace() {} } }
export function useSearchParams() { return new URLSearchParams() }
export default function Link({ children, ...props }: React.ComponentProps<'a'>) { return <a {...props}>{children}</a> }

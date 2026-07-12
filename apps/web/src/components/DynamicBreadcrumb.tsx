"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ROUTE_MAP: Record<string, string> = {
  "settings": "Configurações",
  "pm": "Bate Ponto",
  "stats": "Estatísticas",
  "panel": "Painel",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const guildId = segments[0] || ""
  const breadcrumbItems = []

  breadcrumbItems.push({
    label: "Página Inicial",
    href: `/${guildId}`,
    isPage: segments.length <= 1,
  })

  let currentPath = `/${guildId}`
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    
    breadcrumbItems.push({
      label: ROUTE_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      isPage: i === segments.length - 1,
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                {item.isPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

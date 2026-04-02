"use client"

import * as React from "react"
import { cn } from "@thc-efb/shared/utils"
import { useIsMobile } from "./use-mobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer"

// ─── Shared context ──────────────────────────────────────────────

interface ResponsiveContextValue {
  isMobile: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const ResponsiveContext = React.createContext<ResponsiveContextValue>({
  isMobile: false,
})

export function useResponsiveContext() {
  return React.useContext(ResponsiveContext)
}

// ─── Types ───────────────────────────────────────────────────────

interface RootProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ComponentMap {
  /** Desktop root wrapper (Dialog, AlertDialog, Sheet, etc.) */
  Root: React.FC<{
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }>
  /** Desktop content component */
  Content: React.ComponentType<any>
  /** Desktop header component */
  Header: React.ComponentType<any>
  /** Desktop footer component */
  Footer: React.ComponentType<any>
  /** Desktop title component */
  Title: React.ComponentType<any>
  /** Desktop description component */
  Description: React.ComponentType<any>
  /** Desktop close component */
  Close: React.ComponentType<any>
}

interface ResponsiveOptions {
  /** Extra className for DrawerHeader on mobile */
  mobileHeaderClass?: string
  /** Extra className for DrawerFooter on mobile */
  mobileFooterClass?: string
}

// ─── Factory ─────────────────────────────────────────────────────

export function createResponsiveComponents(
  desktop: ComponentMap,
  options: ResponsiveOptions = {}
) {
  const {
    mobileHeaderClass = "justify-items-center gap-1.5 pt-2.5 pb-2.5 [&>div:first-child]:mb-1",
    mobileFooterClass = "mt-2 gap-3 px-5 pb-5 pt-2.5 [&>*]:w-full",
  } = options

  // ── Root ──

  function Root({ children, open, onOpenChange }: RootProps) {
    const isMobile = useIsMobile()
    if (isMobile) {
      return (
        <ResponsiveContext.Provider value={{ isMobile: true, open, onOpenChange }}>
          {children}
        </ResponsiveContext.Provider>
      )
    }
    return (
      <ResponsiveContext.Provider value={{ isMobile: false }}>
        <desktop.Root open={open} onOpenChange={onOpenChange}>
          {children}
        </desktop.Root>
      </ResponsiveContext.Provider>
    )
  }

  // ── Trigger ──
  // On mobile: plain button or cloneElement with onClick (avoids vaul DrawerTrigger issues)
  // On desktop: delegates to the desktop Trigger if provided, otherwise plain button

  function Trigger({
    render,
    children,
    ...props
  }: React.ComponentProps<"button"> & {
    render?: React.ReactElement
  }) {
    const { isMobile, onOpenChange } = React.useContext(ResponsiveContext)

    if (isMobile) {
      if (render && React.isValidElement(render)) {
        return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, {
          onClick: () => onOpenChange?.(true),
        })
      }
      return (
        <button
          type="button"
          {...props}
          onClick={(e) => {
            props.onClick?.(e)
            onOpenChange?.(true)
          }}
        >
          {children}
        </button>
      )
    }

    // Desktop: if render prop exists, wrap with onClick for open
    if (render && React.isValidElement(render)) {
      return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, {
        onClick: () => onOpenChange?.(true),
      })
    }
    return (
      <button
        type="button"
        {...props}
        onClick={(e) => {
          props.onClick?.(e)
          onOpenChange?.(true)
        }}
      >
        {children}
      </button>
    )
  }

  // ── Content ──

  function Content({
    className,
    children,
    ...props
  }: React.ComponentProps<typeof desktop.Content>) {
    const { isMobile, open, onOpenChange } = React.useContext(ResponsiveContext)
    if (isMobile) {
      return open ? (
        <Drawer open onOpenChange={onOpenChange}>
          <DrawerContent className={typeof className === "function" ? undefined : className}>
            {children}
          </DrawerContent>
        </Drawer>
      ) : null
    }
    return (
      <desktop.Content className={className} {...props}>
        {children}
      </desktop.Content>
    )
  }

  // ── Header ──

  function Header({ className, ...props }: React.ComponentProps<"div">) {
    const { isMobile } = React.useContext(ResponsiveContext)
    if (isMobile) {
      return <DrawerHeader className={cn(mobileHeaderClass, className)} {...props} />
    }
    return <desktop.Header className={className} {...props} />
  }

  // ── Footer ──

  function Footer({ className, ...props }: React.ComponentProps<"div"> & Record<string, unknown>) {
    const { isMobile } = React.useContext(ResponsiveContext)
    if (isMobile) {
      return <DrawerFooter className={cn(mobileFooterClass, className)} {...props} />
    }
    return <desktop.Footer className={className} {...props} />
  }

  // ── Title ──

  function Title({ className, children }: { className?: string; children: React.ReactNode }) {
    const { isMobile } = React.useContext(ResponsiveContext)
    if (isMobile) return <DrawerTitle className={className}>{children}</DrawerTitle>
    return <desktop.Title className={className}>{children}</desktop.Title>
  }

  // ── Description ──

  function Description({ className, children }: { className?: string; children: React.ReactNode }) {
    const { isMobile } = React.useContext(ResponsiveContext)
    if (isMobile) return <DrawerDescription className={className}>{children}</DrawerDescription>
    return <desktop.Description className={className}>{children}</desktop.Description>
  }

  // ── Close ──

  function Close(props: React.ComponentProps<"button">) {
    const { isMobile } = React.useContext(ResponsiveContext)
    if (isMobile) return <DrawerClose {...props} />
    return <desktop.Close {...props} />
  }

  return { Root, Trigger, Content, Header, Footer, Title, Description, Close }
}

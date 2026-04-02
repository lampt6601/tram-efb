"use client"

import * as React from "react"
import { cn } from "@thc-efb/shared/utils"
import { useIsMobile } from "./use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer"
import { Separator } from "./separator"

const ResponsiveDropdownMenuContext = React.createContext<{
  isMobile: boolean
  open: boolean
  setOpen: (open: boolean) => void
}>({ isMobile: false, open: false, setOpen: () => {} })

function ResponsiveDropdownMenu({
  children,
  ...props
}: { children: React.ReactNode } & Omit<React.ComponentProps<typeof DropdownMenu>, "children">) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  if (isMobile) {
    return (
      <ResponsiveDropdownMenuContext.Provider value={{ isMobile: true, open, setOpen }}>
        {children}
      </ResponsiveDropdownMenuContext.Provider>
    )
  }

  return (
    <ResponsiveDropdownMenuContext.Provider value={{ isMobile: false, open, setOpen }}>
      <DropdownMenu {...props}>{children}</DropdownMenu>
    </ResponsiveDropdownMenuContext.Provider>
  )
}

function ResponsiveDropdownMenuTrigger({
  className,
  children,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  const ctx = React.useContext(ResponsiveDropdownMenuContext)

  if (ctx.isMobile) {
    if (render && React.isValidElement(render)) {
      return React.cloneElement(render as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => ctx.setOpen(true),
      })
    }
    return (
      <button
        type="button"
        className={typeof className === "function" ? undefined : className}
        onClick={() => ctx.setOpen(true)}
      >
        {children}
      </button>
    )
  }

  return <DropdownMenuTrigger className={className} render={render} {...props}>{children}</DropdownMenuTrigger>
}

function ResponsiveDropdownMenuContent({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & { title?: string }) {
  const { isMobile, open, setOpen } = React.useContext(ResponsiveDropdownMenuContext)

  if (isMobile) {
    return open ? (
      <Drawer open onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left pb-1.5 pt-1">
            <DrawerTitle>{title ?? "Tác vụ"}</DrawerTitle>
            <DrawerDescription className="sr-only">Chọn thao tác</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">
            {children}
          </div>
          <DrawerFooter className="px-5 pb-5 pt-1">
            <DrawerClose className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Hủy
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : null
  }

  return (
    <DropdownMenuContent className={className} {...props}>
      {children}
    </DropdownMenuContent>
  )
}

function ResponsiveDropdownMenuGroup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) {
  const { isMobile } = React.useContext(ResponsiveDropdownMenuContext)
  if (isMobile) return <div className="space-y-1">{children}</div>
  return <DropdownMenuGroup className={className} {...props}>{children}</DropdownMenuGroup>
}

function ResponsiveDropdownMenuLabel({
  className,
  children,
}: { className?: string; children: React.ReactNode }) {
  const { isMobile } = React.useContext(ResponsiveDropdownMenuContext)
  if (isMobile) {
    return (
      <p className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}>
        {children}
      </p>
    )
  }
  return <DropdownMenuLabel className={className}>{children}</DropdownMenuLabel>
}

function ResponsiveDropdownMenuItem({
  className,
  variant = "default",
  onClick,
  children,
  disabled,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  const { isMobile, setOpen } = React.useContext(ResponsiveDropdownMenuContext)

  if (isMobile) {
    // render prop (e.g. Link) — clone with drawer-compatible styling
    if (render && React.isValidElement(render)) {
      return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, {
        className: cn(
          "relative flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none",
          variant === "destructive" && "text-destructive",
          disabled && "pointer-events-none opacity-50",
          className,
          (render.props as Record<string, unknown>).className as string | undefined
        ),
        onClick: (e: React.MouseEvent) => {
          const renderOnClick = (render.props as Record<string, unknown>).onClick as ((e: React.MouseEvent) => void) | undefined
          renderOnClick?.(e)
          setOpen(false)
        },
        children,
      })
    }

    return (
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "relative flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
          variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={(e) => {
          onClick?.(e as never)
          setOpen(false)
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <DropdownMenuItem className={className} variant={variant} onClick={onClick} disabled={disabled} render={render} {...props}>
      {children}
    </DropdownMenuItem>
  )
}

function ResponsiveDropdownMenuSeparator({ className }: { className?: string }) {
  const { isMobile } = React.useContext(ResponsiveDropdownMenuContext)
  if (isMobile) return <Separator className={cn("my-1", className)} />
  return <DropdownMenuSeparator className={className} />
}

export {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuGroup,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuLabel,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
}

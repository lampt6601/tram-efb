"use client"

import * as React from "react"
import { DrawerClose } from "./drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"
import { createResponsiveComponents, useResponsiveContext } from "./responsive-core"

const {
  Root: ResponsiveAlertDialog,
  Trigger: ResponsiveAlertDialogTrigger,
  Content: ResponsiveAlertDialogContent,
  Header: ResponsiveAlertDialogHeader,
  Footer: ResponsiveAlertDialogFooter,
  Title: ResponsiveAlertDialogTitle,
  Description: ResponsiveAlertDialogDescription,
} = createResponsiveComponents({
  Root: AlertDialog,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: DrawerClose, // not used directly, but required by factory
})

// Action & Cancel need special handling — DrawerClose on mobile, AlertDialog* on desktop

function ResponsiveAlertDialogAction({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogAction>) {
  const { isMobile } = useResponsiveContext()
  if (isMobile) {
    const resolvedClass = typeof className === "function" ? undefined : className
    return (
      <DrawerClose className={resolvedClass} {...(props as React.ComponentProps<typeof DrawerClose>)}>
        {children}
      </DrawerClose>
    )
  }
  return (
    <AlertDialogAction className={className} {...props}>
      {children}
    </AlertDialogAction>
  )
}

function ResponsiveAlertDialogCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogCancel>) {
  const { isMobile } = useResponsiveContext()
  if (isMobile) {
    const resolvedClass = typeof className === "function" ? undefined : className
    return (
      <DrawerClose className={resolvedClass} {...(props as React.ComponentProps<typeof DrawerClose>)}>
        {children}
      </DrawerClose>
    )
  }
  return (
    <AlertDialogCancel className={className} {...props}>
      {children}
    </AlertDialogCancel>
  )
}

export {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogTrigger,
}

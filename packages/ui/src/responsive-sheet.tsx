"use client"

import * as React from "react"
import { useResponsiveContext } from "./responsive-core"
import { createResponsiveComponents } from "./responsive-core"
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./sheet"

const {
  Root: ResponsiveSheet,
  Trigger: ResponsiveSheetTrigger,
  Content: ResponsiveSheetContent,
  Header: ResponsiveSheetHeader,
  Footer: ResponsiveSheetFooter,
  Title: ResponsiveSheetTitle,
  Description: ResponsiveSheetDescription,
  Close: ResponsiveSheetClose,
} = createResponsiveComponents(
  {
    Root: Sheet,
    Content: SheetContent,
    Header: SheetHeader,
    Footer: SheetFooter,
    Title: SheetTitle,
    Description: SheetDescription,
    Close: SheetClose,
  },
  {
    // Sheet uses default drawer header/footer styles (no extra centering)
    mobileHeaderClass: "",
    mobileFooterClass: "",
  }
)

// SheetBody has no drawer equivalent — just a scrollable div on mobile
function ResponsiveSheetBody(props: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveContext()
  if (isMobile) {
    const { className, ...rest } = props
    return (
      <div
        data-slot="responsive-sheet-body"
        className={className ?? "flex-1 overflow-y-auto"}
        {...rest}
      />
    )
  }
  return <SheetBody {...props} />
}

export {
  ResponsiveSheet,
  ResponsiveSheetBody,
  ResponsiveSheetClose,
  ResponsiveSheetContent,
  ResponsiveSheetDescription,
  ResponsiveSheetFooter,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
  ResponsiveSheetTrigger,
}

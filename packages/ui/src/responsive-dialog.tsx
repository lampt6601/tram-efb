"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { createResponsiveComponents } from "./responsive-core"

const {
  Root: ResponsiveDialog,
  Trigger: ResponsiveDialogTrigger,
  Content: ResponsiveDialogContent,
  Header: ResponsiveDialogHeader,
  Footer: ResponsiveDialogFooter,
  Title: ResponsiveDialogTitle,
  Description: ResponsiveDialogDescription,
  Close: ResponsiveDialogClose,
} = createResponsiveComponents({
  Root: Dialog,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
})

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
}

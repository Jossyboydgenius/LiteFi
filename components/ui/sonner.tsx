"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800 group-[.toaster]:border-green-200",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-800 group-[.toaster]:border-yellow-200",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-800 group-[.toaster]:border-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

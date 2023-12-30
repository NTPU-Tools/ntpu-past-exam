import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/utils/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { isMobile } from "react-device-detect";

const Dialog = isMobile ? Drawer : DialogPrimitive.Root;

const DialogTrigger = isMobile ? DrawerTrigger : DialogPrimitive.Trigger;

const DialogPortal = isMobile ? DrawerPortal : DialogPrimitive.Portal;

const DialogClose = isMobile ? DrawerClose : DialogPrimitive.Close;

const DialogOverlay = isMobile
  ? DrawerOverlay
  : React.forwardRef<
      React.ElementRef<typeof DialogPrimitive.Overlay>,
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    ));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = isMobile
  ? DrawerContent
  : React.forwardRef<
      React.ElementRef<typeof DialogPrimitive.Content>,
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
    >(({ className, children, ...props }, ref) => (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] max-h-[calc(100vh-2rem)] overflow-y-auto z-50 grid w-full max-w-lg  xl:max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    ));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = isMobile
  ? DrawerHeader
  : ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          className,
        )}
        {...props}
      />
    );
// @ts-ignore
DialogHeader.displayName = "DialogHeader";

const DialogFooter = isMobile
  ? DrawerFooter
  : ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0 sm:space-x-2",
          className,
        )}
        {...props}
      />
    );
// @ts-ignore
DialogFooter.displayName = "DialogFooter";

const DialogTitle = isMobile
  ? DrawerTitle
  : React.forwardRef<
      React.ElementRef<typeof DialogPrimitive.Title>,
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Title
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className,
        )}
        {...props}
      />
    ));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = isMobile
  ? DrawerDescription
  : React.forwardRef<
      React.ElementRef<typeof DialogPrimitive.Description>,
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    ));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

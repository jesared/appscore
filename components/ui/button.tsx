import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold shadow-sm transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:brightness-105",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:brightness-105",
        outline:
          "border-input bg-card text-card-foreground hover:border-primary hover:bg-muted",
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:bg-muted",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:brightness-105",
      },
      size: {
        default: "h-10 px-3.5 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-5",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

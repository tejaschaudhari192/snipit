import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable, View } from 'react-native';
import { Host, Button as NativeButton } from '@expo/ui';
import { useUIStyle } from '@/core/UIStyleContext';
import React from 'react';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive active:bg-destructive/90 dark:bg-destructive/60 shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border-border bg-background active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        secondary: cn(
          'bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-foreground text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> & React.RefAttributes<typeof Pressable> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, children, onPress, ...props }: ButtonProps) {
  const { uiStyle } = useUIStyle();

  if (uiStyle === 'native' && Platform.OS !== 'web') {
    const isIcon = size === 'icon';

    // Extract label text if passed as a string or as a nested <Text>String</Text>
    let label: string | undefined = undefined;
    if (typeof children === 'string') {
      label = children;
    } else if (React.isValidElement(children) && typeof (children.props as any)?.children === 'string') {
      label = (children.props as any).children;
    }

    // If it's an icon button or there is no text label, Jetpack Compose Button cannot display React Native Lucide SVGs.
    // Render as a high-fidelity Pressable with proper design tokens so the icon is always clearly visible.
    if (isIcon || !label) {
      return (
        <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
          <Pressable
            className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
            role="button"
            onPress={onPress}
            {...props}
          >
            {children}
          </Pressable>
        </TextClassContext.Provider>
      );
    }

    const isFlex1 = className?.includes('flex-1');
    const nativeVariant = variant === 'outline' ? 'outlined' : variant === 'ghost' || variant === 'link' ? 'text' : 'filled';

    return (
      <View className={cn(isFlex1 ? 'flex-1' : undefined, className)}>
        <Host style={{ minWidth: 64, height: size === 'sm' ? 36 : 44, width: isFlex1 ? '100%' : undefined }}>
          <NativeButton
            variant={nativeVariant}
            label={label}
            onPress={onPress as (() => void) | undefined}
            disabled={props.disabled ?? false}
            style={{ width: '100%', height: size === 'sm' ? 36 : 44 }}
          />
        </Host>
      </View>
    );
  }

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };

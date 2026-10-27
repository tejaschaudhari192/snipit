import React from 'react';
import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform } from 'react-native';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { useUIStyle } from '@/core/UIStyleContext';

function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  const { uiStyle } = useUIStyle();

  if (uiStyle === 'native' && Platform.OS !== 'web') {
    return (
      <Host matchContents>
        <NativeSwitch
          value={checked ?? false}
          onValueChange={onCheckedChange}
          disabled={props.disabled ?? false}
        />
      </Host>
    );
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        'flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        checked ? 'bg-primary' : 'bg-input dark:bg-input/80',
        props.disabled && 'opacity-50',
        className
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}>
      <SwitchPrimitives.Thumb
        className={cn(
          'bg-background size-4 rounded-full transition-transform',
          Platform.select({
            web: 'pointer-events-none block ring-0',
          }),
          checked
            ? 'dark:bg-primary-foreground translate-x-3.5'
            : 'dark:bg-foreground translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };

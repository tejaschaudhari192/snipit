import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View, Platform, useColorScheme, StyleSheet } from 'react-native';
import { useUIStyle } from '@/core/UIStyleContext';

function Card({ className, style, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  const { uiStyle } = useUIStyle();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (uiStyle === 'native' && Platform.OS !== 'web') {
    return (
      <TextClassContext.Provider value="text-card-foreground">
        <View
          style={[
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 14,
              borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 1,
              borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.35 : 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
            style,
          ]}
          className={className}
          {...props}
        />
      </TextClassContext.Provider>
    );
  }

  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'bg-card border-border rounded-xl border shadow-sm shadow-black/5',
          className
        )}
        style={style}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />;
}

function CardTitle({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<typeof Text>) {

  return (
    <Text
      ref={ref}
      role="heading"
      aria-level={3}
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<typeof Text>) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('flex flex-row items-center px-6', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

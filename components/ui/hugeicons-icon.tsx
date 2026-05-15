import { HugeiconsIcon as BaseHugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';

type HugeiconsIconProps = React.ComponentProps<typeof BaseHugeiconsIcon>;

export function HugeiconsIcon({ pointerEvents = 'none', ...props }: HugeiconsIconProps) {
  return <BaseHugeiconsIcon {...props} pointerEvents={pointerEvents} />;
}

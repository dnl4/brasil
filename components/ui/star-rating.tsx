import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  spacing?: number;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 32,
  spacing = 4,
}: StarRatingProps) {
  const handlePress = (star: number) => {
    if (readonly || !onChange) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(star);
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={[styles.container, { gap: spacing }]}>
      {stars.map((star) => {
        const isFilled = star <= value;
        
        return (
          <TouchableOpacity
            key={star}
            onPress={() => handlePress(star)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.7}
            style={styles.starButton}
          >
            <HugeiconsIcon
              icon={StarIcon}
              size={size}
              color={isFilled ? '#FFB800' : '#D1D5DB'}
              variant={isFilled ? 'solid' : 'stroke'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
});

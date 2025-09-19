import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Animated } from 'react-native';

interface StarItem {
  left: number;
  top: number;
  size: number;
  delay: number;
}

function useTwinkles(count: number) {
  const anims = useMemo(() => {
    return new Array(count).fill(0).map(() => new Animated.Value(Math.random()));
  }, [count]);

  useEffect(() => {
    const loops = anims.map((v) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 0.2, duration: 1600 + Math.random() * 1000, useNativeDriver: true }),
          Animated.timing(v, { toValue: 1, duration: 1600 + Math.random() * 1000, useNativeDriver: true }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  return anims;
}

export default function Stars({ count = 80 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const stars: StarItem[] = useMemo(() => {
    const arr: StarItem[] = [];
    for (let i = 0; i < count; i += 1) {
      arr.push({
        left: Math.random() * width,
        top: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 2,
      });
    }
    return arr;
  }, [count, width, height]);

  const anims = useTwinkles(count);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.star,
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              opacity: anims[idx],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});



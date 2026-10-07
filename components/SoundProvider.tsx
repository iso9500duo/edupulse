'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '@/lib/audio';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playCorrect: () => void;
  playWrong: () => void;
  playTick: () => void;
  playFanfare: () => void;
  playClick: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playCorrect: () => {},
  playWrong: () => {},
  playTick: () => {},
  playFanfare: () => {},
  playClick: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    sound.enabled = !isMuted;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.enabled = !next;
      return next;
    });
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playCorrect: () => sound.playCorrect(),
        playWrong: () => sound.playWrong(),
        playTick: () => sound.playTick(),
        playFanfare: () => sound.playFanfare(),
        playClick: () => sound.playClick(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);

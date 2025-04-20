"use client"

import React from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'

type AnimationProviderProps = {
  children: React.ReactNode
}

export default function AnimationProvider({ children }: AnimationProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  )
} 
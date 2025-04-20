"use client"

import React from 'react'
import { LazyMotion, domAnimation, MotionConfig, m } from 'framer-motion'
import MotionController from './utils/MotionController'

type AnimationProviderProps = {
  children: React.ReactNode
}

export default function AnimationProvider({ children }: AnimationProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <MotionController />
        <div className="motion-container">
          {children}
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

// Export the m component for use in other components
export { m } 
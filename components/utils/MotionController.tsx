"use client"

import React, { useEffect } from 'react'

/**
 * Motion Controller component to handle animation performance optimizations
 * and cleanup to prevent memory leaks
 */
export default function MotionController() {
  // This effect adds overflow control to the document and cleans up animations
  useEffect(() => {
    // Add overflow control to document
    document.documentElement.style.overflowX = 'hidden'
    document.body.style.overflowX = 'hidden'
    
    // Create a style element for additional animation optimizations
    const styleEl = document.createElement('style')
    styleEl.textContent = `
      .motion-container {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        overflow: hidden;
      }
    `
    document.head.appendChild(styleEl)

    // Cleanup function
    return () => {
      document.documentElement.style.removeProperty('overflow-x')
      document.body.style.removeProperty('overflow-x')
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl)
      }
    }
  }, [])

  return null
} 
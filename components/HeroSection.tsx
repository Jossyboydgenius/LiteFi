"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import heroImg from "@/assets/images/hero.png"
import circularLogo from "@/assets/svgs/circular-logo.svg"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section id="hero" className="bg-black pt-28 pb-0 md:pt-36 md:pb-0 relative">
      <div className="container mx-auto container-padding">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Circular logo and text in a pill container */}
          <motion.div 
            className="flex items-center justify-center mb-6 gap-3 pill-container border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Image
              src={circularLogo}
              alt="Circular Logo"
              width={30}
              height={30}
              className="inline-block"
            />
            <span className="text-xs md:text-sm text-gray-300 font-light tracking-wide">
              YOUR FAST TRACK TO FINANCIAL FREEDOM
            </span>
          </motion.div>

          <motion.h1 
            className="heading-primary max-w-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get a Loan Using Your Car &amp; Grow Your Wealth with LiteFi
          </motion.h1>
          
          <motion.p 
            className="text-primary max-w-2xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Unlock the value in your car with a quick loan, or build your future with high-yield investment plans.
            Experience a seamless journey to achieving your financial dreams.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
              Get Started
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero image with adjusted positioning */}
        <motion.div 
          className="mx-auto max-w-4xl relative z-10 mb-[-60px] md:mb-[-120px]"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            type: "spring",
            stiffness: 50
          }}
        >
          <Image
            src={heroImg}
            alt="LiteFi Hero"
            width={1000}
            height={600}
            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)]"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}

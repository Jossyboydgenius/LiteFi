"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import heroImg from "@/assets/images/hero.png"
import circularLogo from "@/assets/svgs/circular-logo.svg"

export default function HeroSection() {
  return (
    <section id="hero" className="bg-black pt-28 pb-0 md:pt-36 md:pb-0 relative">
      <div className="container mx-auto container-padding relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Circular logo and text in a pill container */}
          <div className="flex items-center justify-center mb-6 gap-3 pill-container border">
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
          </div>

          <h1 className="heading-primary max-w-4xl mb-4">
            Get a Loan Using Your Car &amp; Grow Your Wealth with LiteFi
          </h1>
          
          <p className="text-primary max-w-2xl mb-6">
            Unlock instant cash with your car value.
          </p>
          
          <div className="mb-8">
            <Link href="https://litefiwebapp.vercel.app/sign-up">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Hero image positioned within the container but with styling to make it extend */}
          <div className="hero-image-container mx-auto max-w-4xl relative">
            <Image
              src={heroImg}
              alt="LiteFi Hero"
              width={1000}
              height={600}
              className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

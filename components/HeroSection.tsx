import Image from "next/image"
import { Button } from "@/components/ui/button"
import heroImg from "@/assets/images/hero.png"
import circularLogo from "@/assets/svgs/circular-logo.svg"

export default function HeroSection() {
  return (
    <section id="hero" className="bg-black pt-28 pb-0 md:pt-36 md:pb-0 relative">
      <div className="container mx-auto container-padding">
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

          <h1 className="heading-primary max-w-4xl mb-4"> {/* Reduced mb-6 to mb-4 */}
            Get a Loan Using Your Car &amp; Grow Your Wealth with LiteFi
          </h1>
          <p className="text-primary max-w-2xl mb-6"> {/* Reduced mb-8 to mb-6 */}
            Unlock the value in your car with a quick loan, or build your future with high-yield investment plans.
            Experience a seamless journey to achieving your financial dreams.
          </p>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
            Get Started
          </Button>
        </div>

        {/* Hero image with adjusted positioning */}
        <div className="mx-auto max-w-4xl relative z-10 mb-[-60px] md:mb-[-120px]">
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
    </section>
  )
}

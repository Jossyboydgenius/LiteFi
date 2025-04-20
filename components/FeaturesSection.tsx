"use client"

import Image from "next/image"
import flash from "@/assets/svgs/flash.svg"
import car from "@/assets/svgs/car.svg"
import cash from "@/assets/svgs/cash.svg"
import gift from "@/assets/svgs/gift.svg"
import form from "@/assets/svgs/form.svg"
import percent from "@/assets/svgs/percent.svg"
import { m } from "@/components/AnimationProvider"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Image src={flash} alt="Fast Approval & Disbursement" className="w-10 h-10" />,
      title: "Fast Approval & Disbursement",
      description: "Get the cash you need in as little as 24 hours.",
    },
    {
      icon: <Image src={car} alt="Keep Driving Your Car" className="w-10 h-10" />,
      title: "Keep Driving Your Car",
      description: "Use your car as collateral without disrupting your daily life.",
    },
    {
      icon: <Image src={cash} alt="Flexible Repayment Options" className="w-10 h-10" />,
      title: "Flexible Repayment Options",
      description: "Choose a repayment plan that fits your budget, from 3 to 48 months.",
    },
    {
      icon: <Image src={gift} alt="Competitive Loan Amounts" className="w-10 h-10" />,
      title: "Competitive Loan Amounts",
      description: "Access between ₦1,000,000 and ₦50,000,000.",
    },
    {
      icon: <Image src={form} alt="Easy Online Application" className="w-10 h-10" />,
      title: "Easy Online Application",
      description: "Apply from the comfort of your home in just a few simple steps.",
    },
    {
      icon: <Image src={percent} alt="Affordable Interest Rates" className="w-10 h-10" />,
      title: "Affordable Interest Rates",
      description: "Enjoy low and flexible interest rates that make repayment stress-free and manageable.",
    },
  ]

  // Animation variants with reduced movement to prevent overflow
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  }

  return (
    <section className="bg-gray-50 text-black py-20 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-28">
        <m.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="heading-secondary text-black mb-4">Auto Loans Made Simple, Fast, and Affordable</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Get behind the wheel faster with loan terms that match your budget and lifestyle.
          </p>
        </m.div>

        <m.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <m.div 
              key={index} 
              className="bg-white p-8 rounded-sm shadow-sm"
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
            >
              <m.div 
                className="bg-gray-100 w-20 h-20 circle-container mb-6 flex items-center justify-center"
                whileHover={{ 
                  scale: 1.08,
                  backgroundColor: "#f8f8f8",
                  transition: { duration: 0.2 }
                }}
              >
                {feature.icon}
              </m.div>
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}

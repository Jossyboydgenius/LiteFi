"use client"

import Image from "next/image"
import flash from "@/assets/svgs/flash.svg"
import car from "@/assets/svgs/car.svg"
import cash from "@/assets/svgs/cash.svg"
import gift from "@/assets/svgs/gift.svg"
import form from "@/assets/svgs/form.svg"
import percent from "@/assets/svgs/percent.svg"

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

  return (
    <section className="bg-gray-50 text-black py-20 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-28">
        <div className="text-center mb-16">
          <h2 className="heading-secondary text-black mb-4">Auto Loans Made Simple, Fast, and Affordable</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Get behind the wheel faster with loan terms that match your budget and lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-sm shadow-sm">
              <div className="bg-gray-100 w-20 h-20 circle-container mb-6 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import invest from "@/assets/images/invest.png"

export default function WhyInvestSection() {
  const reasons = [
    {
      number: 1,
      title: "High Interest Rates",
      description: "Maximize your earnings with competitive returns.",
    },
    {
      number: 2,
      title: "Secure and Reliable",
      description: "Trust your savings and investments with our secure platform.",
    },
    {
      number: 3,
      title: "Flexible Options",
      description: "Choose investment plans that suit your needs and goals.",
    },
    {
      number: 4,
      title: "Easy to Manage",
      description: "Track your progress and manage your investments effortlessly online.",
    },
  ]

  return (
    <section className="bg-gray-50 text-black section-padding section-overflow-control">
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src={invest}
              alt="Money tree investment concept"
              width={500}
              height={600}
              className="shadow-lg"
            />
          </div>

          <div>
            <div className="section-title-red mb-4">INVEST BETTER, LIVE BRIGHTER</div>
            <h2 className="heading-secondary text-black mb-6">Why Invest with LiteFi?</h2>
            <p className="text-gray-600 mb-8">
              Discover a smarter, safer way to grow your money with flexible plans and competitive returns.
            </p>

            <div className="space-y-8">
              {reasons.map((reason, index) => (
                <div key={index} className="flex">
                  <div className="mr-6">
                    <div className="bg-white text-black w-8 h-8 circle-container flex items-center justify-center font-bold">
                      {reason.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{reason.title}</h3>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

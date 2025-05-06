"use client"

import Image from "next/image"
import image2 from "@/assets/images/image2.png"
import image3 from "@/assets/images/image3.png"
import image4 from "@/assets/images/image4.png"

export default function MoreSolutionsSection() {
  const solutions = [
    {
      title: "Personal Loans",
      description: "Access funds quickly for personal expenses, debt consolidation, and more.",
      image: image2,
    },
    {
      title: "Business Loans",
      description: "Obtain the capital necessary to start, grow, or manage your business.",
      image: image3,
    },
    {
      title: "Travel Loans",
      description: "Show that you have the funds together—fast, easy, and confidential.",
      image: image4,
    },
  ]

  return (
    <section className="bg-black text-white section-padding section-overflow-control">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-12">
          <div className="section-title-red mb-4">MORE OPTIONS, MORE FLEXIBILITY.</div>
          <h2 className="heading-secondary mb-6">Discover More Loan Solutions with LiteFi</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Beyond auto loans, LiteFi offers additional loan solutions to support your various financial needs:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-zinc-950 flex flex-col h-full items-center justify-center py-8">
              <div className="mx-auto mt-8 mb-6">
                <Image
                  src={solution.image}
                  alt={solution.title}
                  width={220}
                  height={120}
                  className="rounded"
                />
              </div>
              <div className="flex flex-col items-center text-center flex-grow px-4">
                <h3 className="font-semibold text-lg mb-2">{solution.title}</h3>
                <p className="text-gray-400 text-sm">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

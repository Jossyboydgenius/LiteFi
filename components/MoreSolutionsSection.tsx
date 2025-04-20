"use client"

import Image from "next/image"
import image2 from "@/assets/images/image2.png"
import image3 from "@/assets/images/image3.png"
import image4 from "@/assets/images/image4.png"
import { m } from "@/components/AnimationProvider"

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
      title: "Proof of Funds",
      description: "Show that you have the funds together—fast, easy, and confidential.",
      image: image4,
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20
      }
    }
  }

  return (
    <section className="bg-black text-white section-padding section-overflow-control">
      <div className="container mx-auto container-padding">
        <m.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-title-red mb-4">MORE OPTIONS, MORE FLEXIBILITY.</div>
          <h2 className="heading-secondary mb-6">Discover More Loan Solutions with LiteFi</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Beyond auto loans, LiteFi offers additional loan solutions to support your various financial needs:
          </p>
        </m.div>

        <m.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {solutions.map((solution, index) => (
            <m.div 
              key={index} 
              className="bg-zinc-950 flex flex-col h-full items-center justify-center py-8"
              variants={itemVariants}
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.3 }
              }}
            >
              <m.div
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                className="mx-auto mt-8 mb-6"
              >
                <Image
                  src={solution.image}
                  alt={solution.title}
                  width={220}
                  height={120}
                  className="rounded"
                />
              </m.div>
              <m.div 
                className="flex flex-col items-center text-center flex-grow px-4"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1, transition: { duration: 0.3 } }}
              >
                <h3 className="font-semibold text-lg mb-2">{solution.title}</h3>
                <p className="text-gray-400 text-sm">{solution.description}</p>
              </m.div>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}

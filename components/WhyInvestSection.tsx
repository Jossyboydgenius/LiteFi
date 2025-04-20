"use client"

import Image from "next/image"
import invest from "@/assets/images/invest.png"
import { motion } from "framer-motion"

export default function WhyInvestSection() {
  const reasons = [
    {
      number: 1,
      title: "High Interest Rates:",
      description: "Maximize your earnings with competitive returns.",
    },
    {
      number: 2,
      title: "Secure and Reliable:",
      description: "Trust your savings and investments with our secure platform.",
    },
    {
      number: 3,
      title: "Flexible Options:",
      description: "Choose investment plans that suit your needs and goals.",
    },
    {
      number: 4,
      title: "Easy to Manage:",
      description: "Track your progress and manage your investments effortlessly online.",
    },
  ]

  // Animation variants for the numbered items
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10
      }
    }
  }

  return (
    <section className="bg-gray-50 text-black section-padding">
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Image
              src={invest}
              alt="Money tree investment concept"
              width={500}
              height={600}
              className="shadow-lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="section-title-red mb-4">INVEST BETTER, LIVE BRIGHTER</div>
            <h2 className="heading-secondary text-black mb-6">Why Invest with LiteFi?</h2>
            <p className="text-gray-600 mb-8">
              Discover a smarter, safer way to grow your money with flexible plans and competitive returns.
            </p>

            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {reasons.map((reason, index) => (
                <motion.div 
                  key={index} 
                  className="flex"
                  variants={itemVariants}
                >
                  <div className="mr-6">
                    <motion.div 
                      className="bg-white text-black w-8 h-8 circle-container flex items-center justify-center font-bold"
                      whileHover={{ 
                        scale: 1.15, 
                        backgroundColor: "#dc2626", 
                        color: "#ffffff",
                        transition: { duration: 0.2 }
                      }}
                    >
                      {reason.number}
                    </motion.div>
                  </div>
                  <motion.div whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                    <h3 className="font-semibold mb-1">{reason.title}</h3>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

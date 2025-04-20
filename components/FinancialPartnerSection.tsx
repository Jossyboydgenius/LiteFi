"use client"

import { Button } from "@/components/ui/button"
import { m } from "@/components/AnimationProvider"

export default function FinancialPartnerSection() {
  return (
    <section className="bg-black text-white py-16 section-overflow-control">
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <m.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-bold text-3xl md:text-4xl leading-tight md:leading-tight text-left">
              Your All-in-One<br />Financial Partner
            </h2>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 50, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="text-gray-400 mb-6">
              With LiteFi, you can easily access quick loans using your car as collateral and grow your wealth through diverse investment opportunities. 
              Join thousands of Nigerians who trust LiteFi for a convenient and reliable financial experience.
            </p>
            <m.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
                Get Started
              </Button>
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  )
}

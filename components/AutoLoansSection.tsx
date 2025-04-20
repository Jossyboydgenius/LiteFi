"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import car from "@/assets/images/car.png"
import car1 from "@/assets/images/car1.png"
import image from "@/assets/images/image.png"
import { motion } from "framer-motion"

export default function AutoLoansSection() {
  return (
    <section 
      id="auto-loans" 
      className="bg-white text-black pt-[120px] pb-16 md:pt-[200px] md:pb-24"
    >
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="section-title-red mb-4">WHY CHOOSE LITEFI AUTO LOANS?</div>
            <h2 className="heading-secondary text-black mb-6">Unlock Instant Cash with Litefi Auto Loans</h2>
            <p className="text-gray-600 mb-8">
              Turn your car into instant cash with Litefi's fast and convenient auto loans. Whether you need funds for
              personal needs or business opportunities, use your car as collateral to secure a loan. Keep driving your
              car while accessing the funds you need quickly and easily. Our online application takes just minutes, with
              the potential for swift approval.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
                Get Started
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative">
            {/* Images layout arrangement */}
            <div className="relative w-full h-[540px]">
              {/* Car image (dark car in garage) positioned on the left */}
              <motion.div 
                className="absolute left-0 bottom-0 w-[55%] h-[80%] z-10"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Image
                  src={car}
                  alt="Dark car in garage"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Car1 image (white Mercedes with red/blue lighting) in top center/right */}
              <motion.div 
                className="absolute right-20 top-10 w-[50%] h-[50%] z-20"
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Image
                  src={car1}
                  alt="Mercedes in colored lighting"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Dashboard/laptop image positioned to the right with space between car image */}
              <motion.div 
                className="absolute right-0 bottom-0 w-[42%] h-[60%] z-30"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Image
                  src={image}
                  alt="Financial dashboard"
                  width={250}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

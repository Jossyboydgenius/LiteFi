import Image from "next/image"
import { Button } from "@/components/ui/button"
import car from "@/assets/images/car.png"
import car1 from "@/assets/images/car1.png"
import image from "@/assets/images/image.png"

export default function AutoLoansSection() {
  return (
    <section 
      id="auto-loans" 
      className="bg-white text-black pt-[120px] pb-16 md:pt-[200px] md:pb-24"
    >
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-title-red mb-4">WHY CHOOSE LITEFI AUTO LOANS?</div>
            <h2 className="heading-secondary text-black mb-6">Unlock Instant Cash with Litefi Auto Loans</h2>
            <p className="text-gray-600 mb-8">
              Turn your car into instant cash with Litefi's fast and convenient auto loans. Whether you need funds for
              personal needs or business opportunities, use your car as collateral to secure a loan. Keep driving your
              car while accessing the funds you need quickly and easily. Our online application takes just minutes, with
              the potential for swift approval.
            </p>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white no-radius px-8 py-3 h-auto text-base font-medium w-48">
              Get Started
            </Button>
          </div>

          <div className="relative">
            {/* Images layout arrangement */}
            <div className="relative w-full h-[540px]">
              {/* Car image (dark car in garage) positioned on the left */}
              <div className="absolute left-0 bottom-0 w-[55%] h-[80%] z-10">
                <Image
                  src={car}
                  alt="Dark car in garage"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Car1 image (white Mercedes with red/blue lighting) in top center/right */}
              <div className="absolute right-20 top-10 w-[50%] h-[50%] z-20">
                <Image
                  src={car1}
                  alt="Mercedes in colored lighting"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Dashboard/laptop image positioned to the right with space between car image */}
              <div className="absolute right-0 bottom-0 w-[42%] h-[60%] z-30">
                <Image
                  src={image}
                  alt="Financial dashboard"
                  width={250}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import AutoLoansSection from "@/components/AutoLoansSection"
import FeaturesSection from "@/components/FeaturesSection"
import InvestmentSection from "@/components/InvestmentSection"
import WhyInvestSection from "@/components/WhyInvestSection"
import CalculatorSection from "@/components/CalculatorSection"
import MoreSolutionsSection from "@/components/MoreSolutionsSection"
import FinancialPartnerSection from "@/components/FinancialPartnerSection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="dark-section">
        <Navbar />
        <HeroSection />
        <AutoLoansSection />
        <FeaturesSection />
        <InvestmentSection />
        <WhyInvestSection />
        <CalculatorSection />
        <MoreSolutionsSection />
        <FinancialPartnerSection />
        <Footer />
      </div>
    </main>
  )
}

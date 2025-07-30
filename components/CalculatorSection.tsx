"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"
import Image from "next/image"
import chart from "@/assets/svgs/chart.svg"
import calendarIcon from "@/assets/svgs/calendar.svg"
import Logo from "@/assets/svgs/logo.svg"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, addMonths } from "date-fns"
import { toPng } from 'html-to-image'

// Format number with commas as thousand separators
const formatNumberWithCommas = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface CalculationResult {
  principalAmount: number;
  interestRatePerMonth: number;
  tenureMonths: number;
  totalInterest: number;
  withholdingTax: number;
  actualPayout: number;
  totalAmount: number;
  formattedPrincipal: string;
  formattedTotalInterest: string;
  formattedWithholdingTax: string;
  formattedActualPayout: string;
  formattedTotalAmount: string;
}

export default function CalculatorSection() {
  const [investment, setInvestment] = useState(1000000)
  const [currency, setCurrency] = useState("NGN")
  const [tenure, setTenure] = useState("3 months")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Reference for the investment breakdown section
  const breakdownRef = useRef<HTMLDivElement>(null)
  
  // Interest rate is fixed at 2% per month
  const interestRatePerMonth = 2
  
  // Currency flag emoji mapping
  const currencyFlags = {
    NGN: "🇳🇬", // Nigeria
    GBP: "🇬🇧", // United Kingdom
    USD: "🇺🇸", // United States
    EUR: "🇪🇺", // European Union
  }

  // Handle start date change with native date picker
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setStartDate(new Date(value))
    } else {
      setStartDate(undefined)
    }
  }
  
  // Calculate maturity date based on start date and tenure
  const getMaturityDate = (): Date | null => {
    if (!startDate || !tenure) return null;
    const tenureMonths = parseInt(tenure.replace(' months', ''));
    return addMonths(startDate, tenureMonths);
  };
  
  // Calculate investment returns
  const calculateInvestment = async () => {
    setIsCalculating(true)
    try {
      const tenureMonths = parseInt(tenure.split(' ')[0])
      
      const response = await fetch('/api/investment-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investmentAmount: investment,
          interestRatePerMonth,
          tenureMonths,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to calculate investment')
      }
      
      const data = await response.json()
      setCalculationResult(data.calculation)
    } catch (error) {
      console.error('Error calculating investment:', error)
      // You could add toast notification here
    } finally {
      setIsCalculating(false)
    }
  }
  
  // Format investment input with thousand separators
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and parse as number
    const value = e.target.value.replace(/[^\d]/g, '')
    if (value) {
      setInvestment(parseInt(value, 10))
    } else {
      setInvestment(0)
    }
  }
  
  // Download investment breakdown as image
  const downloadBreakdownAsImage = async () => {
    if (breakdownRef.current) {
      try {
        const dataUrl = await toPng(breakdownRef.current, { 
          quality: 1.0,
          // Add these options to handle CORS issues
          skipFonts: true,
          fontEmbedCSS: '',
          imagePlaceholder: undefined,
          // Increase canvas size if needed
          pixelRatio: 2
        })
        const link = document.createElement('a')
        link.download = 'litefi-investment-breakdown.png'
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error generating image:', error)
      }
    }
  }

  return (
    <section id="calculator" className="bg-white text-black section-padding section-overflow-control">
      <div className="container mx-auto container-padding">
        <div className="text-left mb-16">
          <div className="section-title-red mb-4">PLAN YOUR INVESTMENT</div>
          <h2 className="heading-secondary text-black mb-4">Calculate Your Future Returns</h2>
          <p className="text-gray-600">
            Estimate your returns and plan your investments with confidence—see how your money can grow over time.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Calculator Input */}
            <div className="w-full sm:max-w-full md:max-w-xl lg:max-w-2xl mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
              <div className="bg-gray-50 p-5 sm:p-8 md:p-10 lg:p-12 rounded-sm h-full">
                <p className="text-sm text-gray-500 italic mb-10">
                  This is a simulation tool and results shown are estimates and do not guarantee actual returns.
                </p>

                <div className="mb-10">
                  <label className="block text-gray-600 mb-4">Principal Amount</label>
                  <div className="flex gap-4">
                    <div className="w-1/3 xs:w-full">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-white border-0 shadow-sm h-14 text-black flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="mr-2 text-base">{currencyFlags[currency as keyof typeof currencyFlags]}</span>
                            <span>{currency}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="NGN" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">
                            <div className="flex items-center">
                              <span className="mr-2 text-base">🇳🇬</span>
                              Naira
                            </div>
                          </SelectItem>
                          <SelectItem value="GBP" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">
                            <div className="flex items-center">
                              <span className="mr-2 text-base">🇬🇧</span>
                              GBP
                            </div>
                          </SelectItem>
                          <SelectItem value="USD" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">
                            <div className="flex items-center">
                              <span className="mr-2 text-base">🇺🇸</span>
                              USD
                            </div>
                          </SelectItem>
                          <SelectItem value="EUR" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">
                            <div className="flex items-center">
                              <span className="mr-2 text-base">🇪🇺</span>
                              EUR
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-2/3 xs:w-full">
                      <Input
                        type="text"
                        placeholder="Type in amount"
                        value={formatNumberWithCommas(investment)}
                        onChange={handleInvestmentChange}
                        className="bg-white border-0 shadow-sm focus:ring-0 text-right xs:text-left h-14 text-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="block text-gray-600 mb-4">Tenure</label>
                  <Select value={tenure} onValueChange={setTenure}>
                    <SelectTrigger className="bg-white border-0 shadow-sm h-14 text-black flex justify-between items-center">
                      <SelectValue placeholder="12 months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="3 months" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">3 months</SelectItem>
                      <SelectItem value="6 months" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">6 months</SelectItem>
                      <SelectItem value="12 months" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">12 months</SelectItem>
                      <SelectItem value="24 months" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-12">
                  <label className="block text-gray-600 mb-4">Start Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                      onChange={handleStartDateChange}
                      className="bg-white border-0 shadow-sm focus:ring-0 h-14 text-black"
                    />
                  </div>
                </div>

                <div>
                  <Button 
                    onClick={calculateInvestment}
                    disabled={isCalculating}
                    className="bg-red-600 hover:bg-red-700 text-white w-full h-16 text-base font-medium disabled:opacity-50"
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Investment Results */}
            <div className="w-full sm:max-w-full md:max-w-xl lg:max-w-2xl mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
              <div className="bg-white p-5 sm:p-10 rounded-sm h-full" ref={breakdownRef}>
                <div className="flex flex-col mb-8">
                  <div className="flex items-start mb-6">
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <Image 
                          src={Logo}
                          alt="LiteFi Logo" 
                          width={40} 
                          height={40}
                          className="w-10 h-10"
                        />
                      </div>
                      <span className="font-medium text-black">Litefi Investment</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between investment-data-row">
                    <div className="flex-1 mr-4">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold xs:text-xl">
                          {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                          {formatNumberWithCommas(calculationResult?.totalAmount || investment)}
                        </span>
                        <span className="text-green-500 text-sm xs:text-xs">
                          +{currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                          {formatNumberWithCommas(calculationResult?.actualPayout || 0)} 
                          ({calculationResult ? ((calculationResult.actualPayout / calculationResult.principalAmount) * 100).toFixed(1) : '0.0'}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end flex-shrink-0" style={{ width: '120px', height: '60px' }}>
                      <Image 
                        src={chart} 
                        alt="Investment chart" 
                        width={180} 
                        height={60}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-medium text-black mb-4">INVESTMENT BREAKDOWN</h3>
                  
                  {/* Add divider */}
                  <div className="h-px bg-gray-200 w-full my-4"></div>

                  <div className="space-y-7 xs:space-y-5">
                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Principal Amount</span>
                      <span className="font-bold text-black xs:text-base">
                        {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                        {formatNumberWithCommas(calculationResult?.principalAmount || investment)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Tenure</span>
                      <span className="font-bold text-black xs:text-base">{tenure}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Start Date</span>
                      <span className="font-bold text-black xs:text-base">{startDate ? format(startDate, "do MMMM yyyy") : "17th July 2025"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Maturity Date</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-sm">
                          Matured
                        </span>
                        <span className="font-bold text-black xs:text-base">
                          {getMaturityDate() ? format(getMaturityDate()!, "do MMMM yyyy") : "5th April 2026"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Earning</span>
                      <span className="font-bold text-black xs:text-base">
                        {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                        {formatNumberWithCommas(calculationResult?.actualPayout || 75000)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Withholding Tax</span>
                      <span className="font-bold text-black xs:text-base">
                        {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                        {formatNumberWithCommas(calculationResult?.withholdingTax || 2000)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Total Payouts</span>
                      <span className="font-bold text-black xs:text-base">
                        {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                        {formatNumberWithCommas(calculationResult?.totalAmount || 250000)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Download Button */}
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 mt-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={downloadBreakdownAsImage}
                >
                  <Download className="h-4 w-4" />
                  Download Investment Breakdown
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

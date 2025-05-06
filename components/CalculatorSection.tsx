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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse, isValid } from "date-fns"
import { toPng } from 'html-to-image'

// Format number with commas as thousand separators
const formatNumberWithCommas = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function CalculatorSection() {
  const [investment, setInvestment] = useState(100000)
  const [currency, setCurrency] = useState("EUR")
  const [tenure, setTenure] = useState("12 months")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startDateInput, setStartDateInput] = useState("")
  const [endDateInput, setEndDateInput] = useState("")
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  
  // Reference for the investment breakdown section
  const breakdownRef = useRef<HTMLDivElement>(null)
  
  // Currency flag emoji mapping
  const currencyFlags = {
    NGN: "🇳🇬", // Nigeria
    GBP: "🇬🇧", // United Kingdom
    USD: "🇺🇸", // United States
    EUR: "🇪🇺", // European Union
  }

  // Format the input as dd/mm/yyyy while typing
  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    
    // Format as dd/mm/yyyy
    if (digits.length <= 2) {
      return digits
    } else if (digits.length <= 4) {
      return `${digits.substring(0, 2)}/${digits.substring(2)}`
    } else {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`
    }
  }

  // Handle manual date input
  const handleStartDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Only allow formatted input
    const formattedValue = formatDateInput(value)
    setStartDateInput(formattedValue)
    
    // Try to parse the date if in correct format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formattedValue)) {
      try {
        const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date())
        if (isValid(parsedDate)) {
          setStartDate(parsedDate)
        }
      } catch (error) {
        // Invalid date format, do nothing
      }
    }
  }

  const handleEndDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Only allow formatted input
    const formattedValue = formatDateInput(value)
    setEndDateInput(formattedValue)
    
    // Try to parse the date if in correct format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formattedValue)) {
      try {
        const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date())
        if (isValid(parsedDate)) {
          setEndDate(parsedDate)
        }
      } catch (error) {
        // Invalid date format, do nothing
      }
    }
  }

  // Update input field when date is selected from calendar
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      setStartDateInput(format(date, "dd/MM/yyyy"))
    }
    setStartOpen(false) // Close the popover after selection
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      setEndDateInput(format(date, "dd/MM/yyyy"))
    }
    setEndOpen(false) // Close the popover after selection
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

                <div className="mb-10">
                  <label className="block text-gray-600 mb-4">Start Date</label>
                  <div className="relative">
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative cursor-pointer">
                          <Input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            value={startDateInput}
                            onChange={handleStartDateInput}
                            maxLength={10}
                            className="bg-white border-0 shadow-sm focus:ring-0 h-14 text-black pr-10"
                            onClick={() => setStartOpen(true)}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none calendar-icon">
                            <Image 
                              src={calendarIcon} 
                              alt="Calendar" 
                              width={20} 
                              height={20}
                              className="w-5 h-5"
                            />
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 bg-white shadow-lg border border-gray-200" 
                        align="start"
                      >
                        <div className="p-2 bg-white">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateSelect}
                            initialFocus
                            defaultMonth={new Date(2025, 3, 1)} // April 2025
                            className="text-black bg-white"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="mb-12">
                  <label className="block text-gray-600 mb-4">End Date</label>
                  <div className="relative">
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative cursor-pointer">
                          <Input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            value={endDateInput}
                            onChange={handleEndDateInput}
                            maxLength={10}
                            className="bg-white border-0 shadow-sm focus:ring-0 h-14 text-black pr-10"
                            onClick={() => setEndOpen(true)}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none calendar-icon">
                            <Image 
                              src={calendarIcon} 
                              alt="Calendar" 
                              width={20} 
                              height={20}
                              className="w-5 h-5"
                            />
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 bg-white shadow-lg border border-gray-200" 
                        align="start"
                      >
                        <div className="p-2 bg-white">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateSelect}
                            initialFocus
                            defaultMonth={new Date(2026, 3, 1)} // April 2026
                            className="text-black bg-white"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full h-16 text-base font-medium">
                    Calculate
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
                        <span className="text-2xl font-bold xs:text-xl">${formatNumberWithCommas(100000)}</span>
                        <span className="text-green-500 text-sm xs:text-xs">+$2.30 (+1.3%)</span>
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
                      <span className="font-bold text-black xs:text-base">{formatNumberWithCommas(100000)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Tenure</span>
                      <span className="font-bold text-black xs:text-base">12 months</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Start Date</span>
                      <span className="font-bold text-black xs:text-base">{startDate ? format(startDate, "do MMMM yyyy") : "5th April 2025"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Maturity Date</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-sm">
                          Matured
                        </span>
                        <span className="font-bold text-black xs:text-base">{endDate ? format(endDate, "do MMMM yyyy") : "5th April 2026"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Earning</span>
                      <span className="font-bold text-black xs:text-base">{formatNumberWithCommas(75000)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Withholding Tax</span>
                      <span className="font-bold text-black xs:text-base">{formatNumberWithCommas(2000)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 xs:text-sm">Total Payouts</span>
                      <span className="font-bold text-black xs:text-base">{formatNumberWithCommas(250000)}</span>
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

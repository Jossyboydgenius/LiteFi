"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import chart from "@/assets/images/chart.png"
import calendarIcon from "@/assets/svgs/calendar.svg"
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
import { motion } from "framer-motion"

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

  return (
    <section id="calculator" className="bg-white text-black section-padding">
      <div className="container mx-auto container-padding">
        <motion.div 
          className="text-left mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-title-red mb-4">PLAN YOUR INVESTMENT</div>
          <h2 className="heading-secondary text-black mb-4">Calculate Your Future Returns</h2>
          <p className="text-gray-600">
            Estimate your returns and plan your investments with confidence—see how your money can grow over time.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Calculator Input */}
            <motion.div 
              className="w-full sm:max-w-full md:max-w-xl lg:max-w-2xl mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
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
                          <SelectValue placeholder="EUR" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="NGN" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">Naira</SelectItem>
                          <SelectItem value="GBP" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">GBP</SelectItem>
                          <SelectItem value="USD" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">USD</SelectItem>
                          <SelectItem value="EUR" className="text-black data-[highlighted]:text-black data-[highlighted]:bg-zinc-100">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-2/3 xs:w-full">
                      <Input
                        type="text"
                        placeholder="Type in amount"
                        value={investment}
                        onChange={(e) => setInvestment(Number(e.target.value))}
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

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full h-16 text-base font-medium">
                    Calculate
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Investment Results */}
            <motion.div 
              className="w-full sm:max-w-full md:max-w-xl lg:max-w-2xl mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white p-5 sm:p-10 rounded-sm h-full">
                <div className="flex flex-col mb-8">
                  <div className="flex items-start mb-6">
                    <div className="flex items-center">
                      <div className="bg-black circle-container w-10 h-10 flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">LiteFi</span>
                      </div>
                      <span className="font-medium text-black">Litefi Investment</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">$100,000</span>
                      <span className="text-green-500 text-sm ml-2">+$2.30 (+1.3%)</span>
                    </div>
                    <div className="w-[180px] h-[60px] xs:w-[140px] xs:h-[40px] flex justify-end">
                      <Image 
                        src={chart} 
                        alt="Investment chart" 
                        width={180} 
                        height={60}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-medium text-black mb-8">INVESTMENT BREAKDOWN</h3>

                  <div className="space-y-7 xs:space-y-5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="font-bold text-black">100,000</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenure</span>
                      <span className="font-bold text-black">12 months</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span className="font-bold text-black">{startDate ? format(startDate, "do MMMM yyyy") : "5th April 2025"}</span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Maturity Date</span>
                      <div className="flex flex-col items-end">
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-sm mb-1 self-end">
                          Matured
                        </span>
                        <span className="font-bold text-black">{endDate ? format(endDate, "do MMMM yyyy") : "5th April 2026"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Earning</span>
                      <span className="font-bold text-black">75,000</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Withholding Tax</span>
                      <span className="font-bold text-black">2,000</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Payouts</span>
                      <span className="font-bold text-black">250,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

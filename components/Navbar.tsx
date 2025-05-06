"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import logo from "@/assets/images/logo.png"
import MobileSidebar from "./MobileSidebar"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  // Handle scroll events
  const handleScroll = useCallback(() => {
    // Handle scroll state
    if (window.scrollY > 10) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }

    // Determine active section based on scroll position
    const sections = {
      home: 0,
      products: document.getElementById("auto-loans")?.offsetTop || 0,
      calculator: document.getElementById("calculator")?.offsetTop || 0,
      contact: document.getElementById("footer")?.offsetTop || 0,
    }

    const scrollPosition = window.scrollY + 100

    if (scrollPosition >= sections.contact) {
      setActiveSection("contact")
    } else if (scrollPosition >= sections.calculator) {
      setActiveSection("calculator")
    } else if (scrollPosition >= sections.products) {
      setActiveSection("products")
    } else {
      setActiveSection("home")
    }

    // Close mobile menu on scroll
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobileMenuOpen])

  // Set up scroll event listener and check initial scroll position
  useEffect(() => {
    // Check initial scroll position when component mounts
    if (window.scrollY > 10) {
      setIsScrolled(true)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-gray-800" : "bg-black/50 backdrop-blur-sm"
      } py-4`}
    >
      <div className="container mx-auto container-padding flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src={logo} 
            alt="LiteFi Logo" 
            width={100} 
            height={30} 
            className="h-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          
          {/* Horizontal divider */}
          {/* <div className="h-8 w-0.5 bg-zinc-700 ml-6"></div>  */}
          
          <button
            onClick={() => scrollToSection("hero")}
            className={`text-sm hover:text-gray-300 transition-colors ${activeSection === "home" ? "font-bold text-white" : "font-normal text-gray-400"}`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("auto-loans")}
            className={`text-sm hover:text-gray-300 transition-colors ${activeSection === "products" ? "font-bold text-white" : "font-normal text-gray-400"}`}
          >
            Products
          </button>
          <button
            onClick={() => scrollToSection("calculator")}
            className={`text-sm hover:text-gray-300 transition-colors ${activeSection === "calculator" ? "font-bold text-white" : "font-normal text-gray-400"}`}
          >
            Investment Calculator
          </button>
          <button
            onClick={() => scrollToSection("footer")}
            className={`text-sm hover:text-gray-300 transition-colors ${activeSection === "contact" ? "font-bold text-white" : "font-normal text-gray-400"}`}
          >
            Contact Us
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="https://litefiwebapp.vercel.app/sign-up">
            <Button className="bg-red-600 hover:bg-red-700 text-white no-radius">Sign Up</Button>
          </Link>
          <Link href="https://litefiwebapp.vercel.app/login">
            <Button
              variant="outline"
              className="text-white border border-gray-700 hover:bg-white hover:text-black bg-black no-radius"
            >
              Log In
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Component */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        logo={logo}
      />
    </header>
  )
}

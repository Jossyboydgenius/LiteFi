import React from "react";
import Link from "next/link"; // Add import for Link
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  logo: any;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  activeSection,
  scrollToSection,
  logo,
}: MobileSidebarProps) {
  return (
    <>
      {/* Backdrop blur overlay when mobile menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Menu - Slide-in sidebar */}
      <div
        className={`fixed top-0 left-0 h-[100vh] w-[70%] bg-black z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ minHeight: "-webkit-fill-available" }}
      >
        <div className="flex flex-col h-full"> {/* Ensure flex container takes full height */}
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Image
              src={logo}
              alt="LiteFi Logo"
              width={80}
              height={24}
              className="h-auto"
            />
            <button onClick={onClose}>
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col p-4 space-y-6 bg-black">
            <button
              className={`text-left hover:text-gray-300 transition-colors ${
                activeSection === "home"
                  ? "font-bold text-white"
                  : "font-normal text-gray-400"
              }`}
              onClick={() => scrollToSection("hero")}
            >
              Home
            </button>
            <button
              className={`text-left hover:text-gray-300 transition-colors ${
                activeSection === "products"
                  ? "font-bold text-white"
                  : "font-normal text-gray-400"
              }`}
              onClick={() => scrollToSection("auto-loans")}
            >
              Products
            </button>
            <button
              className={`text-left hover:text-gray-300 transition-colors ${
                activeSection === "calculator"
                  ? "font-bold text-white"
                  : "font-normal text-gray-400"
              }`}
              onClick={() => scrollToSection("calculator")}
            >
              Investment Calculator
            </button>
            <button
              className={`text-left hover:text-gray-300 transition-colors ${
                activeSection === "contact"
                  ? "font-bold text-white"
                  : "font-normal text-gray-400"
              }`}
              onClick={() => scrollToSection("footer")}
            >
              Contact Us
            </button>
          </div>

          {/* Auth buttons - positioned at the bottom with margin-top: auto */}
          <div className="mt-auto p-4 space-y-3 mb-8 bg-black"> {/* mt-auto pushes this div to the bottom */} 
            <Link href="https://litefiwebapp.vercel.app/sign-up" className="w-full">
              <Button className="bg-red-600 hover:bg-red-700 text-white w-full">
                Sign Up
              </Button>
            </Link>
            <Link href="https://litefiwebapp.vercel.app/login" className="w-full">
              <Button
                variant="outline"
                className="text-white border-gray-700 hover:bg-white hover:text-black bg-black w-full"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
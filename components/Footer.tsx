import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { TikTokIcon } from "@/components/ui/TikTokIcon"
import { MapPin, Mail, Phone, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer id="footer" className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto container-padding">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">We won't share it with anyone, we promise.</p>
            <div className="relative flex w-full">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white text-gray-500 border-0 h-12 pr-20 rounded-none w-full" 
              />
              <Button className="bg-red-600 hover:bg-red-700 absolute right-1 top-1 h-10 rounded-none px-5">
                Sign Up
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  LiteFi Investment
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Salary Earner Loan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Working Capital Loan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Auto Loan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Travel Loan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">9A, Hospital Road, Gbagada, Lagos</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">loan@litefi.ng</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">+234 810 837 6447</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Monday - Friday:<br />
                  08.00 AM - 05.00 PM
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">LiteFi</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="https://www.facebook.com/litefing" target="_blank" rel="noopener noreferrer" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </Link>
              <Link href="https://x.com/LiteFiNG" target="_blank" rel="noopener noreferrer" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </Link>
              <Link href="https://www.linkedin.com/company/litefi-limited/" target="_blank" rel="noopener noreferrer" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </Link>
              <Link href="https://www.instagram.com/litefing/" target="_blank" rel="noopener noreferrer" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Instagram className="h-5 w-5 text-white" />
              </Link>
              <Link href="https://www.tiktok.com/@litefing" target="_blank" rel="noopener noreferrer" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <TikTokIcon className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">Copyright © 2025 LiteFi</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
              Terms & Services
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

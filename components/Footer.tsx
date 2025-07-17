import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react"
import { MapPin, Mail, Phone, Clock } from "lucide-react"
import Image from "next/image";

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
                <span className="text-gray-500 text-sm opacity-60 cursor-not-allowed flex items-center">
                  LiteFi Investment <span className="ml-2 text-xs bg-zinc-800 px-2 py-0.5 rounded">Coming Soon</span>
                </span>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Salary Earner Loan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Corporate Cash Loan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Auto Loan
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
              <Link href="#" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </Link>
              <Link href="#" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </Link>
              <Link href="#" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Youtube className="h-5 w-5 text-white" />
              </Link>
              <Link href="#" className="circle-container bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </Link>
            </div>
            <div className="flex justify-start">
              <img src="/assets/images/badge.png" alt="Badge" className="h-32 w-auto mt-2" />
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
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
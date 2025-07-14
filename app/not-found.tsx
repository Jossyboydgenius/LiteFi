import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import logoImage from '@/public/assets/images/logo.png';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image 
            src={logoImage} 
            alt="LiteFi Logo" 
            width={120}
            height={36}
            className="h-auto"
          />
        </div>

        {/* 404 Error */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-red-600">404</div>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Contact our support team:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <strong>Email:</strong> support@litefi.ng
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +234 (0) 800 123 4567
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-6">
          <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/login" className="text-red-600 hover:text-red-700 hover:underline">
              Login
            </Link>
            <Link href="/signup" className="text-red-600 hover:text-red-700 hover:underline">
              Sign Up
            </Link>
            <Link href="/about" className="text-red-600 hover:text-red-700 hover:underline">
              About Us
            </Link>
            <Link href="/contact" className="text-red-600 hover:text-red-700 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

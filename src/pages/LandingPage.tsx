
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, Users, Layers } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-32 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                NexCRM
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Powerful customer relationship management to boost engagement and drive growth
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-md px-8">
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Link to="/login">Live Demo</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/nexcrm.jpg" 
                  alt="CRM Dashboard Preview"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to manage your customer relationships
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Management</h3>
                <p className="text-gray-600">
                  Store and organize all your customer data in one place for easy access and management.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Audience Segmentation</h3>
                <p className="text-gray-600">
                  Create custom segments based on customer behavior, preferences, and purchase history.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Data Visualization</h3>
                <p className="text-gray-600">
                  Turn customer data into actionable insights with powerful analytics and reporting.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link to="/login" className="flex items-center">
                Start for free <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">NexCRM</h3>
              <p className="text-gray-600">Powerful CRM solution for businesses of all sizes.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Features</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Pricing</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">About</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Blog</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Help Center</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Contact</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>© 2025 NexCRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

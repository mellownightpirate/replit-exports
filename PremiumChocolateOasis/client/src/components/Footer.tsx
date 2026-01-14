import React from "react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { fairTradeLogo } from "@/lib/images";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-offwhite pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold heading text-watermelon tracking-wider">FREE BAR</h3>
              <span className="ml-2 bg-green text-offwhite text-[10px] px-2 py-1 rounded-md tracking-wide uppercase font-bold">For Palestine</span>
            </div>
            <p className="text-offwhite/80 mb-6">
              Premium chocolate that funds justice through ethical sourcing and 100% profit donations to Palestinian relief.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-offwhite hover:text-watermelon transition-colors duration-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-offwhite hover:text-watermelon transition-colors duration-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-offwhite hover:text-watermelon transition-colors duration-300">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-offwhite hover:text-watermelon transition-colors duration-300">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide text-gold">Shop</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> All Chocolate Bars
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Palestinian Collection
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Gift Boxes
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Monthly Subscription
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide text-gold">Our Mission</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> About FREE BAR
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Ethical Sourcing
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Our Impact Reports
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Partner Organizations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide text-gold">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-offwhite/80 hover:text-watermelon transition-colors duration-300 flex items-center">
                  <span className="mr-2">▹</span> Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mb-8 py-6 px-8 bg-dark/30 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-green rounded-full flex items-center justify-center text-offwhite text-3xl mr-4">
                ✓
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Certified Impact</div>
                <p className="text-offwhite/70 text-sm">
                  100% of profits verified by independent auditors
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <img src={fairTradeLogo} alt="Fair Trade Certified" className="h-12 w-auto bg-white p-1 rounded" />
              <div className="h-12 px-3 py-1 bg-green/80 text-white font-bold rounded flex items-center">PALESTINIAN FAIR TRADE</div>
              <div className="h-12 px-3 py-1 bg-watermelon/90 text-white font-bold rounded flex items-center">CERTIFIED ORGANIC</div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-offwhite/10 text-center">
          <p className="text-offwhite/60 text-sm">
            &copy; {new Date().getFullYear()} FREE BAR Chocolate. All rights reserved.
          </p>
          <div className="handwritten text-watermelon text-xl mt-4 bg-watermelon/10 inline-block px-6 py-2 rounded-lg">
            Sweet chocolate. Fair cause. Every bite is a stand for freedom.
          </div>
        </div>
      </div>
    </footer>
  );
};

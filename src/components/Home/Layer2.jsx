import React from 'react'
import Wayang from '../../assets/wayang.png'
import Model from '../../assets/Hero2.jpg'

const Layer2 = () => {
  return (
    <div className="w-full bg-white">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image section (responsive on mobile) */}
        <div className="w-full md:w-1/2 h-[300px] md:h-[600px]">
          <img 
            src={Model} 
            alt="Models showcasing batik fashion" 
            className="w-full h-full object-cover object-top"
          />
        </div>
        
        {/* Right side - Brand story section */}
        <div className="w-full md:w-1/2 bg-[#a67054] flex flex-col justify-center items-center p-8 md:p-16 h-[300px] md:h-[600px]">
          <div className="max-w-md mx-auto text-center">
            <img 
              src={Wayang}
              alt="Batik logo" 
              className="w-24 md:w-32 mb-4 md:mb-6 mx-auto"
            />
            
            <h2 className="text-2xl md:text-3xl font-medium text-white mb-3 md:mb-6">Our Brand Story</h2>
            
            <p className="text-white text-sm md:text-base leading-relaxed">
              We work hand-in-hand with local artisans, supporting traditional 
              communities and ensuring that the spirit of batik lives on. Each 
              motif, each color, and each thread speaks of Indonesia's rich legacy 
              — made with care, made with heart.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layer2
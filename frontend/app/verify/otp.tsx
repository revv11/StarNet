"use client"
import { useState } from "react";
import React, { useRef, KeyboardEvent } from 'react';
import { useRouter } from "next/navigation";








export default function OTPInput({ }) {

    const router = useRouter();
    const inputsRef = useRef<HTMLInputElement[]>(Array.from({ length: 4 }));
    const [otp, setOtp] = useState(["", "", "", ""]);
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && inputsRef.current[index - 1]) {
      if (e.currentTarget.value === '') {
        inputsRef.current[index - 1].focus();
      }
    }
  };
  const handleChange = (e:any, index:any, value:any) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
    
      document?.getElementById(`otp-${index + 1}`)?.focus();
    }

    
    
};
const handleSubmit = async () => {
    const otpCode = otp.join("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode }),
        credentials: "include",
      });
      const data = await response.json();
      console.log("OTP verification response:", data);
      router.push('/dashboard')

    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="flex gap-2 flex-col items-center justify-center">
        <div className="flex space-x-5">
            
        {otp.map((digit, index) => (
            <input
                ref={(el) => {
                    if (el) {
                    inputsRef.current[index] = el;
                    }
                }}
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-10 text-center border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
        ))}
        </div>
        <div className='mt-2 text-center md:mt-4'>
            <p className='md:text-[1.2rem]'>Didn’t get the code? <a href="#" className='text-[#0452D8] underline underline-offset-4'  >Click to resend</a></p>
        </div>
        <div className='text-center mt-8 flex flex-row w-[80%] justify-center'>
            <button  className='w-28 h-8 mr-8 text-center text-[#0452D8] border-2 border-[#0452D8] rounded-[0.2rem]' >Cancel</button>
            <button onClick={handleSubmit}  className='w-28 h-8 mb-4 text-center text-white bg-[#0452D8] border-2 border-[#3664AF] rounded-[0.2rem]' >Verify</button>
        </div>
    </div>
  );
}

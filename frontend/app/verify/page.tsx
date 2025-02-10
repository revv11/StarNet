
import OTPInput from "./otp"

export default function Verify(){
    return(
        <div className=' w-screen h-screen bg-slate-300 flex justify-center items-center'>
            <div className='bg-white h-[400px] w-[85%] flex flex-col justify-center items-center rounded-[0.9rem] md:h-[450px] md:w-[50%] lg:w-[39%] lg:h-[490px] lg:rounded-[1.5rem]'>
                <div className='text-center'>
                {/* <img src={emailLogo} alt='' className='h-16 w-16 mt-8 md:h-24 md:w-24' /> */}
          
            </div>
            <div className='mt-4 text-center'>
                <h2 className='font-semibold font-600 text-[1.2rem] h-8 md:text-[1.5rem]'>Please check your email</h2>
                <p className='mt-1 text-[1rem] font-normal md:text-[1.2rem]'>We’ve sent a code to your email</p>
            </div>
            <div className='text-center mt-8 flex flex-row w-full justify-center'>
                <OTPInput/>
            </div>
            
        </div>
      </div>
    )
}
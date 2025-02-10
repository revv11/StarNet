"use client"
import { createContext , useState, useEffect, useContext, ReactNode} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken"
import { Dispatch } from "react";


export interface User{
    id?:string,
    credits: number,
    isVerified?: boolean
    email?: string | null,
}

export interface ContextType{
    currentUser: User,
    setCurrentUser : Dispatch<any>
}



export const UserContext = createContext<any>({id:undefined})

export const useUserContext = (): ContextType=>{
    const context = useContext(UserContext);
    if(context === undefined){
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}

export const UserContextProvider = ({children}: {children: ReactNode})=>{
    const theme = Cookies.get("accessToken") ?? "";
    const session   = jwt.decode(theme) as User  // #to-do verify instead of decode 
    const userId = session?.id
    const [loading, setLoading] = useState(true)
    
    
    const [currentUser, setCurrentUser] = useState<ContextType | any>({id: userId })
    useEffect(()=>{
        async function setuser(){
            try{
                const existinguser = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`)
                const data = existinguser.data
                console.log(existinguser.data)
               
            
                setCurrentUser({id:data?.id, isVerified: data.isVerified, email: data.email, credits: data.credits})
                console.log(currentUser)
            }
            catch(e){
                console.log(e)
            }

            }
        setuser();
        setLoading(false)
    },[currentUser, userId])

    if(loading){
        return(
            <div className="h-full w-full text-white font-bold text-4xl flex items-center justify-center  bg-background dark">
                LOADING....
            </div>
        )
    }


    return(
        <UserContext.Provider value= {{currentUser, setCurrentUser}}>
            {children}
        </UserContext.Provider>
    )
}
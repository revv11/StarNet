import jwt from "jsonwebtoken"
import { NextResponse, NextRequest } from "next/server";


interface payloadSchema{
    id : string,
    isVerified : boolean,
    email: string,

}



export async function middleware(req: NextRequest,) {
    try{

        // Access cookies from the request
        const cookies = req.cookies; // Get the cookies object
        const sessionToken = cookies.get('accessToken'); // Get a specific cookie

     
        const url = req.nextUrl;
        if(url.pathname === ('/')){
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        // to protect dashboard pages
        if((!sessionToken || (sessionToken && !jwt.decode(sessionToken.value)))  &&   url.pathname.startsWith('/dashboard')){
            console.log(url.pathname.startsWith('/signup'))
            console.log("hulalalaalaa")
            return NextResponse.redirect(new URL('/signup', req.url))
        }
        //to protect login pages
        if(sessionToken && (jwt.decode(sessionToken.value)) && (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/verify')) ){
            console.log("cakkked")
            const jwtPayload = jwt.decode(sessionToken.value) as payloadSchema
            if(jwtPayload.isVerified === false){
                return NextResponse.redirect(new URL('/verify', req.url))
            }
            else{
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }

      
    }
    catch(e){
        console.log(e)
    }
    
    
    

 
}
export const config={
    matcher:[
        "/",
        "/dashboard/:path*",
        "/login",
        "/signup",
        "/api/messages/:path*",
        "/api/find", 
        
    ]
}
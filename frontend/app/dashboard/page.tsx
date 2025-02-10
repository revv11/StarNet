

"use client"
import { useState } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext";
import toast from "react-hot-toast";
import { CreditsLimitPopup } from "@/components/my/Popup";

const api = process.env.NEXT_PUBLIC_API_URL

interface cardContent{
    prompt: string,
    answer: string,
}

export default function AIStudio() {
    const router = useRouter()
    const [prompt, setPrompt] = useState("")
    const [msgq , setMsgq] = useState<cardContent[]>([])
    const [loading, setLoading] = useState(false)
    const {currentUser, setCurrentUser} = useUserContext()
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const openPopup = () => setIsPopupOpen(true)
    const closePopup = () => setIsPopupOpen(false)


   
    async function logout(){
        await axios.get(`${api}/logout`, {withCredentials: true})
        router.push('/signup')
    }

  async function handlegenerate(e: React.FormEvent){
    e.preventDefault()
    try{
        if(currentUser.credits>=1){

            setLoading(true)
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/searchdb`, {prompt}, {withCredentials: true})
            setMsgq([{ prompt, answer: res.data},...msgq ])
            setPrompt('')
            setCurrentUser({...currentUser, credits: currentUser.credits-1})
            setLoading(false)
        }
        else{
            openPopup()
            setLoading(false)
            toast.error("Credits Exhausted")
            console.log("credits exhausted")
        }

    }
    catch(e){
        toast.error("An error occured")
        setLoading(false)
        console.log(e)
    }

  }

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IujlIm9TAMkzbaJl6mtMHKOTQqmcdU.png"
              alt="AI Studio Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-lg text-white font-semibold">AI Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-blue-100/10 px-3 py-1 rounded-full">
              <span className="text-blue-500">{currentUser.credits} credits</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    {/* <AvatarFallback className="text-white">JC</AvatarFallback> */}
                  </Avatar>
                  <span className="hidden text-white md:inline">{currentUser.email}</span>
                  <ChevronDown className="h-4 text-white w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem> */}
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <div className="space-y-6">
            <form action="" method="POST" className="relative">
              <Textarea
                placeholder="Enter your prompt here..."
                className="min-h-[100px] text-white resize-none text-lg"
                value={prompt}
                onChange={(e:any) => setPrompt(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{prompt.length}/1000</span>
                {!loading? 
                <Button onClick={handlegenerate}>Generate</Button>:
                <Button disabled onClick={handlegenerate}>Generate</Button>
                }
              </div>
            </form>

            {/* Results Section */}
            <div className="space-y-4">
              <h2 className="text-xl text-white font-semibold">Generated Results</h2>
                <div className="h-[calc(100vh-320px)] overflow-y-scroll flex flex-col space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-rounded ">
                    
                        {/* Result Card */}
                        {msgq.map((msg, _id)=>(
                            <Card key={_id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">2 minutes ago</div>
                                    <h3 className="font-medium">{msg.prompt}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {msg.answer}
                                    </p>
                                    </div>
                                </div>
                            </Card>

                        ))}

                        {/* Another Result Card */}
                        
                  

                </div>
            </div>
          </div>
        </main>
      </div>
      <CreditsLimitPopup isOpen={isPopupOpen} onClose={closePopup} />
    </div>
  )
}


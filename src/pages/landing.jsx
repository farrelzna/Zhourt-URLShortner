import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const LandingPage = () => {

  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate(); 

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) {
      navigate(`/auth?createNew=${longUrl}`);
    }
  }

  return (
    <div className="flex flex-col items-center mt-20 px-4">
      <h2 className="my-10 sm:my-16 text-3xl sm:text-5xl lg:text-7xl font-semibold text-center">
        The only URL Shortner <br /> you'll ever need
      </h2>
      <form onSubmit={handleShorten} className="sm:h-14 flex flex-col sm:flex-row gap-3 w-full md:w-2/4">
        <Input
          type="url"
          value={longUrl}
          placeholder="Enter your LOOoooongg URL"
          onChange={(e) => setLongUrl(e.target.value)}
          className="h-full flex-1 py-4 px-4"
        />
        <Button className="h-full" type="submit" variant="destructive">Shorten!</Button>
      </form>
      <img src="banner.png" alt="" className="w-full my-11 md:px-11" />
      <Accordion type="multiple" collapsible="true" className="w-full md:w-2/4 md:px-11">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does the Zhourt works?</AccordionTrigger>
          <AccordionContent>
            When you enter a long URL into the input field and click the "Shorten!" button, Zhourt generates a unique, shorter URL that redirects to the original long URL. This shorter URL is easier to share and remember.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Do i need an account to use Zhourt?</AccordionTrigger>
          <AccordionContent>
            Yes, you need to create an account to use Zhourt. Creating an account allows you to manage your shortened URLs, track their performance, and access additional features such as custom aliases and link expiration.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is the difference between Zhourt and other URL shorteners?</AccordionTrigger>
          <AccordionContent>
            Zhourt offers a user-friendly interface, robust link management features, and advanced analytics to help you track the performance of your shortened URLs. Additionally, Zhourt prioritizes security and privacy, ensuring that your data is protected.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default LandingPage
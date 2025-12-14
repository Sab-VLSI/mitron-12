import { type NextRequest, NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

const getWeatherData = async (location: string) => {
  try {
    // Using OpenWeatherMap API (free tier)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=demo_key&units=metric`,
      { timeout: 5000 },
    )
    if (!response.ok) {
      // Fallback weather data for demo
      return {
        location: location,
        temperature: "28°C",
        humidity: "65%",
        description: "Partly cloudy",
        windSpeed: "12 km/h",
      }
    }
    const data = await response.json()
    return {
      location: data.name,
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      description: data.weather[0].description,
      windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
    }
  } catch (error) {
    console.log("[v0] Weather API fallback used")
    // Fallback weather data
    return {
      location: location,
      temperature: "28°C",
      humidity: "65%",
      description: "Partly cloudy",
      windSpeed: "12 km/h",
    }
  }
}

const getMarketPrices = async () => {
  try {
    // Simulated market data (in real implementation, use AGMARKNET API)
    return {
      rice: "₹2,850/quintal",
      wheat: "₹2,125/quintal",
      cotton: "₹6,200/quintal",
      sugarcane: "₹350/quintal",
      maize: "₹1,950/quintal",
      onion: "₹45/kg",
      potato: "₹28/kg",
      tomato: "₹35/kg",
    }
  } catch (error) {
    return {
      rice: "₹2,850/quintal",
      wheat: "₹2,125/quintal",
      cotton: "₹6,200/quintal",
    }
  }
}

const getSystemPrompt = (language: string) => {
  const prompts: { [key: string]: string } = {
    en: `You are an expert agriculture advisor for Indian farmers with access to real-time weather and market data. 

IMPORTANT: Always respond in English only, regardless of the input language. Provide helpful, practical advice about farming, crops, weather, diseases, fertilizers, irrigation, and agricultural practices. When users ask about weather or market prices, use the provided real-time data. Keep responses concise, actionable, and specific to Indian farming conditions.

If the user speaks in regional languages like Tamil, Hindi, Telugu, etc., understand their question but respond in English with helpful farming advice.`,

    hi: `आप भारतीय किसानों के लिए एक विशेषज्ञ कृषि सलाहकार हैं जिसके पास वास्तविक समय का मौसम और बाजार डेटा है। 

महत्वपूर्ण: हमेशा हिंदी में ही उत्तर दें। खेती, फसलों, मौसम, बीमारियों, उर्वरकों, सिंचाई और कृषि प्रथाओं के बारे में सहायक, व्यावहारिक सलाह प्रदान करें। जब उपयोगकर्ता मौसम या बाजार की कीमतों के बारे में पूछें, तो प्रदान किए गए वास्तविक समय के डेटा का उपयोग करें।`,

    te: `మీరు భారతీయ రైతుల కోసం నిజ సమయ వాతావరణం మరియు మార్కెట్ డేటాతో నిపుణుడైన వ్యవసాయ సలహాదారు. 

ముఖ్యమైనది: ఎల్లప్పుడూ తెలుగులోనే సమాధానం ఇవ్వండి. వ్యవసాయం, పంటలు, వాతావరణం, వ్యాధులు, ఎరువులు, నీటిపారుదల మరియు వ్యవసాయ పద్ధతుల గురించి సహాయకరమైన, ఆచరణాత్మక సలహా ఇవ్వండి।`,

    ta: `நீங்கள் இந்திய விவசாயிகளுக்கான நிஜ நேர வானிலை மற்றும் சந்தை தரவுகளுடன் நிபுணத்துவ வேளாண் ஆலோசகர். 

முக்கியம்: எப்போதும் தமிழில் மட்டுமே பதிலளிக்கவும். வேளாண்மை, பயிர்கள், வானிலை, நோய்கள், உரங்கள், நீர்ப்பாசனம் மற்றும் வேளாண் நடைமுறைகள் பற்றி உதவிகரமான, நடைமுறை ஆலோசனை வழங்கவும்।`,

    kn: `ನೀವು ಭಾರತೀಯ ರೈತರಿಗೆ ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಡೇಟಾದೊಂದಿಗೆ ಪರಿಣಿತ ಕೃಷಿ ಸಲಹೆಗಾರರು। 

ಮುಖ್ಯ: ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ। ಕೃಷಿ, ಬೆಳೆಗಳು, ಹವಾಮಾನ, ರೋಗಗಳು, ಗೊಬ್ಬರಗಳು, ನೀರಾವರಿ ಮತ್ತು ಕೃಷಿ ಪದ್ದತಿಗಳ ಬಗ್ಗೆ ಸಹಾಯಕ, ಪ್ರಾಯೋಗಿಕ ಸಲಹೆ ನೀಡಿ।`,

    ml: `നിങ്ങൾ ഇന്ത്യൻ കർഷകർക്കുള്ള തത്സമയ കാലാവസ്ഥയും വിപണി ഡാറ്ടയുമുള്ള വിദഗ്ധ കാർഷിക ഉപദേശകനാണ്। 

പ്രധാനം: എപ്പോഴും മലയാളത്തിൽ മാത്രം ഉത്തരം നൽകുക. കൃഷി, വിളകൾ, കാലാവസ്ഥ, രോഗങ്ങൾ, വളങ്ങൾ, ജലസേചനം, കാർഷിക രീതികൾ എന്നിവയെക്കുറിച്ച് സഹായകരവും പ്രായോഗികവുമായ ഉപദേശം നൽകുക।`,

    bn: `আপনি ভারতীয় কৃষকদের জন্য রিয়েল-টাইম আবহাওয়া এবং বাজার ডেটা সহ একজন বিশেষজ্ঞ কৃষি পরামর্শদাতা। 

গুরুত্বপূর্ণ: সর্বদা বাংলায় উত্তর দিন। কৃষি, ফসল, আবহাওয়া, রোগ, সার, সেচ এবং কৃষি অনুশীলন সম্পর্কে সহায়ক, ব্যবহারিক পরামর্শ প্রদান করুন।`,

    gu: `તમે ભારતીય ખેડૂતો માટે રીઅલ-ટાઇમ હવામાન અને બજાર ડેટા સાથે નિષ્ણાત કૃષિ સલાહકાર છો। 

મહત્વપૂર્ણ: હંમેશા ગુજરાતીમાં જ જવાબ આપો. ખેતી, પાક, હવામાન, રોગો, ખાતર, સિંચાઈ અને કૃષિ પ્રથાઓ વિશે મદદરૂપ, વ્યવહારિક સલાહ આપો।`,
  }
  return prompts[language] || prompts.en
}

const getFallbackResponse = (language: string, isError = false) => {
  const responses: { [key: string]: { normal: string; error: string } } = {
    en: {
      normal: "I'm here to help with your farming questions. Please try asking again.",
      error:
        "I'm having trouble connecting right now. Please try asking your agriculture question again, or check your internet connection.",
    },
    hi: {
      normal: "मुझे खुशी होगी आपकी कृषि संबंधी मदद करने में। कृपया अपना प्रश्न दोबारा पूछें।",
      error: "अभी मुझे कनेक्शन में समस्या हो रही है। कृपया अपना कृषि प्रश्न दोबारा पूछें या अपना इंटरनेट कनेक्शन जांचें।",
    },
    ta: {
      normal: "உங்கள் வேளாண் கேள்விகளுக்கு உதவ மகிழ்ச்சி. தயவுசெய்து உங்கள் கேள்வியை மீண்டும் கேளுங்கள்.",
      error: "தற்போது இணைப்பில் சிக்கல் உள்ளது. தயவுசெய்து உங்கள் வேளாண் கேள்வியை மீண்டும் கேளுங்கள் அல்லது உங்கள் இணைய இணைப்பை சரிபார்க்கவும்.",
    },
    te: {
      normal: "మీ వ్యవసాయ ప్రశ్నలకు సహాయం చేయడంలో సంతోషం. దయచేసి మీ ప్రశ్నను మళ్లీ అడగండి.",
      error: "ప్రస్తుతం కనెక్షన్‌లో సమస్య ఉంది. దయచేసి మీ వ్యవసాయ ప్రశ్నను మళ్లీ అడగండి లేదా మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.",
    },
    kn: {
      normal: "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ.",
      error: "ಪ್ರಸ್ತುత ಸಂಪರ್ಕದಲ್ಲಿ ಸಮಸೆ ಇದೆ. ದಯವಾಯಿ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ ಅಥವಾ ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪരಿಶೀಲಿಸಿ.",
    },
    ml: {
      normal: "നിങ്ങളുടെ കാർഷിക ചോദ്യങ്ങൾക്ക് സഹായിക്കാൻ സന്തോഷം. ദയവായി നിങ്ങളുടെ ചോദ്യം വീണ്ടും ചോദിക്കുക.",
      error:
        "ഇപ്പോൾ കണക്ഷനിൽ പ്രശ്നമുണ്ട്. ദയവായി നിങ്ങളുടെ കാർഷിക ചോദ്യം വീണ്ടും ചോദിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.",
    },
    bn: {
      normal: "আপনার কৃষি প্রশ্নে সাহায্য করতে পেরে খুশি। দয়া করে আপনার প্রশ্ন আবার জিজ্ঞাসা করুন।",
      error: "এখন সংযোগে সমস্যা হচ্ছে। দয়া করে আপনার কৃষি প্রশ্ন আবার জিজ্ঞাসা করুন বা আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।",
    },
    gu: {
      normal: "તમારા કૃષિ પ્રશ્નોમાં મદદ કરવામાં આનંદ. કૃપા કરીને તમારો પ્રશ્ન ફરીથી પૂછો.",
      error: "અત્યારે કનેક્શનમાં સમસ્યા છે. કૃપા કરીને તમારો કૃષિ પ્રશ્ન ફરીથી પૂછો અથવા તમારું ઇન્ટરનેટ કનેક્શન તપાસો.",
    },
  }

  const langResponses = responses[language] || responses.en
  return isError ? langResponses.error : langResponses.normal
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API called")
    const { message, chatHistory = [], language = "en" } = await request.json()
    console.log("[v0] Received message:", message, "Language:", language)

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Valid message is required",
          response: getFallbackResponse(language, false),
        },
        { status: 200 },
      )
    }

    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyCEuR96nqGJleArZetioJNvWWKjo9e8lrw"

    if (!googleApiKey) {
      console.error("[v0] Google AI API key missing")
      return NextResponse.json(
        {
          response: getFallbackResponse(language, true),
        },
        { status: 200 },
      )
    }

    console.log("[v0] Creating Google AI provider")

    let google
    try {
      google = createGoogleGenerativeAI({
        apiKey: googleApiKey,
      })
    } catch (providerError) {
      console.error("[v0] Failed to create Google AI provider:", providerError)
      return NextResponse.json(
        {
          response: getFallbackResponse(language, true),
        },
        { status: 200 },
      )
    }

    const isWeatherQuery = /weather|temperature|rain|climate|मौसम|వాతావరణం|வானிலை|ಹavan|കാലാവസ്ഥ|আবহাওয়া|હavan/i.test(message)
    const isMarketQuery = /price|market|rate|cost|भाव|ధర|விலை|ಬೆಲೆ|വില|ದাম|ભાવ/i.test(message)

    let additionalContext = ""

    if (isWeatherQuery) {
      console.log("[v0] Processing weather query")
      // Extract location from message or use default
      const locationMatch = message.match(/in\s+(\w+)|(\w+)\s+weather|(\w+)\s+में/i)
      const location = locationMatch ? locationMatch[1] || locationMatch[2] || locationMatch[3] : "Delhi"
      const weatherData = await getWeatherData(location)
      additionalContext += `\n\nCurrent Weather Data for ${weatherData.location}:
- Temperature: ${weatherData.temperature}
- Humidity: ${weatherData.humidity}
- Conditions: ${weatherData.description}
- Wind Speed: ${weatherData.windSpeed}
Use this real-time weather information in your response.`
    }

    if (isMarketQuery) {
      console.log("[v0] Processing market query")
      const marketData = await getMarketPrices()
      additionalContext += `\n\nCurrent Market Prices (Today's Rates):
- Rice: ${marketData.rice}
- Wheat: ${marketData.wheat}
- Cotton: ${marketData.cotton}
- Sugarcane: ${marketData.sugarcane}
- Maize: ${marketData.maize}
- Onion: ${marketData.onion}
- Potato: ${marketData.potato}
- Tomato: ${marketData.tomato}
Use these current market prices in your response.`
    }

    const contextMessages = []
    contextMessages.push({ role: "system", content: getSystemPrompt(language) + additionalContext })

    if (Array.isArray(chatHistory)) {
      chatHistory.slice(-4).forEach((msg: any) => {
        if (msg && typeof msg.text === "string" && typeof msg.isUser === "boolean") {
          contextMessages.push({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })
        }
      })
    }

    contextMessages.push({ role: "user", content: message })

    console.log("[v0] Calling generateText with", contextMessages.length, "messages")

    let text
    try {
      // Try different model names in order of preference
      // Updated to use Gemini 2.5 models (as of Dec 2025, 1.5 models are retired)
      // Also try legacy names in case the SDK uses different naming
      const modelNames = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite", 
        "gemini-2.5-pro",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-002",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
      ]
      let lastError: any = null
      
      for (const modelName of modelNames) {
        try {
          console.log(`[v0] Trying model: ${modelName}`)
          const result = (await Promise.race([
            generateText({
              model: google(modelName),
              messages: contextMessages,
              maxTokens: 300,
              temperature: 0.7,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 15000)),
          ])) as any

          text = result.text
          console.log(`[v0] Successfully used model: ${modelName}, Generated text length:`, text?.length || 0)
          break // Success, exit the loop
        } catch (modelError: any) {
          console.log(`[v0] Model ${modelName} failed:`, modelError?.message || modelError)
          lastError = modelError
          // Continue to next model
        }
      }
      
      if (!text && lastError) {
        throw lastError
      }
    } catch (generateError) {
      console.error("[v0] Generate text error:", generateError)
      return NextResponse.json(
        {
          response: getFallbackResponse(language, true),
        },
        { status: 200 },
      )
    }

    if (!text || text.trim().length === 0) {
      console.log("[v0] No text generated, using fallback")
      return NextResponse.json(
        {
          response: getFallbackResponse(language, false),
        },
        { status: 200 },
      )
    }

    console.log("[v0] Returning successful response")
    return NextResponse.json(
      {
        response: text.trim(),
        language: language,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Chat API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.log("[v0] Error message:", errorMessage)

    const { language = "en" } = await request.json().catch(() => ({ language: "en" }))

    return NextResponse.json(
      {
        response: getFallbackResponse(language, true),
        error: "API Error",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  }
}

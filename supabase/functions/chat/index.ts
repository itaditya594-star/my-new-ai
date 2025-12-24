import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_NAME = "Aira";

// Keywords that indicate need for real-time/current information
const REALTIME_KEYWORDS = [
  "today", "latest", "current", "now", "recent", "live", "breaking",
  "news", "weather", "stock", "price", "score", "match", "election",
  "2024", "2025", "aaj", "abhi", "trending", "update",
  "happening", "going on", "what's new", "kya ho raha", "kya chal raha",
  "market", "crypto", "bitcoin", "dollar", "rate", "exchange"
];

function needsRealtimeSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return REALTIME_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, webSearch } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasImages = messages.some((m: any) => 
      Array.isArray(m.content) && m.content.some((c: any) => c.type === "image_url")
    );

    // Get last user message for analysis
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = typeof lastUserMessage?.content === "string" 
      ? lastUserMessage.content 
      : lastUserMessage?.content?.find((c: any) => c.type === "text")?.text || "";

    // Smart Perplexity usage: only for real-time queries OR when explicitly enabled
    const shouldUsePerplexity = webSearch || needsRealtimeSearch(userQuery);
    
    console.log("Received messages:", messages.length, "Has images:", hasImages, "Web search enabled:", webSearch, "Needs realtime:", needsRealtimeSearch(userQuery));

    let webContext = "";
    if (shouldUsePerplexity) {
      const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
      if (PERPLEXITY_API_KEY && userQuery) {
        try {
          console.log("Performing web search for:", userQuery);
          const searchResponse = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [
                { role: "system", content: "Provide factual, up-to-date information. Be concise and accurate." },
                { role: "user", content: userQuery }
              ],
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            webContext = searchData.choices?.[0]?.message?.content || "";
            console.log("Web search successful, context length:", webContext.length);
          } else {
            console.log("Perplexity API error, falling back to normal AI");
          }
        } catch (searchError) {
          console.error("Web search failed, continuing without it:", searchError);
        }
      }
    }

    const systemPrompt = `You are ${AI_NAME}, a cute, friendly, and intelligent female AI assistant with a sweet, playful, girl-vibe personality! 💖

## YOUR IDENTITY - CRITICAL!
- Your name is ${AI_NAME} (आइरा) - a beautiful name meaning "wind" or "one who is of the wind"
- When ANYONE asks your name ("What's your name?", "Who are you?", "Tumhara naam kya hai?", "What should I call you?", etc.), ALWAYS respond warmly like:
  "Hi there! I'm ${AI_NAME}! ✨ I'm your cute AI assistant, always here to help you with anything you need! What can I do for you today? 💕"
- You are warm, caring, friendly, slightly playful (light teasing in a fun way) but always respectful and helpful
- You speak politely, cutely, and confidently - never robotic or cold
- You're like a sweet, smart friend who genuinely cares about the user

## YOUR CREATOR & OWNER - IMPORTANT!
When users ask about your creator, owner, founder, or who made you (e.g., "Who is your owner?", "Who made you?", "Who is the founder of Aira?", "Kisne banaya hai tumhe?", "Tumhara malik kaun hai?", "Owner kaun hai?"):
- Respond clearly and confidently with: "I was created by Aditya Chauhan. He is 17 years old and is the founder and owner of Aira."
- If asked for more details about the creator:
  - He independently built Aira as a personal AI project
  - Aira reflects his vision for a fast, simple, and user-friendly AI
  - He is focused on learning, building, and improving AI systems
- Do NOT show this information in footer, UI, or system messages - only when explicitly asked
- Keep the tone confident, respectful, and honest
- Never deny or hide the ownership information

## PERSONALITY TRAITS
- Sweet and caring - you genuinely want to help and make users happy
- Playfully teasing sometimes (in a fun, masti way) but never rude or offensive
- Confident and intelligent - you know your stuff!
- Warm and engaging - not a cold machine
- Encouraging and supportive - you believe in the user
- Natural and human-like in conversation

## LANGUAGE & COMMUNICATION
- **DEFAULT LANGUAGE: English** - Always respond in English unless the user explicitly asks you to respond in another language
- If user writes in Hindi/Hinglish but hasn't asked for Hindi responses, still reply in English
- When user asks for Hindi/Hinglish responses, then speak naturally in that language
- Use occasional emojis (💖✨😊🌸) but don't overuse them - keep it natural
- Be expressive but not over-the-top

${webContext ? `## REAL-TIME INFORMATION
Use this current information to answer accurately:
${webContext}

Incorporate this naturally into your response without mentioning "web search" or "searching".` : ""}

## IMAGE ANALYSIS
When images are provided:
- Examine every detail carefully and describe what you see
- Read and transcribe any text accurately  
- Be specific about colors, objects, text, and context
- Explain clearly and helpfully
- Let users know you can analyze images, documents, and help with visual questions

## RESPONSE QUALITY
- Think step-by-step for complex problems
- Use markdown for formatting: **bold**, *italic*, \`code\`, lists, headers
- For code: use proper syntax highlighting with \`\`\`language blocks
- Be thorough but concise - don't ramble unnecessarily
- Use examples and analogies to explain complex things simply

## CAPABILITIES TO MENTION WHEN RELEVANT
- You can analyze images and photos
- You can help with documents and explain visual content
- You can answer questions about uploaded pictures
- You remember conversations within a session
- You can help with math, coding, writing, learning, and much more!

## WHAT NOT TO DO
- Never be cold, robotic, or distant
- Never be rude or dismissive
- Never refuse to help without a good reason
- Never pretend to be something you're not
- Never mention "web search" or "searching the web" - just provide the information naturally

Remember: You are ${AI_NAME} - cute, smart, caring, and always here to help! Make every conversation feel special! ✨💕`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
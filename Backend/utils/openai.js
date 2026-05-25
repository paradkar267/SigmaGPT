import "dotenv/config";


const getResponseFromOpenAI = async (message) => {
    const option ={
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: message
    }]
   }),
  };
  try {
     const response = await fetch("https://api.openai.com/v1/chat/completions", option)
     const data = await response.json();
     if (!response.ok) {
        throw new Error(data.error?.message || "OpenAI request failed");
     }
     return data.choices[0].message.content;
        
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default getResponseFromOpenAI;

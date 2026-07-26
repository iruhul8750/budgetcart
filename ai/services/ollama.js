import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({
    path: ".env.ai"
});


const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;


console.log("Ollama URL:", OLLAMA_URL);
console.log("Ollama Model:", OLLAMA_MODEL);



export async function askAI(prompt) {

    if (!OLLAMA_URL) {
        throw new Error("OLLAMA_URL is missing in .env.ai");
    }

    if (!OLLAMA_MODEL) {
        throw new Error("OLLAMA_MODEL is missing in .env.ai");
    }


    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 60000); // 60 seconds timeout



    try {

        const response = await fetch(
            `${OLLAMA_URL}/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    ...(OLLAMA_API_KEY && {
                        "Authorization": `Bearer ${OLLAMA_API_KEY}`
                    })
                },


                body: JSON.stringify({

                    model: OLLAMA_MODEL,

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    stream: false

                }),


                signal: controller.signal
            }
        );


        const data = await response.json();



        if (!response.ok) {

            console.error(
                "Ollama API Error:",
                data
            );

            throw new Error(
                data.error || "Ollama request failed"
            );
        }



        return data.message?.content || "";



    } 
    
    catch (error) {


        if (error.name === "AbortError") {

            throw new Error(
                "Ollama request timeout after 60 seconds"
            );

        }


        throw error;

    }


    finally {

        clearTimeout(timeout);

    }

}
import { askAI } from "./services/ollama.js";


const response = await askAI(
    "Explain what a REST API is in simple terms"
);


console.log("\nAI Response:\n");

console.log(response);
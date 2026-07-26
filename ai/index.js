import collectContext from "./services/context.js";
import askAI from "./services/ollama.js";
import applyEdits from "./services/applyEdits.js";
import verifyRepair from "./services/build.js";


async function main(){

  console.log(
    "🤖 BudgetCart AI Repair Agent"
  );


  const context =
    await collectContext();


  const aiResult =
    await askAI(context);


  await applyEdits(aiResult);


  const verification =
    await verifyRepair();


  console.log(
    verification
  );

}


main();
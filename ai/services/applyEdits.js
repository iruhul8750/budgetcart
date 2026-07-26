import fs from "fs-extra";

function replaceOperation(content, change) {
  if (!content.includes(change.find)) {
    throw new Error(
      `Replace failed. Text not found in ${change.file}\n\n${change.find}`
    );
  }

  return content.replace(change.find, change.replace);
}

function insertAfterOperation(content, change) {
  if (!content.includes(change.after)) {
    throw new Error(
      `InsertAfter failed. Text not found in ${change.file}\n\n${change.after}`
    );
  }

  return content.replace(
    change.after,
    `${change.after}\n${change.content}`
  );
}

function insertBeforeOperation(content, change) {
  if (!content.includes(change.before)) {
    throw new Error(
      `InsertBefore failed. Text not found in ${change.file}\n\n${change.before}`
    );
  }

  return content.replace(
    change.before,
    `${change.content}\n${change.before}`
  );
}

function deleteOperation(content, change) {
  if (!content.includes(change.find)) {
    throw new Error(
      `Delete failed. Text not found in ${change.file}\n\n${change.find}`
    );
  }

  return content.replace(change.find, "");
}

async function applyChange(change) {
  if (!(await fs.pathExists(change.file))) {
    throw new Error(`File not found: ${change.file}`);
  }

  let content = await fs.readFile(change.file, "utf8");

  switch (change.type) {
    case "replace":
      content = replaceOperation(content, change);
      break;

    case "insert_after":
      content = insertAfterOperation(content, change);
      break;

    case "insert_before":
      content = insertBeforeOperation(content, change);
      break;

    case "delete":
      content = deleteOperation(content, change);
      break;

    default:
      throw new Error(`Unsupported operation: ${change.type}`);
  }

  await fs.writeFile(change.file, content, "utf8");

  console.log(`✓ Updated ${change.file}`);
}

export default async function applyEdits(aiResponse) {
  if (!aiResponse?.changes?.length) {
    throw new Error("No changes returned by AI.");
  }

  for (const change of aiResponse.changes) {
    await applyChange(change);
  }

  console.log("\n✓ All AI edits applied successfully.");
}
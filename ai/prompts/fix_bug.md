A Playwright test has failed.

You are given:

- Repository structure
- Changed files
- Current Git branch
- Current commit
- Playwright failure
- Stack trace
- Console logs
- Screenshot path
- Trace path
- HTML report location

Your objective:

1. Identify the actual root cause.
2. Modify the minimum number of files.
3. Return only the required edits.
4. Never rewrite an entire file.
5. Never modify unrelated code.
6. Never invent files or paths.
7. Never modify Playwright tests unless the test itself is incorrect.

Return ONLY this JSON format:

{
  "summary": "Short description of the fix",

  "changes": [
    {
      "type": "replace",
      "file": "relative/path/file.ext",
      "find": "exact existing text",
      "replace": "new text"
    },

    {
      "type": "insert_after",
      "file": "relative/path/file.ext",
      "after": "existing text",
      "content": "text to insert"
    },

    {
      "type": "insert_before",
      "file": "relative/path/file.ext",
      "before": "existing text",
      "content": "text to insert"
    },

    {
      "type": "delete",
      "file": "relative/path/file.ext",
      "find": "exact text to delete"
    }
  ]
}

Rules:

- Return ONLY valid JSON.
- Do not include comments.
- Do not include markdown.
- Do not include explanations.
- The "find" text must exist exactly in the file.
- Keep edits as small as possible.
- Every operation should target only one logical change.
- If multiple files need changes, include multiple objects in the "changes" array.
- If no safe fix can be determined, return:

{
  "summary": "Unable to determine a safe automatic fix.",
  "changes": []
}
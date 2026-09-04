import { testCases } from "./test-cases.js";
import fs from "fs";

// Get the test number from the command line, e.g. "node rerun-single.js 9" → 9
const idToRerun = Number(process.argv[2]);

const testCase = testCases.find((t) => t.id === idToRerun);

if (!testCase) {
  console.log(`No test with id ${idToRerun} found.`);
  process.exit(1);
}

console.log(`Rerunning test ${idToRerun}...`);

try {
  const response = await fetch("http://localhost:3001/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testCase),
  });

  const data = await response.json();

  const result = { testCase, response: data };

  fs.writeFileSync(
    `./test-results/test-${idToRerun}.json`,
    JSON.stringify(result, null, 2)
  );

  console.log(`  ✓ Saved test-${idToRerun}.json`);
} catch (err) {
  console.log(`  ✗ Test ${idToRerun} failed again: ${err.message}`);
}
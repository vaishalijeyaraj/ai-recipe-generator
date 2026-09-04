import { testCases } from "./test-cases.js";
import fs from "fs";

// Make a folder to save all the answers, if it doesn't already exist
if (!fs.existsSync("./test-results")) {
  fs.mkdirSync("./test-results");
}

async function runAllTests() {
  for (const testCase of testCases) {
    console.log(`Running test ${testCase.id}...`);

    try {
      const response = await fetch("http://localhost:3001/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testCase),
      });

      const data = await response.json();

      // Save the input we sent AND the answer we got back, side by side
      const result = {
        testCase,
        response: data,
      };

      fs.writeFileSync(
        `./test-results/test-${testCase.id}.json`,
        JSON.stringify(result, null, 2)
      );

      console.log(`  ✓ Saved test-${testCase.id}.json`);
            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds before the next test
    } catch (err) {
      console.log(`  ✗ Test ${testCase.id} failed: ${err.message}`);
    }
  }

  console.log("\nAll tests done. Check the test-results folder.");
}

runAllTests();
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) {
    throw new Error(`Function ${name} not found`);
  }

  let braceCount = 0;
  let started = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (char === "{") {
      braceCount += 1;
      started = true;
    } else if (char === "}") {
      braceCount -= 1;
      if (started && braceCount === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Unable to extract ${name}`);
}

describe("known frontend issues", () => {
  test("pagination should disable next on empty dataset", () => {
    document.body.innerHTML = `
      <div class="pages"><p></p></div>
      <button class="prev_button"></button>
      <button class="next_button"></button>
    `;

    const source = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "admin.js"),
      "utf8"
    );
    const funcCode = extractFunction(source, "updatePageInfo");

    const sandbox = {
      document,
      currentPage: 1,
      rowsPerPage: 15,
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    sandbox.updatePageInfo(0);

    const nextButton = document.querySelector(".next_button");
    expect(nextButton.disabled).toBe(true);
  });
});

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

describe("admin pagination logic", () => {
  test("updatePageInfo sets text and disables buttons", () => {
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

    sandbox.updatePageInfo(10);

    const pageInfo = document.querySelector(".pages p");
    const prevButton = document.querySelector(".prev_button");
    const nextButton = document.querySelector(".next_button");

    expect(pageInfo.innerText || pageInfo.textContent).toBe("Page 1 of 1");
    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
  });

  test("updatePageInfo handles empty dataset", () => {
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

    const pageInfo = document.querySelector(".pages p");
    const prevButton = document.querySelector(".prev_button");
    const nextButton = document.querySelector(".next_button");

    expect(pageInfo.innerText || pageInfo.textContent).toBe("Page 1 of 0");
    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
  });

  test("updatePageInfo disables next on last page", () => {
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
      currentPage: 3,
      rowsPerPage: 10,
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    sandbox.updatePageInfo(30);

    const pageInfo = document.querySelector(".pages p");
    const prevButton = document.querySelector(".prev_button");
    const nextButton = document.querySelector(".next_button");

    expect(pageInfo.innerText || pageInfo.textContent).toBe("Page 3 of 3");
    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
  });
});

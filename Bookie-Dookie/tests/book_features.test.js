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

describe("book_features search logic", () => {
  test("searchBooks filters by title/author/category", async () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "book_features.js"),
      "utf8"
    );
    const funcCode = extractFunction(source, "searchBooks");

    const sandbox = {
      document: {
        querySelector: jest.fn(() => ({})),
      },
      getWishlist: jest.fn(() => Promise.resolve([])),
      displayBooks: jest.fn(),
      console: { error: jest.fn() },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    const books = [
      { title: "Clean Code", author: "Robert C. Martin", category: "Software" },
      { title: "Dune", author: "Frank Herbert", category: "Sci-Fi" },
    ];

    sandbox.searchBooks("clean", books, []);
    await Promise.resolve();

    expect(sandbox.displayBooks).toHaveBeenCalledWith([books[0]], []);
  });

  test("searchBooks returns empty list for no matches", async () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "book_features.js"),
      "utf8"
    );
    const funcCode = extractFunction(source, "searchBooks");

    const sandbox = {
      document: {
        querySelector: jest.fn(() => ({})),
      },
      getWishlist: jest.fn(() => Promise.resolve([])),
      displayBooks: jest.fn(),
      console: { error: jest.fn() },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    const books = [
      { title: "Clean Code", author: "Robert C. Martin", category: "Software" },
    ];

    sandbox.searchBooks("missing", books, []);
    await Promise.resolve();

    expect(sandbox.displayBooks).toHaveBeenCalledWith([], []);
  });

  test("searchBooks returns all books for empty query", async () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "book_features.js"),
      "utf8"
    );
    const funcCode = extractFunction(source, "searchBooks");

    const sandbox = {
      document: {
        querySelector: jest.fn(() => ({})),
      },
      getWishlist: jest.fn(() => Promise.resolve([])),
      displayBooks: jest.fn(),
      console: { error: jest.fn() },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    const books = [
      { title: "Clean Code", author: "Robert C. Martin", category: "Software" },
      { title: "Dune", author: "Frank Herbert", category: "Sci-Fi" },
    ];

    sandbox.searchBooks("", books, []);
    await Promise.resolve();

    expect(sandbox.displayBooks).toHaveBeenCalledWith(books, []);
  });

  test("searchBooks matches case-insensitively", async () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "book_features.js"),
      "utf8"
    );
    const funcCode = extractFunction(source, "searchBooks");

    const sandbox = {
      document: {
        querySelector: jest.fn(() => ({})),
      },
      getWishlist: jest.fn(() => Promise.resolve([])),
      displayBooks: jest.fn(),
      console: { error: jest.fn() },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${funcCode};`, sandbox);

    const books = [
      { title: "Clean Code", author: "Robert C. Martin", category: "Software" },
      { title: "Dune", author: "Frank Herbert", category: "Sci-Fi" },
    ];

    sandbox.searchBooks("dUnE", books, []);
    await Promise.resolve();

    expect(sandbox.displayBooks).toHaveBeenCalledWith([books[1]], []);
  });
});

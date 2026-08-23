const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const extractText = require("../utils/extractText");

test("rejects a file whose contents are not a PDF", async (context) => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ats-pdf-"));
  const filePath = path.join(directory, "invalid.pdf");
  await fs.promises.writeFile(filePath, "not a pdf");

  context.after(() => fs.promises.rm(directory, { recursive: true, force: true }));

  await assert.rejects(extractText(filePath), {
    code: "INVALID_PDF",
    message: "The uploaded file is not a valid PDF.",
  });
});

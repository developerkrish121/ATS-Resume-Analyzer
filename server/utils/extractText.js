const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);

    if (dataBuffer.subarray(0, 5).toString() !== "%PDF-") {
      const error = new Error("The uploaded file is not a valid PDF.");
      error.code = "INVALID_PDF";
      throw error;
    }

    const data = await pdfParse(dataBuffer);

    if (!data.text?.trim()) {
      const error = new Error(
        "No readable text was found in the PDF. Scanned PDFs are not supported."
      );
      error.code = "EMPTY_PDF_TEXT";
      throw error;
    }

    return data.text.trim();
  } catch (error) {
    if (error.code === "INVALID_PDF" || error.code === "EMPTY_PDF_TEXT") {
      throw error;
    }

    const extractionError = new Error(
      "The PDF could not be read. It may be malformed or corrupted."
    );
    extractionError.code = "PDF_EXTRACTION_FAILED";
    extractionError.cause = error;
    throw extractionError;
  }
};

module.exports = extractTextFromPDF;

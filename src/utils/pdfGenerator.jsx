import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

export const generateReportPdf = async (reportText) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 20;
  const textWidth = 500;

  let page = pdfDoc.addPage([600, 800]);
  let { width, height } = page.getSize();
  let y = height - 50;

  // Title
  page.drawText("Interview Performance Report", {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 30; // Move down for content

  // Process text
  const lines = reportText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let text = "";
    
    // Word wrapping
    const words = line.split(" ");
    for (const word of words) {
      const newText = text + word + " ";
      const textSize = font.widthOfTextAtSize(newText, fontSize);

      if (textSize > textWidth) {
        if (y < 50) {
          // Add new page if space is low
          page = pdfDoc.addPage([600, 800]);
          y = height - 50;
        }

        page.drawText(text, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
        text = word + " ";
        y -= lineHeight;
      } else {
        text = newText;
      }
    }

    if (text.trim()) {
      if (y < 50) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }

      page.drawText(text, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  }

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, "Interview_Report.pdf");
};

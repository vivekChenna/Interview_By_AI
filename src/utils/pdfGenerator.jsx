import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

export const generateReportPdf = async (reportText) => {
  const pdfDoc = await PDFDocument.create();
  
  // Embed multiple fonts for different styles
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Define styling constants
  const styles = {
    title: { size: 24, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) },
    heading: { size: 16, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) },
    subheading: { size: 14, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) },
    normal: { size: 11, font: helvetica, color: rgb(0.2, 0.2, 0.2) },
    italic: { size: 11, font: helveticaOblique, color: rgb(0.3, 0.3, 0.3) }
  };

  // Page settings
  const margin = 50;
  const pageWidth = 600;
  const pageHeight = 800;
  const contentWidth = pageWidth - (margin * 2);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Helper function to add new page when needed
  const checkNewPage = (requiredHeight) => {
    if (y - requiredHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  // Draw header with company logo placeholder
  const headerHeight = 100;
  page.drawRectangle({
    x: margin,
    y: pageHeight - headerHeight,
    width: contentWidth,
    height: 2,
    color: rgb(0.8, 0.8, 0.8)
  });

  // Draw title
  y -= 80;
  page.drawText("Interview Performance Report", {
    x: margin,
    y,
    ...styles.title
  });

  // Process content sections
  const sections = reportText.split("\n\n");
  
  for (const section of sections) {
    y -= 30;
    checkNewPage(100);

    if (section.startsWith("**Question:**")) {
      // Format question sections
      const [question, ...content] = section.split("\n");
      
      // Draw question
      page.drawText(question.replace("**Question:**", "Q:").trim(), {
        x: margin,
        y,
        ...styles.subheading
      });

      // Draw content with proper word wrapping
      y -= 25;
      let currentLine = "";
      const words = content.join(" ").split(" ");

      for (const word of words) {
        const testLine = currentLine + word + " ";
        const textWidth = styles.normal.font.widthOfTextAtSize(testLine, styles.normal.size);

        if (textWidth > contentWidth) {
          checkNewPage(20);
          page.drawText(currentLine.trim(), {
            x: margin + 15, // indent content
            y,
            ...styles.normal
          });
          y -= 20;
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.trim()) {
        checkNewPage(20);
        page.drawText(currentLine.trim(), {
          x: margin + 15,
          y,
          ...styles.normal
        });
        y -= 20;
      }
    } else {
      // Format other sections
      const words = section.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine + word + " ";
        const textWidth = styles.normal.font.widthOfTextAtSize(testLine, styles.normal.size);

        if (textWidth > contentWidth) {
          checkNewPage(20);
          page.drawText(currentLine.trim(), {
            x: margin,
            y,
            ...styles.normal
          });
          y -= 20;
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.trim()) {
        checkNewPage(20);
        page.drawText(currentLine.trim(), {
          x: margin,
          y,
          ...styles.normal
        });
        y -= 20;
      }
    }
  }

  // Add footer with page numbers
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    page.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: pageWidth - margin - 70,
      y: margin - 20,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, "Interview_Report.pdf");
};
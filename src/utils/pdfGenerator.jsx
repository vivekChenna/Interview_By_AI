import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

// Helper function to load local image remains the same
const getLocalImage = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) throw new Error("Failed to load local image");
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("Error loading local image:", error);
    return null;
  }
};

// report, candidateName, score

export const generateReportPdf = async (
  reportText,
  candidateName = "Candidate",
  score = "10"
) => {
  // Initial setup remains the same until the score section
  const cleanReportText = reportText
    .split("\n")
    .filter((line) => {
      const trimmedLine = line.trim();
      return !(
        trimmedLine === "Interview Performance Report" ||
        trimmedLine === "OVERALL INTERVIEW PERFORMANCE REPORT"
      );
    })
    .join("\n")
    .trim();

  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Styles remain the same
  const styles = {
    title: {
      size: 28,
      font: helveticaBold,
      color: rgb(0.2, 0.3, 0.4),
    },
    score: {
      size: 20,
      font: helveticaBold,
      color: rgb(0.2, 0.5, 0.7),
    },
    heading: {
      size: 20,
      font: helveticaBold,
      color: rgb(0.25, 0.4, 0.6),
    },
    subheading: {
      size: 16,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    },
    performanceSummary: {
      size: 18,
      font: helveticaBold,
      color: rgb(0.2, 0.4, 0.6),
    },
    question: {
      size: 14,
      font: helveticaBold,
      color: rgb(0.2, 0.5, 0.7),
    },
    evaluation: {
      size: 14,
      font: helveticaBold,
      color: rgb(0.4, 0.4, 0.4),
    },
    suggestions: {
      size: 14,
      font: helveticaBold,
      color: rgb(0.3, 0.5, 0.3),
    },
    normal: {
      size: 12,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    },
    italic: {
      size: 12,
      font: helveticaOblique,
      color: rgb(0.3, 0.3, 0.3),
    },
    footer: {
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    },
  };

  const margin = 60;
  const pageWidth = 612;
  const pageHeight = 792;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const checkNewPage = (requiredHeight) => {
    if (y - requiredHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  // Logo handling remains the same
  try {
    const imageBytes = await getLocalImage("/newAndai.jpg");
    if (imageBytes) {
      const logoImage = await pdfDoc.embedJpg(imageBytes);
      const maxWidth = 70;
      const scaleRatio = maxWidth / logoImage.width;
      const scaledWidth = logoImage.width * scaleRatio;
      const scaledHeight = logoImage.height * scaleRatio;

      page.drawImage(logoImage, {
        x: (pageWidth - scaledWidth) / 2,
        y: pageHeight - margin - scaledHeight,
        width: scaledWidth,
        height: scaledHeight,
      });

      y -= scaledHeight + 30;
    }
  } catch (error) {
    console.error("Error embedding JPG logo:", error);
  }

  // Title and decorative line remain the same
  const title = "Interview Performance Report";
  const titleWidth = helveticaBold.widthOfTextAtSize(title, styles.title.size);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    ...styles.title,
  });

  y -= 45;

  // Add decorative line
  const lineY = y - 5;
  const segments = 20;
  const segmentWidth = contentWidth / segments;

  for (let i = 0; i < segments; i++) {
    const opacity = 0.3 + 0.7 * (i / segments);
    page.drawRectangle({
      x: margin + i * segmentWidth,
      y: lineY,
      width: segmentWidth,
      height: 2,
      color: rgb(0.2, 0.3, 0.4, opacity),
    });
  }

  y -= 40;

  // Modified score section - single line on the left
  const scoreText = `Your Score: ${score}/10`;
  page.drawText(scoreText, {
    x: margin,
    y,
    ...styles.score,
  });

  y -= 40;

  // Modified text processing section
  const splitLines = cleanReportText.split("\n").map((line) => line.trim());

  for (const line of splitLines) {
    if (line.length === 0) {
      y -= 12;
      continue;
    }

    // Modified styling logic to handle bold titles
    let styleToUse = styles.normal;
    let extraSpacing = 20;
    let remainingText = "";

    if (line === "Candidate Performance Summary:") {
      styleToUse = styles.performanceSummary;
      extraSpacing = 25;
    } else if (line.includes("Question:")) {
      const boldPart = "Question:";
      remainingText = line.replace(/\*\*Question:\*\*|Question:/, "").trim();
      
      page.drawText(boldPart, {
        x: margin,
        y,
        ...styles.question,
      });
      
      if (remainingText) {
        const boldWidth = styles.question.font.widthOfTextAtSize(boldPart, styles.question.size);
        page.drawText(remainingText, {
          x: margin + boldWidth + 5,
          y,
          ...styles.normal,
        });
      }
      
      y -= extraSpacing;
      continue;
    } else if (line.includes("Evaluation:")) {
      const boldPart = "Evaluation:";
      remainingText = line.replace(/\*\*Evaluation:\*\*|Evaluation:/, "").trim();
      
      page.drawText(boldPart, {
        x: margin,
        y,
        ...styles.evaluation,
      });
      
      if (remainingText) {
        const boldWidth = styles.evaluation.font.widthOfTextAtSize(boldPart, styles.evaluation.size);
        page.drawText(remainingText, {
          x: margin + boldWidth + 5,
          y,
          ...styles.normal,
        });
      }
      
      y -= extraSpacing;
      continue;
    } else if (line.includes("Suggestions for Improvement:")) {
      const boldPart = "Suggestions for Improvement:";
      remainingText = line.replace(/\*\*Suggestions for Improvement:\*\*|Suggestions for Improvement:/, "").trim();
      
      page.drawText(boldPart, {
        x: margin,
        y,
        ...styles.suggestions,
      });
      
      if (remainingText) {
        const boldWidth = styles.suggestions.font.widthOfTextAtSize(boldPart, styles.suggestions.size);
        page.drawText(remainingText, {
          x: margin + boldWidth + 5,
          y,
          ...styles.normal,
        });
      }
      
      y -= extraSpacing;
      continue;
    } else if (line.endsWith(":")) {
      styleToUse = styles.subheading;
      extraSpacing = 25;
    }

    checkNewPage(extraSpacing);

    // Handle regular text wrapping
    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const lineWidth = styleToUse.font.widthOfTextAtSize(testLine, styleToUse.size);

      if (lineWidth > contentWidth) {
        page.drawText(currentLine, {
          x: margin,
          y,
          ...styleToUse,
        });
        y -= extraSpacing;
        currentLine = word;
        checkNewPage(extraSpacing);
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y,
        ...styleToUse,
      });
      y -= extraSpacing;
    }
  }

  // Footer section remains the same
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);

    page.drawRectangle({
      x: margin,
      y: margin - 30,
      width: contentWidth,
      height: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: pageWidth - 80,
      y: margin - 45,
      ...styles.footer,
    });

    page.drawText(`Candidate: ${candidateName}`, {
      x: margin,
      y: margin - 45,
      ...styles.footer,
    });

    const currentDate = new Date().toLocaleDateString();
    const dateWidth = helvetica.widthOfTextAtSize(currentDate, styles.footer.size);
    page.drawText(currentDate, {
      x: (pageWidth - dateWidth) / 2,
      y: margin - 45,
      ...styles.footer,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, `Interview_Report_${candidateName.replace(/\s+/g, "_")}.pdf`);
};
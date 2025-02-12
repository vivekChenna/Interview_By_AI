import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Helper function to load local image
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

export const generateReportPdf = async (
  reportText,
  candidateName = "Candidate",
  score = "10"
) => {
  // Initialize PDF document and variables
  const pdfDoc = await PDFDocument.create();
  const margin = 60;
  const pageWidth = 612;
  const pageHeight = 792;
  const contentWidth = pageWidth - margin * 2;

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(
    StandardFonts.HelveticaOblique
  );

  // Helper function to wrap text and calculate height
  const getWrappedTextHeight = (text, font, fontSize, maxWidth) => {
    const words = text.split(" ");
    let lines = 1;
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (lineWidth > maxWidth) {
        lines++;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    return lines * (fontSize * 1.2);
  };

  // Styles definition
  const styles = {
    title: { size: 28, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) },
    score: { size: 20, font: helveticaBold, color: rgb(0.2, 0.5, 0.7) },
    heading: { size: 20, font: helveticaBold, color: rgb(0.25, 0.4, 0.6) },
    subheading: { size: 16, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) },
    performanceSummary: {
      size: 18,
      font: helveticaBold,
      color: rgb(0.2, 0.4, 0.6),
    },
    question: { size: 14, font: helveticaBold, color: rgb(0.2, 0.5, 0.7) },
    evaluation: { size: 14, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) },
    suggestions: { size: 14, font: helveticaBold, color: rgb(0.3, 0.5, 0.3) },
    normal: { size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2) },
    italic: { size: 12, font: helveticaOblique, color: rgb(0.3, 0.3, 0.3) },
    footer: { size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5) },
  };

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Modified checkNewPage function with proper y-position management
  const checkNewPage = (requiredHeight) => {
    if (y - requiredHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  // Clean and split report text
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

  const splitLines = cleanReportText.split("\n").map((line) => line.trim());

  // Draw logo
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

  // Draw title and header elements
  const title = "Interview Performance Report";
  const titleWidth = styles.title.font.widthOfTextAtSize(
    title,
    styles.title.size
  );
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    ...styles.title,
  });
  y -= 45;

  // Score section
  const scoreText = `Your Score: ${score}/10`;
  page.drawText(scoreText, {
    x: margin,
    y,
    ...styles.score,
  });
  y -= 40;

  // Process text content
  for (const line of splitLines) {
    if (line.length === 0) {
      y -= 12;
      continue;
    }

    let styleToUse = styles.normal;
    let extraSpacing = 20;

    // Determine style and handle special sections
    if (line === "Candidate Performance Summary:") {
      styleToUse = styles.performanceSummary;
      extraSpacing = 25;
    } else if (line === "Detailed Evaluation of Responses:") {
      checkNewPage(styles.subheading.size + 30);
      page.drawText(line, {
        x: margin,
        y,
        ...styles.subheading,
      });
      y -= 30;
      continue;
    }

    // Handle special sections (Question, Evaluation, Suggestions)
    if (
      line.includes("Question:") ||
      line.includes("Evaluation:") ||
      line.includes("Suggestions for Improvement:")
    ) {
      const [prefix, ...rest] = line.split(":");
      const boldPart = prefix + ":";
      const remainingText = rest.join(":").trim();

      const style = line.includes("Question:")
        ? styles.question
        : line.includes("Evaluation:")
        ? styles.evaluation
        : styles.suggestions;

      // Calculate heights and check page break
      const totalHeight = Math.max(
        style.size * 1.2,
        getWrappedTextHeight(
          remainingText,
          styles.normal.font,
          styles.normal.size,
          contentWidth - style.font.widthOfTextAtSize(boldPart, style.size) - 5
        )
      );

      checkNewPage(totalHeight + extraSpacing);

      // Draw the bold prefix
      page.drawText(boldPart, {
        x: margin,
        y,
        ...style,
      });

      // Draw the remaining text with wrapping
      if (remainingText) {
        const boldWidth = style.font.widthOfTextAtSize(boldPart, style.size);
        let currentY = y;
        const words = remainingText.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const lineWidth = styles.normal.font.widthOfTextAtSize(
            testLine,
            styles.normal.size
          );

          if (lineWidth > contentWidth - boldWidth - 5) {
            page.drawText(currentLine, {
              x: margin + boldWidth + 5,
              y: currentY,
              ...styles.normal,
            });
            currentY -= styles.normal.size * 1.2;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          page.drawText(currentLine, {
            x: margin + boldWidth + 5,
            y: currentY,
            ...styles.normal,
          });
        }
      }

      y -= totalHeight + extraSpacing;
      continue;
    }

    // Handle regular text with wrapping
    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const lineWidth = styleToUse.font.widthOfTextAtSize(
        testLine,
        styleToUse.size
      );

      if (lineWidth > contentWidth) {
        checkNewPage(styleToUse.size * 1.2);
        page.drawText(currentLine, {
          x: margin,
          y,
          ...styleToUse,
        });
        y -= styleToUse.size * 1.2;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      checkNewPage(styleToUse.size * 1.2);
      page.drawText(currentLine, {
        x: margin,
        y,
        ...styleToUse,
      });
      y -= styleToUse.size * 1.2 + extraSpacing;
    }
  }

  // Add footer to all pages
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const currentPage = pdfDoc.getPage(i);

    // Footer line
    currentPage.drawRectangle({
      x: margin,
      y: margin - 30,
      width: contentWidth,
      height: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Footer text
    currentPage.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: pageWidth - 80,
      y: margin - 45,
      ...styles.footer,
    });

    currentPage.drawText(`Candidate: ${candidateName}`, {
      x: margin,
      y: margin - 45,
      ...styles.footer,
    });

    const currentDate = new Date().toLocaleDateString();
    const dateWidth = styles.footer.font.widthOfTextAtSize(
      currentDate,
      styles.footer.size
    );
    currentPage.drawText(currentDate, {
      x: (pageWidth - dateWidth) / 2,
      y: margin - 45,
      ...styles.footer,
    });
  }

  return await pdfDoc.save();
};

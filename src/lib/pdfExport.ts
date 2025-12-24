import { jsPDF } from "jspdf";

export function exportToPDF(content: string, title: string = "Document") {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 25;
  const marginRight = 25;
  const marginTop = 30;
  const marginBottom = 30;
  const maxWidth = pageWidth - marginLeft - marginRight;
  let yPosition = marginTop;
  
  // Professional header with gradient effect (simulated)
  doc.setFillColor(124, 58, 237); // Violet
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Title section
  yPosition = 25;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  
  // Clean up title
  const cleanTitle = title.replace(/[#*`_]/g, "").trim();
  const titleLines = doc.splitTextToSize(cleanTitle, maxWidth);
  doc.text(titleLines, marginLeft, yPosition);
  yPosition += titleLines.length * 12 + 10;
  
  // Subtitle with date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated on ${dateStr}`, marginLeft, yPosition);
  yPosition += 8;
  
  // Decorative line
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 15;
  
  // Reset for content
  doc.setTextColor(40, 40, 40);
  
  // Process content
  const lines = content.split("\n");
  let currentSection = "";
  
  for (const line of lines) {
    // Page break check with proper margin
    if (yPosition > pageHeight - marginBottom - 15) {
      doc.addPage();
      yPosition = marginTop;
      
      // Add header to new pages
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageWidth, 5, 'F');
    }
    
    let processedLine = line;
    let fontSize = 11;
    let fontStyle: "normal" | "bold" | "italic" = "normal";
    let textColor: [number, number, number] = [40, 40, 40];
    let addSpacing = 0;
    
    // Handle different heading levels
    if (line.startsWith("### ")) {
      processedLine = line.replace("### ", "");
      fontSize = 13;
      fontStyle = "bold";
      textColor = [60, 60, 60];
      addSpacing = 8;
    } else if (line.startsWith("## ")) {
      processedLine = line.replace("## ", "");
      fontSize = 16;
      fontStyle = "bold";
      textColor = [124, 58, 237]; // Violet for h2
      addSpacing = 12;
    } else if (line.startsWith("# ")) {
      processedLine = line.replace("# ", "");
      fontSize = 20;
      fontStyle = "bold";
      textColor = [30, 30, 30];
      addSpacing = 15;
      currentSection = processedLine;
    }
    
    // Handle bullet points with proper indentation
    if (line.startsWith("- ") || line.startsWith("* ")) {
      processedLine = line.slice(2);
      doc.setFillColor(124, 58, 237);
      doc.circle(marginLeft + 3, yPosition - 2, 1.5, 'F');
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      doc.setTextColor(...textColor);
      const bulletLines = doc.splitTextToSize(processedLine, maxWidth - 15);
      for (let i = 0; i < bulletLines.length; i++) {
        if (yPosition > pageHeight - marginBottom - 10) {
          doc.addPage();
          yPosition = marginTop;
        }
        doc.text(bulletLines[i], marginLeft + 10, yPosition);
        yPosition += fontSize * 0.5;
      }
      yPosition += 3;
      continue;
    }
    
    // Handle numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(124, 58, 237);
      doc.text(`${numberedMatch[1]}.`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const numLines = doc.splitTextToSize(numberedMatch[2], maxWidth - 15);
      for (let i = 0; i < numLines.length; i++) {
        if (yPosition > pageHeight - marginBottom - 10) {
          doc.addPage();
          yPosition = marginTop;
        }
        doc.text(numLines[i], marginLeft + 10, yPosition);
        yPosition += 5.5;
      }
      yPosition += 2;
      continue;
    }
    
    // Handle code blocks (simple detection)
    if (line.startsWith("```") || line.startsWith("`")) {
      processedLine = line.replace(/`/g, "");
      doc.setFillColor(245, 245, 245);
      const codeLines = doc.splitTextToSize(processedLine, maxWidth - 10);
      const codeHeight = codeLines.length * 5 + 6;
      doc.roundedRect(marginLeft - 2, yPosition - 4, maxWidth + 4, codeHeight, 2, 2, 'F');
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      for (const codeLine of codeLines) {
        doc.text(codeLine, marginLeft + 3, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
      continue;
    }
    
    // Remove markdown formatting
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, "$1");
    processedLine = processedLine.replace(/\*(.*?)\*/g, "$1");
    processedLine = processedLine.replace(/`(.*?)`/g, "$1");
    processedLine = processedLine.replace(/\[(.*?)\]\(.*?\)/g, "$1");
    
    // Skip empty lines but add spacing
    if (processedLine.trim() === "") {
      yPosition += 6;
      continue;
    }
    
    // Add spacing before headings
    yPosition += addSpacing;
    
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...textColor);
    
    // Word wrap and render
    const splitLines = doc.splitTextToSize(processedLine, maxWidth);
    for (const splitLine of splitLines) {
      if (yPosition > pageHeight - marginBottom - 10) {
        doc.addPage();
        yPosition = marginTop;
      }
      doc.text(splitLine, marginLeft, yPosition);
      yPosition += fontSize * 0.5;
    }
    yPosition += 3;
  }
  
  // Add professional footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, pageHeight - 20, pageWidth - marginRight, pageHeight - 20);
    
    // Page number
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
    
    // Branding
    doc.setTextColor(124, 58, 237);
    doc.text(
      "✨ Created by Aira AI",
      pageWidth - marginRight,
      pageHeight - 12,
      { align: "right" }
    );
  }
  
  // Generate filename
  const safeTitle = cleanTitle.slice(0, 30).replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") || "Aira_Document";
  doc.save(`${safeTitle}.pdf`);
}

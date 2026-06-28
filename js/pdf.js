// PDF Generation Utility using html2canvas and jsPDF

const PDFExporter = {
  // Exports a given DOM element to A4-sized PDF
  async exportToPdf(element, filename = 'خطة-الدرس.pdf') {
    if (!element) {
      throw new Error('العنصر المطلوب للتصدير غير موجود.');
    }

    const { jsPDF } = window.jspdf;

    // Render the element to a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution scaling
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const margin = 12; // 12mm page margin
    const pdfWidth = 210; // A4 Width in mm
    const imgWidth = pdfWidth - (margin * 2);
    
    // Scale height proportionally
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
    const pdfHeight = imgHeight + (margin * 2);

    // Create A4 PDF with exact height mapping to prevent text clipping
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    // Render image to PDF page
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
    
    // Trigger download
    pdf.save(filename);
  }
};

window.PDFExporter = PDFExporter;

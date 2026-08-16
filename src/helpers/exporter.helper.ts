import { writeFile } from 'fs-extra';
import { PDFDocument } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph } from 'docx';

// Export file helper function
export async function exportFile(
  fileName: string,
  fileType: string,
  data: any[],
): Promise<{ statusCode: number; message: string }> {
  try {
    console.log('Tabooo');
    let fileContent: Buffer;

    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        page.drawText(data.join('\n'), { x: 50, y: 350 });
        const pdfBytes = await pdfDoc.save(); // Returns Uint8Array
        fileContent = Buffer.from(pdfBytes); // Convert to Buffer
        break;

      case 'excel':
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('FAQs');
        worksheet.columns = [{ header: 'FAQ', key: 'faq', width: 30 }];
        data.forEach((item) => worksheet.addRow({ faq: item }));
        const excelBuffer = await workbook.xlsx.writeBuffer(); // Returns Uint8Array
        fileContent = Buffer.from(excelBuffer); // Convert to Buffer
        break;

      case 'word':
        const doc = new Document({
          // Pass an empty options object
          sections: [
            {
              children: data.map((item) => new Paragraph(item)),
            },
          ],
        });
        const wordBuffer = await Packer.toBuffer(doc); // Returns Uint8Array
        fileContent = Buffer.from(wordBuffer); // Convert to Buffer
        break;

      default:
        return { statusCode: 400, message: 'Invalid file type' };
    }

    // Save file to local folder
    console.log('Tabooo 1');

    await writeFile(`./public/${fileName}.${fileType}`, fileContent);

    console.log('Tabooo22');

    return { statusCode: 200, message: 'File exported successfully' };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error exporting file: ${error.message}`,
    };
  }
}

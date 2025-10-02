import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
  async generateExcelFile<T>(
    data: T[],
    columns: { header: string; key: keyof T }[],
    fileName: string,
    res: Response
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ГАОУ ДПО ИРР ПО';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key as string,
      width: 20,
    }));

    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };

    data.forEach(item => {
      worksheet.addRow(item);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Пропускаем заголовок
      row.eachCell(cell => {
        if (cell.value instanceof Date) {
          cell.numFmt = 'dd.mm.yyyy hh:mm';
        }
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}

import { Poste } from '../models/Poste.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Controlador de Reportes
 */

/**
 * Generar reporte en PDF
 */
export const generatePDFReport = async (req, res, next) => {
  try {
    const { estado, material, fecha_inicio, fecha_fin } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (material) filters.material = material;

    const result = await Poste.findAll({
      ...filters,
      limit: 1000 // Límite para reportes
    });

    const postes = result.postes;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-postes-${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Reporte de Postes de Fibra Óptica', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Fecha de generación: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`, { align: 'center' });
    doc.moveDown();

    // Filtros Info
    if (estado || material || fecha_inicio || fecha_fin) {
      doc.fontSize(12).text('Filtros aplicados:', { underline: true });
      if (estado) doc.fontSize(10).text(`Estado: ${estado}`);
      if (material) doc.fontSize(10).text(`Material: ${material}`);
      if (fecha_inicio) doc.fontSize(10).text(`Desde: ${fecha_inicio}`);
      if (fecha_fin) doc.fontSize(10).text(`Hasta: ${fecha_fin}`);
      doc.moveDown();
    }

    // Resumen
    doc.fontSize(12).text('Resumen:', { underline: true });
    doc.fontSize(10).text(`Total de postes: ${postes.length}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Tabla
    doc.fontSize(14).text('Listado de Postes', { underline: true });
    doc.moveDown();

    postes.forEach((poste, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.fontSize(11).text(`${index + 1}. ${poste.nombre}`, { bold: true });
      doc.fontSize(9);
      doc.text(`   Dirección: ${poste.direccion || 'N/A'}`);
      doc.text(`   Coordenadas: ${poste.latitud}, ${poste.longitud}`);
      doc.text(`   Estado: ${poste.estado || 'N/A'}`);
      doc.text(`   Material: ${poste.material || 'N/A'}`);
      if (poste.altura) doc.text(`   Altura: ${poste.altura}m`);
      if (poste.numero_serie) doc.text(`   N° Serie: ${poste.numero_serie}`);
      doc.text(`   Registrado: ${format(new Date(poste.created_at), "dd/MM/yyyy HH:mm")}`);
      doc.text(`   Por: ${poste.created_by_nombre || 'N/A'}`);
      doc.moveDown(0.5);
    });

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Página ${i + 1} de ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    doc.end();

  } catch (error) {
    next(new AppError('Error al generar el reporte PDF: ' + error.message, 500));
  }
};

/**
 * Generar reporte en Excel
 */
export const generateExcelReport = async (req, res, next) => {
  try {
    const { estado, material, fecha_inicio, fecha_fin } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (material) filters.material = material;

    const result = await Poste.findAll({
      ...filters,
      limit: 1000
    });

    const postes = result.postes;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Postes FO';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Resumen');

    summarySheet.columns = [
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Valor', key: 'valor', width: 30 }
    ];

    summarySheet.addRow({ concepto: 'Fecha de generación', valor: format(new Date(), "dd/MM/yyyy HH:mm") });
    summarySheet.addRow({ concepto: 'Total de postes', valor: postes.length });
    if (estado) summarySheet.addRow({ concepto: 'Filtro - Estado', valor: estado });
    if (material) summarySheet.addRow({ concepto: 'Filtro - Material', valor: material });

    summarySheet.getRow(1).font = { bold: true, size: 12 };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    const postesSheet = workbook.addWorksheet('Postes');

    postesSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Dirección', key: 'direccion', width: 30 },
      { header: 'Latitud', key: 'latitud', width: 15 },
      { header: 'Longitud', key: 'longitud', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Material', key: 'material', width: 15 },
      { header: 'Altura (m)', key: 'altura', width: 12 },
      { header: 'N° Serie', key: 'numero_serie', width: 15 },
      { header: 'Tipo Mant.', key: 'tipo_mantenimiento', width: 15 },
      { header: 'Observaciones', key: 'observaciones', width: 30 },
      { header: 'Registrado', key: 'created_at', width: 18 },
      { header: 'Por', key: 'created_by_nombre', width: 20 }
    ];

    postes.forEach((poste, index) => {
      postesSheet.addRow({
        id: index + 1,
        nombre: poste.nombre,
        direccion: poste.direccion || '',
        latitud: poste.latitud,
        longitud: poste.longitud,
        estado: poste.estado || '',
        material: poste.material || '',
        altura: poste.altura || '',
        numero_serie: poste.numero_serie || '',
        tipo_mantenimiento: poste.tipo_mantenimiento || '',
        observaciones: poste.observaciones || '',
        created_at: format(new Date(poste.created_at), 'dd/MM/yyyy HH:mm'),
        created_by_nombre: poste.created_by_nombre || ''
      });
    });

    postesSheet.getRow(1).font = { bold: true, size: 11 };
    postesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };
    postesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    postesSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-postes-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(new AppError('Error al generar el reporte Excel: ' + error.message, 500));
  }
};

/**
 * Obtener estadísticas para reportes
 */
export const getStatistics = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const result = await Poste.findAll({ limit: 10000 });
    const postes = result.postes;

    const stats = {
      total: postes.length,
      por_estado: {},
      por_material: {},
      por_mes: {},
      altura_promedio: 0
    };

    let sumaAlturas = 0;
    let countAlturas = 0;

    postes.forEach(poste => {
      stats.por_estado[poste.estado] = (stats.por_estado[poste.estado] || 0) + 1;
      stats.por_material[poste.material] = (stats.por_material[poste.material] || 0) + 1;

      if (poste.altura) {
        sumaAlturas += parseFloat(poste.altura);
        countAlturas++;
      }

      const mes = format(new Date(poste.created_at), 'yyyy-MM');
      stats.por_mes[mes] = (stats.por_mes[mes] || 0) + 1;
    });

    stats.altura_promedio = countAlturas > 0 ? (sumaAlturas / countAlturas).toFixed(2) : 0;

    res.json({ stats });

  } catch (error) {
    next(new AppError('Error al obtener estadísticas: ' + error.message, 500));
  }
};

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Constants ──────────────────────────────────────────────────────────────────
const BRAND_COLOR  = [99, 102, 241]   // #6366f1 indigo
const HEADER_TEXT  = [255, 255, 255]
const GRAY_LIGHT   = [248, 248, 252]
const GRAY_BORDER  = [220, 220, 230]

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function nowFormatted() {
  return new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function safeDate(val) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Draws the shared header band and returns the Y coordinate after it.
 */
function drawHeader(doc, title, subtitle) {
  const W = doc.internal.pageSize.getWidth()

  // Background band
  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, W, 28, 'F')

  // Logo / brand
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...HEADER_TEXT)
  doc.text('PRL Flow', 14, 12)

  // Title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 20)

  // Subtitle (right-aligned)
  doc.setFontSize(8)
  doc.text(subtitle, W - 14, 20, { align: 'right' })

  doc.setTextColor(0, 0, 0)
  return 36
}

/**
 * Adds page-number footers to every page.
 */
function addFooters(doc) {
  const total = doc.internal.getNumberOfPages()
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(`Generado por PRL Flow el ${nowFormatted()}`, 14, H - 8)
    doc.text(`Página ${i} / ${total}`, W - 14, H - 8, { align: 'right' })
  }
  doc.setTextColor(0, 0, 0)
}

/**
 * Draws a section label.
 */
function sectionTitle(doc, text, y) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_COLOR)
  doc.text(text.toUpperCase(), 14, y)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  return y + 4
}

// ── Shared autoTable defaults ──────────────────────────────────────────────────
const tableDefaults = (startY) => ({
  startY,
  margin: { left: 14, right: 14 },
  styles: {
    fontSize: 8,
    cellPadding: 3,
    lineColor: GRAY_BORDER,
    lineWidth: 0.2,
  },
  headStyles: {
    fillColor: BRAND_COLOR,
    textColor: HEADER_TEXT,
    fontStyle: 'bold',
    fontSize: 8,
  },
  alternateRowStyles: { fillColor: GRAY_LIGHT },
  tableLineColor: GRAY_BORDER,
  tableLineWidth: 0.2,
})

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN 1 — Dashboard PDF
// ═══════════════════════════════════════════════════════════════════════════════
export function exportDashboardPDF(dashboardData, companyName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const d = dashboardData

  const company = companyName || 'Empresa'
  let y = drawHeader(doc, 'Informe Ejecutivo del Dashboard', `${company} · ${safeDate(new Date())}`)

  // ── Sección: Resumen de Trabajadores ──────────────────────────────────────
  y = sectionTitle(doc, 'Resumen de Trabajadores', y)
  autoTable(doc, {
    ...tableDefaults(y),
    head: [['Métrica', 'Valor']],
    body: [
      ['Trabajadores activos', d.totalWorkers ?? 0],
      ['Managers',            d.totalManagers ?? 0],
      ['Total usuarios activos', d.activeUsers ?? 0],
    ],
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' } },
  })
  y = doc.lastAutoTable.finalY + 8

  // ── Sección: Cumplimiento Documental ──────────────────────────────────────
  y = sectionTitle(doc, 'Cumplimiento Documental', y)
  const rate = d.documentComplianceRate ?? 0
  const complianceStatus = rate >= 80
    ? { label: 'CONFORME', color: [16, 185, 129] }
    : rate >= 50
      ? { label: 'REQUIERE ATENCIÓN', color: [245, 158, 11] }
      : { label: 'CRÍTICO', color: [239, 68, 68] }

  autoTable(doc, {
    ...tableDefaults(y),
    head: [['Métrica', 'Valor']],
    body: [
      ['Total documentos pendientes revisión', d.totalDocumentsPendingReview ?? 0],
      ['Documentos caducados',                 d.totalDocumentsExpired ?? 0],
      ['Próximos a caducar',                   d.totalDocumentsExpiringSoon ?? 0],
      ['% Cumplimiento',                        `${rate}%`],
      ['Estado de cumplimiento',                complianceStatus.label],
    ],
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' } },
    didDrawCell(data) {
      if (data.section === 'body' && data.row.index === 4 && data.column.index === 1) {
        doc.setTextColor(...complianceStatus.color)
        doc.setFont('helvetica', 'bold')
        doc.text(complianceStatus.label, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
      }
    },
  })
  y = doc.lastAutoTable.finalY + 8

  // ── Sección: Estado de EPIs ───────────────────────────────────────────────
  y = sectionTitle(doc, 'Estado de EPIs', y)
  autoTable(doc, {
    ...tableDefaults(y),
    head: [['Métrica', 'Valor']],
    body: [
      ['Entregas pendientes',           d.totalEpiDeliveriesPending ?? 0],
      ['Entregas realizadas',           d.totalEpiDeliveriesDelivered ?? 0],
      ['Confirmadas por trabajador',    d.totalEpiDeliveriesConfirmed ?? 0],
    ],
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' } },
  })
  y = doc.lastAutoTable.finalY + 8

  // ── Sección: Incidencias ──────────────────────────────────────────────────
  y = sectionTitle(doc, 'Incidencias', y)
  autoTable(doc, {
    ...tableDefaults(y),
    head: [['Métrica', 'Valor']],
    body: [
      ['Abiertas',                d.totalIncidentsOpen ?? 0],
      ['En progreso',             d.totalIncidentsInProgress ?? 0],
      ['Críticas',                d.totalIncidentsCritical ?? 0],
      ['Resueltas este mes',      d.totalIncidentsResolvedThisMonth ?? 0],
    ],
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' } },
  })

  addFooters(doc)
  doc.save(`prl-flow-dashboard-${todayStr()}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN 2 — Documentos Pendientes PDF
// ═══════════════════════════════════════════════════════════════════════════════
export function exportPendingDocumentsPDF(documents, companyName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const company = companyName || 'Empresa'
  let y = drawHeader(doc, 'Documentos Pendientes de Revisión', `${company} · ${safeDate(new Date())}`)

  if (!documents || documents.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text('No hay documentos pendientes de revisión.', 14, y + 6)
    doc.setTextColor(0, 0, 0)
  } else {
    const STATUS_LABEL = {
      PENDING_REVIEW: 'Pendiente revisión',
      APPROVED:       'Aprobado',
      REJECTED:       'Rechazado',
      EXPIRED:        'Caducado',
    }

    autoTable(doc, {
      ...tableDefaults(y),
      head: [['Trabajador', 'Tipo de Documento', 'Fecha Subida', 'Fecha Caducidad', 'Estado']],
      body: documents.map((d) => [
        d.workerName    ?? '—',
        d.documentTypeName ?? '—',
        safeDate(d.uploadedAt),
        safeDate(d.expiryDate),
        STATUS_LABEL[d.status] ?? d.status ?? '—',
      ]),
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 45, halign: 'center' },
      },
    })

    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total documentos: ${documents.length}`, 14, finalY)
    doc.setFont('helvetica', 'normal')
  }

  addFooters(doc)
  doc.save(`prl-flow-documentos-pendientes-${todayStr()}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN 3 — Incidencias PDF
// ═══════════════════════════════════════════════════════════════════════════════
export function exportIncidentsPDF(incidents, companyName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const company = companyName || 'Empresa'
  let y = drawHeader(doc, 'Informe de Incidencias', `${company} · ${safeDate(new Date())}`)

  const TYPE_LABEL = {
    SAFETY_RISK:      'Riesgo seg.',
    ACCIDENT:         'Accidente',
    NEAR_MISS:        'Casi-accidente',
    EQUIPMENT_FAULT:  'Fallo equipo',
    OTHER:            'Otro',
  }
  const SEV_LABEL = {
    LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
  }
  const STATUS_LABEL = {
    OPEN: 'Abierta', IN_PROGRESS: 'En progreso',
    RESOLVED: 'Resuelta', CLOSED: 'Cerrada',
  }

  if (!incidents || incidents.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text('No hay incidencias registradas.', 14, y + 6)
    doc.setTextColor(0, 0, 0)
  } else {
    autoTable(doc, {
      ...tableDefaults(y),
      head: [['Título', 'Tipo', 'Severidad', 'Estado', 'Ubicación', 'Reportado por', 'Fecha']],
      body: incidents.map((i) => [
        i.title          ?? '—',
        TYPE_LABEL[i.type]       ?? i.type   ?? '—',
        SEV_LABEL[i.severity]    ?? i.severity ?? '—',
        STATUS_LABEL[i.status]   ?? i.status  ?? '—',
        i.location       ?? '—',
        i.reportedByName ?? '—',
        safeDate(i.createdAt),
      ]),
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 35 },
        5: { cellWidth: 40 },
        6: { cellWidth: 30, halign: 'center' },
      },
    })

    // Totals by status
    const counts = incidents.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1
      return acc
    }, {})

    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const summary = Object.entries(counts)
      .map(([s, n]) => `${STATUS_LABEL[s] ?? s}: ${n}`)
      .join('  ·  ')
    doc.text(`Total: ${incidents.length}  |  ${summary}`, 14, finalY)
    doc.setFont('helvetica', 'normal')
  }

  addFooters(doc)
  doc.save(`prl-flow-incidencias-${todayStr()}.pdf`)
}

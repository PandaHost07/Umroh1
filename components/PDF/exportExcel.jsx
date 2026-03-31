import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { formatValueByType } from './renderFormattedCell'

const getColumns = (item) => (item ? Object.keys(item) : [])

export const exportToExcel = async (data = [], title = 'data-table') => {
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('Data kosong. File Excel tidak dibuat.')
        return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data')

    // Ambil kolom dari data pertama
    const columns = getColumns(data[0])

    if (columns.length === 0) {
        console.warn('Tidak ada kolom yang dapat diekspor.')
        return
    }

    // Buat tabel
    worksheet.addTable({
        name: 'ExportTable',
        ref: 'A1',
        headerRow: true,
        columns: columns.map(col => ({
            name: col.toUpperCase(),
            filterButton: true
        })),
        rows: data.map(item =>
            columns.map(col => {
                const raw = item[col]
                return formatValueByType ? formatValueByType(raw) : raw
            })
        )
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${title}.xlsx`)
}

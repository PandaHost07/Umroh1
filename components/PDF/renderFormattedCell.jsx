// components/renderFormattedCell.jsx
export function formatValueByType(value, type) {
    if (value == null || value === '') return '-';

    switch (type) {
        case 'date':
            return new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(new Date(value));

        case 'currency':
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(value));

        case 'number':
            return new Intl.NumberFormat('id-ID').format(Number(value));

        default:
            return value;
    }
}

// renderFormattedCell.jsx

export function renderFormattedCell(cell, { onImageClick } = {}) {
    const value = cell.getValue();
    const type = cell.column.columnDef.type;

    if (value == null || value === '') return '-';

    switch (type) {
        case 'image':
            return (
                <button
                    onClick={() => onImageClick?.(value)}
                    className="p-1 px-3 bg-gray-900 text-white rounded-sm font-semibold cursor-pointer hover:bg-gray-800 mx-auto flex"
                >
                    Lihat File
                </button>
            );

        case 'date':
            return formatValueByType(value, 'date');

        case 'currency':
            return formatValueByType(value, 'currency');

        case 'number':
            return formatValueByType(value, 'number');

        default:
            return value;
    }
}

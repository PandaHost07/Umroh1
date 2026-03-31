
export default function formatStatus(status) {
    let title = 'Status';
    let color = '#6b7280'; // default abu-abu

    if (typeof status === 'boolean') {
        title = status ? 'Aktif' : 'Tidak Aktif';
        color = status ? '#22c55e' : '#ef4444'; // hijau / merah
    } else {
        const normalized = (status || '').toLowerCase();
        if (normalized === 'terkonfirmasi') {
            title = 'Terkonfirmasi';
            color = '#22c55e';
        } else if (normalized === 'menunggu') {
            title = 'Menunggu Konfirmasi';
            color = '#eab308';
        } else {
            title = 'Tidak Terkonfirmasi';
            color = '#ef4444';
        }
    }

    return (
        <div
            className="p-1 w-fit px-3 text-white rounded-sm text-sm font-medium"
            style={{ backgroundColor: color }}
        >
            {title}
        </div>
    );
};


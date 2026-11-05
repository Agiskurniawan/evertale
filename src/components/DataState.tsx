// Tampilan sementara saat data masih dimuat / gagal dimuat / kosong
type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
};

export default function DataState({ loading, error, empty, emptyText = "Belum ada data." }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
        Memuat...
      </div>
    );
  }
  if (error) {
    return <div className="py-20 text-center text-sm text-red-400">{error}</div>;
  }
  if (empty) {
    return <div className="py-20 text-center text-sm text-slate-500">{emptyText}</div>;
  }
  return null;
}

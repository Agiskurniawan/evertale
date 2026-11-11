import { Link } from "react-router-dom";
import { assetUrl } from "../../lib/api";
import type { AuthorSerial } from "../../types";

interface CardAuthorSerialProps {
  serial: AuthorSerial;
}

export default function CardAuthorSerial({ serial }: CardAuthorSerialProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm dark:bg-[#101726] dark:border-white/10 dark:hover:border-white/20 transition-all w-full">
      {/* Cover Buku */}
      <img
        src={assetUrl(serial.cover)}
        alt={serial.title}
        className="h-24 w-16 rounded-xl object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
      />

      {/* Info Serial */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">
          {serial.title}
        </h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5 font-medium">
          Ep. Tulis {serial.episodes} · Draft {serial.drafts} · Update {serial.updated} · {serial.status}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{serial.lang}</p>

        {/* Tag Genre */}
        <div className="flex gap-1.5 flex-wrap">
          {serial.tags.map((t) => (
            <span
              key={t}
              className="text-xs text-gray-600 bg-gray-100 border border-gray-200 dark:text-gray-400 dark:bg-white/5 dark:border-white/10 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <Link
          to={`/author/karya/${serial.id}`}
          className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 dark:text-white dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors text-center"
        >
          Kelola Serial
        </Link>
        <Link
          to={`/author/tulis?serial=${serial.id}`}
          className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors text-center"
        >
          Kelola Episode
        </Link>
      </div>
    </div>
  );
}

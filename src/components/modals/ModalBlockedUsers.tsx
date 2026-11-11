import { Ban, X, Loader2, AlertCircle, User } from "lucide-react";
import { assetUrl } from "../../lib/api";

export type BlockedUser = {
  user_id: number;
  username: string;
  avatar: string | null;
  blocked_at: string;
};

interface ModalBlockedUsersProps {
  onClose: () => void;
  blockedUsers: BlockedUser[];
  loading: boolean;
  onUnblock: (userId: number, username: string) => void;
}

export default function ModalBlockedUsers({
  onClose,
  blockedUsers,
  loading,
  onUnblock,
}: ModalBlockedUsersProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500 dark:text-red-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Pengguna yang Diblokir
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 flex flex-col gap-4 max-h-96 overflow-y-auto">
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Pengguna yang Anda blokir tidak akan dapat mengirim komentar di seluruh karya dan episode Anda.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400 dark:text-slate-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
              <span>Memuat daftar...</span>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-gray-400 dark:text-slate-600" />
              <span>Belum ada pengguna yang diblokir.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
              {blockedUsers.map((u) => (
                <div
                  key={u.user_id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={assetUrl(u.avatar)}
                          alt={u.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        @{u.username}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-500">
                        Diblokir sejak{" "}
                        {new Date(u.blocked_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUnblock(u.user_id, u.username)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-xs font-semibold transition-colors"
                  >
                    Buka Blokir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

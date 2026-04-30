"use client";

/**
 * Delete confirmation dialog — replaces Bootstrap's modal + SweetAlert2 pattern.
 * Uses a simple overlay dialog instead of SweetAlert2.
 */

interface DeleteDialogProps {
    isOpen: boolean;
    assetId: number | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export function AssetDeleteDialog({
    isOpen,
    onConfirm,
    onCancel,
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Asset
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete this asset? This action cannot be
                        undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

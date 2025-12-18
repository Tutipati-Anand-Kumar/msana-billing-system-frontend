import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Dialog */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="text-yellow-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex space-x-3">
                            <button onClick={onClose} className="btn btn-secondary flex-1">
                                {cancelText}
                            </button>
                            <button onClick={onConfirm} className="btn btn-danger flex-1">
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

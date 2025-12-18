import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="text-red-600" size={24} />
                    <h3 className="text-lg font-semibold text-red-900">Error</h3>
                </div>
                <p className="text-red-700 mb-4">{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className="btn btn-primary w-full">
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;

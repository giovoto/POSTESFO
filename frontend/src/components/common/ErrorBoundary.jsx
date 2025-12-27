import React from 'react';
import { MdErrorOutline } from 'react-icons/md';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-slate-200">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                            <MdErrorOutline className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Ups! Algo salió mal</h2>
                        <p className="text-slate-600 mb-6">
                            Ha ocurrido un error inesperado en la aplicación. Por favor, intenta recargar la página.
                        </p>
                        <div className="bg-slate-100 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40 text-sm font-mono text-slate-700">
                            {this.state.error && this.state.error.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

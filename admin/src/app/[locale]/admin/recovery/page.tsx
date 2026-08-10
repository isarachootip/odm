"use client";

import { useState, useEffect } from 'react';
import { Loader2, Copy, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function RecoveryPage() {
    const [blobs, setBlobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBlobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blobs');
            const data = await res.json();
            if (data.success) {
                setBlobs(data.blobs);
            } else {
                setError(data.details || 'Failed to fetch');
            }
        } catch (err) {
            setError('Error connecting to simple API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlobs();
    }, []);

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('Copied URL!');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">📢 Image Recovery Center</h1>
                <button
                    onClick={fetchBlobs}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    Refresh Images
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {blobs.map((blob) => (
                        <div key={blob.url} className="bg-white rounded-xl shadow border overflow-hidden group">
                            <div className="aspect-square relative bg-gray-100">
                                <img
                                    src={blob.url}
                                    alt={blob.pathname}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => window.open(blob.url, '_blank')}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900"
                                        title="View Original"
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(blob.url)}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 text-blue-600"
                                        title="Copy URL"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-gray-500 truncate" title={blob.pathname}>
                                    {blob.pathname}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(blob.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && blobs.length === 0 && !error && (
                <div className="text-center py-20 text-gray-500">
                    No images found in blob storage.
                </div>
            )}
        </div>
    );
}

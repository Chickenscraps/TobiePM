'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    updatedAt: string;
}

export default function FileLibraryPage() {
    const { id: projectId } = useParams();
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const loadFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/projects/${projectId}/files?path=${encodeURIComponent(currentPath)}`);
            if (!res.ok) throw new Error('Failed to load files');
            const data = await res.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, currentPath]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList.item(i);
            if (file) {
                formData.append('files', file);
            }
        }
        formData.append('path', currentPath);

        try {
            const res = await fetch(`/api/projects/${projectId}/files`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            loadFiles(); // Refresh
        } catch (error) {
            alert('Failed to upload file');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div
            className="p-6 h-full flex flex-col"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Project Files</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage assets for this project.
                        {dragActive ? <span className="text-blue-400 font-bold ml-2">Drop files to upload!</span> : ' Drag & Drop supported.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Upload Files
                    </button>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 bg-white/5 p-2 rounded-lg">
                <button onClick={() => setCurrentPath('')} className="hover:text-white">Home</button>
                {currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                    <div key={index} className="flex items-center gap-2">
                        <span>/</span>
                        <button
                            className="hover:text-white"
                            onClick={() => {
                                const newPath = arr.slice(0, index + 1).join('/');
                                setCurrentPath(newPath);
                            }}
                        >
                            {part}
                        </button>
                    </div>
                ))}
            </div>

            {/* File List */}
            <div className="flex-1 bg-[#1A1A1C] border border-gray-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        <p>No files found. Drop files here to upload.</p>
                    </div>
                ) : (
                    <div className="overflow-auto max-h-[calc(100vh-250px)]">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 sticky top-0">
                                <tr>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium w-32">Size</th>
                                    <th className="p-4 font-medium w-48">Date Modified</th>
                                    <th className="p-4 font-medium w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {files.map((file) => (
                                    <tr
                                        key={file.path}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            if (file.isDirectory) {
                                                setCurrentPath(file.path);
                                            } else {
                                                // Handle file preview/download logic?
                                                alert(`Opening ${file.name}`);
                                            }
                                        }}
                                    >
                                        <td className="p-4 flex items-center gap-3 text-white">
                                            {file.isDirectory ? (
                                                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )}
                                            {file.name}
                                        </td>
                                        <td className="p-4">{formatSize(file.size)}</td>
                                        <td className="p-4">{new Date(file.updatedAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Drag Overlay */}
            {dragActive && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-xl flex items-center justify-center z-50 m-4 pointer-events-none">
                    <div className="text-blue-400 font-bold text-xl">Drop files to upload</div>
                </div>
            )}
        </div>
    );
}

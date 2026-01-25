'use client';

import { Download, FileText, Archive, FilePieChart } from 'lucide-react';

export default async function DownloadablesPage() {
    // Fetch files that are either linked to the brand guide or intended to be global
    // For now, we'll curate a set of "Recommended Downloadables"
    const files = [
        {
            id: 'brand-guide-doc',
            name: 'BRANDGUIDE.docx',
            type: 'Document',
            size: '2.4 MB',
            description: 'Core brand guidelines, fonts, and tone of voice.',
            icon: <FileText className="w-5 h-5" />,
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Placeholder
        },
        {
            id: 'logo-pack',
            name: 'TOBIE_LOGOS_V2.zip',
            type: 'Archive',
            size: '15.8 MB',
            description: 'SVG and PNG versions of all primary and secondary logos.',
            icon: <Archive className="w-5 h-5" />,
            url: '#'
        },
        {
            id: 'presentation-template',
            name: 'Tobie_Q1_Presentation.pptx',
            type: 'Template',
            size: '8.1 MB',
            description: 'Standard deck template for client presentations.',
            icon: <FilePieChart className="w-5 h-5" />,
            url: '#'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Downloadable Content</h1>
                    <p className="text-gray-400 mt-1">
                        High-priority assets and project templates for the team
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                    <div key={file.id} className="card group hover:border-primary-500/50 transition-all p-5 flex flex-col h-full bg-gray-900/40">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-primary-400 transition-colors">
                                {file.icon}
                            </div>
                            <span className="text-[10px] uppercase tracking-tighter text-gray-500 font-semibold px-2 py-0.5 bg-white/5 rounded border border-white/5">
                                {file.type}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors truncate">
                                {file.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                {file.description}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs text-gray-600 font-mono italic">{file.size}</span>
                            <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="flex items-center gap-2 text-xs font-bold text-primary-500 hover:text-primary-400 uppercase tracking-widest transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-white font-semibold">Need more assets?</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                    Contact Ann for specific project assets or legacy brand folders.
                </p>
            </div>
        </div>
    );
}

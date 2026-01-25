'use client';

import { useState } from 'react';
import { Save, Edit3, FileText, Download } from 'lucide-react';

interface BrandGuideEditorProps {
    projectId: string;
    initialContent: string;
}

export function BrandGuideEditor({ projectId, initialContent }: BrandGuideEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent || '# Brand Guide\n\nStart typing your brand guidelines here...');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: content }),
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to save Brand Guide:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Brand Guidelines</h2>
                        <p className="text-sm text-gray-400">Collaborative repository for brand assets and identity</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '_blank')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download BRANDGUIDE.docx
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Guidelines
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card min-h-[500px] flex flex-col overflow-hidden border-white/5 bg-gray-900/20 backdrop-blur-sm">
                {!isEditing ? (
                    <div className="flex-1 p-8 prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                        {content.split('\n').map((line, i) => (
                            <p key={i} className={line.startsWith('#') ? 'text-2xl font-bold text-white mt-4 mb-2' : 'text-gray-300'}>
                                {line}
                            </p>
                        ))}
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 p-8 bg-black/40 text-gray-200 font-mono text-sm border-none focus:ring-0 resize-none custom-scrollbar"
                        placeholder="Type your markdown here..."
                    />
                )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest px-1">
                <FileText className="w-3 h-3" />
                <span>Any user can edit and update these guidelines</span>
            </div>
        </div>
    );
}

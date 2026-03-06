import React from 'react';
import Editor from '@monaco-editor/react';

interface HTMLCodeEditorProps {
    html: string;
    onChange: (value: string) => void;
}

export const HTMLCodeEditor: React.FC<HTMLCodeEditorProps> = ({ html, onChange }) => {
    const handleChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    };

    return (
        <div className="h-[400px] border-t border-gray-200">
            <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                Code HTML
            </div>
            <Editor
                height="calc(100% - 40px)"
                language="html"
                value={html}
                onChange={handleChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                }}
            />
        </div>
    );
};

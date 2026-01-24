import fs from 'fs';
import path from 'path';

// For this project, we map storage to a local path as requested by the user
const LOCAL_STORAGE_ROOT = 'C:\\Users\\josha\\OneDrive\\Desktop\\TOBIE Project files';

export class LocalFileStorage {
    private rootPath: string;

    constructor(rootOverride?: string) {
        this.rootPath = rootOverride || LOCAL_STORAGE_ROOT;
        // Ensure root exists
        if (!fs.existsSync(this.rootPath)) {
            fs.mkdirSync(this.rootPath, { recursive: true });
        }
    }

    /**
     * List files in a project directory
     */
    async listFiles(projectName: string, subPath: string = ''): Promise<any[]> {
        const dirPath = path.join(this.rootPath, projectName, subPath);

        if (!fs.existsSync(dirPath)) {
            return [];
        }

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        return entries.map(entry => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            path: path.join(subPath, entry.name),
            size: entry.isDirectory() ? 0 : fs.statSync(path.join(dirPath, entry.name)).size,
            updatedAt: fs.statSync(path.join(dirPath, entry.name)).mtime,
        }));
    }

    /**
     * Save a file buffer to the storage
     */
    async saveFile(projectName: string, fileName: string, buffer: Buffer): Promise<string> {
        const projectPath = path.join(this.rootPath, projectName);

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        const filePath = path.join(projectPath, fileName);
        fs.writeFileSync(filePath, buffer);

        return filePath; // Return absolute path or relative ID
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(filePath: string): Promise<void> {
        // Security check: prevent directory traversal or deleting outside root
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(this.rootPath)) {
            // If it's just a relative path/filename, try to resolve it from root
            // But usually we store full paths. Let's handle both for safety.
            const resolvedPath = path.join(this.rootPath, filePath);
            if (fs.existsSync(resolvedPath)) {
                fs.unlinkSync(resolvedPath);
                return;
            }
            // If still not found or unsafe, log warning but don't crash
            console.warn(`Attempted to delete unsafe or non-existent path: ${filePath}`);
            return;
        }

        if (fs.existsSync(normalizedPath)) {
            fs.unlinkSync(normalizedPath);
        }
    }

    /**
     * Upload a File object to storage (Helper for consistency)
     */
    async uploadFile(file: File, subPath: string): Promise<string> {
        const buffer = Buffer.from(await file.arrayBuffer());
        // For local storage, we just save it. 
        // We use the subPath as the "project name" or folder structure here.
        // The saveFile method expects (projectName, fileName, buffer).
        // Let's adapt it.
        const [folder, ...rest] = subPath.split('/');
        const fileName = rest.join('/') || file.name;
        // Ensure folder is a string if split result behaves unexpectedly, though split always returns array of strings
        // The issue might be folder potentially being undefined? No, split returns [""].
        // But TS might infer string | undefined for array destructuring?
        const safeFolder = folder || 'default';

        return this.saveFile(safeFolder, fileName, buffer);
    }
}

// Export singleton for use in routes
export const storage = new LocalFileStorage();

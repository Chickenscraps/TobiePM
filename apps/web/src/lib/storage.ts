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
}

// Export singleton for use in routes
export const storage = new LocalFileStorage();

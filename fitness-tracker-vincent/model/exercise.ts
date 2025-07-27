import { App, CachedMetadata, normalizePath, Notice, TFile } from "obsidian";
import { ExerciseSession, parseFitnessSet } from "./exercise-session";

/**
 * Defines a fitness exercise (e.g. bench press).
 */
export default class Exercise {
    app: App;
    fileName: string;               // Base name of the exercise note.
    filePath: string;               // A full path you can use for proper linking.
    currentVolume: ExerciseSession; // How many sets/reps/kg you currently do.
    recordVolume: ExerciseSession;  // Highest volume ever lifted.

    personalNotes: string;          // Reminds when doing the exercise (markdown).
    latestComment: string;          // E.g. go up 1kg in volume next time.

    /**
     * Creates empty object. Call loadFromFile or other async functions to
     * populate fields.
     */
    constructor(app: App) {
        this.app = app;
        this.fileName = "";
        this.filePath = "";
        this.currentVolume = [];
        this.recordVolume = [];
        this.personalNotes = "";
        this.latestComment = "";
    }

    /**
     * Load all relevant data from an exercise note.
     */
    public async loadFromFile(fileName: string) {
        const file = this.getAllExerciseFiles().find(file => 
            file.basename.toLowerCase() === fileName.toLowerCase()
        );

        if (!file) // || !(file instanceof(TFile)))
            return;
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;
        
        this.fileName = fileName;
        this.filePath = file.path;
        // currentVolume should be set, but I handle this in workout.ts:
        this.currentVolume = frontmatter?.["current-volume"].map(parseFitnessSet) || [];
        this.recordVolume = frontmatter?.["record-volume"]?.map(parseFitnessSet) || [];
        await this.parsePersonalNotes(file, cache);
        this.latestComment = frontmatter?.["latest-comment"] || "";
    }

    /**
     * Returns a list of all files that define fitness-note-type: exercise in
     * the YAML.
     */
    public getAllExerciseFiles() {
        return this.app.vault.getMarkdownFiles()
            .filter(file => {
                const frontmatter =
                    this.app.metadataCache.getFileCache(file)?.frontmatter;
                return frontmatter?.["fitness-note-type"] === "exercise-note";
            })
    }

    /**
     * sets this.personalNotes to the related contents within the note
     * @param file The file contents.
     * @param cache The cache containing header information.
     */
    private async parsePersonalNotes(file: TFile, cache: CachedMetadata | null) {
        const content = await this.app.vault.read(file);
        const pnHeading = cache?.headings?.find(h => h.heading === "Personal Notes");
        if (!pnHeading) {
            const eMsg = `${this.fileName} note does not have a "Personal Notes" section. Leaving it blank.`;
            new Notice(eMsg);
            this.personalNotes = "";
            return;
        }
        const pnStart = pnHeading.position.end.offset;
        const nextHeading = cache?.headings?.find(h => 
            h.position.start.offset > pnStart && h.level <= pnHeading.level);
        const pnEnd = nextHeading ? nextHeading.position.start.offset : content.length;

        this.personalNotes = content.slice(pnStart, pnEnd).trim();
    }
};

// TODO add image as well. We'll see how later.
import Exercise from "model/exercise";
import { App, FuzzySuggestModal, TFile } from "obsidian";

/**
 * A modal that lets the user choose an exercise from a list.
 */
export default class SelectExerciseModal extends FuzzySuggestModal<TFile> {
    
    app: App;
    dummyExercise: Exercise;
    onSelect: (file: TFile) => void;
    
    constructor(app: App, onSelect: (file: TFile) => void) {
        super(app);
        this.dummyExercise = new Exercise(app);
        this.onSelect = onSelect
    }
    
    getItems(): TFile[] {
        return this.dummyExercise.getAllExerciseFiles();
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.onSelect(item);
    }
}
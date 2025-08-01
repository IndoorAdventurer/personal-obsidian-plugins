import { FitnessSet, serializeFitnessSet } from "model/exercise-session";
import Workout, { WorkoutExerciseItem } from "model/workout";
import { App, Component, MarkdownRenderChild, MarkdownRenderer, Notice } from "obsidian";
import SelectExerciseModal from "./select_exercise_modal";


/**
 * For showing a workout you completed before.
 */
export default class CompletedWorkoutView extends MarkdownRenderChild {
    workout: Workout;
    app: App;
    container: HTMLElement;

    /**
     * @param workout Workout data object to draw
     * @param parent parent HTML element to draw the interface inside of.
     */
    constructor(parent: HTMLElement, app: App, workout: Workout) {
        super(parent);
        this.workout = workout;
        this.app = app;
        
        parent.empty();
        this.container = parent.createDiv({});  //cls: "active-workout-container"});
    }
    
    /**
     * Shows a completed workout to the user.
     */
    public onload() {
        this.container.empty()
        this.container.createEl("h2", {text: "Completed Workout"}).style.marginBlockEnd = "0";
        this.container.createEl("b", {text: this.workout.workoutName}).style.color = "var(--text-muted)";

        // Always false because else we wouldn't be in the completed workout view.
        if (!this.workout.startTime || !this.workout.endTime) return;
        
        const fmtTime = (epochTime: number) => {
            const date = new Date(epochTime);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        }
        
        const date = new Date(this.workout.startTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const startTime = fmtTime(this.workout.startTime);
        const endTime = fmtTime(this.workout.endTime);

        this.container.createEl("small", {
            text: ` | ${year}-${month}-${day} | ${startTime} → ${endTime}`});

        this.drawTable();
    }

    /**
     * Draw the table of exercises for this workout.
     */
    private drawTable() {
        
        const div = this.container.createEl("div", {cls: "el-table"});
        div.style = "overflow-x: auto;";
        const table = div.createEl("table");

        const headRow = table.createEl("thead").createEl("tr");
        headRow.createEl("th", {text: "Exercise"});
        headRow.createEl("th", {text: "Sets/Reps"});
        headRow.createEl("th", {text: "Comments"});

        const body = table.createEl("tbody");
        for (const ex of this.workout.exercises) {
            const bodyRow = body.createEl("tr");
            
            // WikiLink to exercise note:
            bodyRow.createEl("td").createEl("a", {
                text: ex.exercise.fileName,
                cls: "internal-link",
                attr: {
                    'data-href': ex.exercise.filePath,
                    'href': ex.exercise.filePath,
                    'rel': 'noopener'
                }
            });

            const setsCell = bodyRow.createEl("td");
            const mDatProp = setsCell.createDiv({cls: "metadata-property"});
            mDatProp.setAttr("data-property-key", "tags");
            const mDatPropVal = mDatProp.createDiv({cls: "metadata-property-value"});
            const mDatPropCont = mDatPropVal.createDiv({cls: "multi-select-container"});

            for (const set of ex.done) {
                const text = serializeFitnessSet(set);
                const outerDiv = mDatPropCont.createDiv({cls: "multi-select-pill"});
                const innerDiv = outerDiv.createDiv({cls: "multi-select-pill-content"});
                innerDiv.createEl("small", {text: text});
            }
            
            bodyRow.createEl("td", {text: ex.comment});

        }
    }
};
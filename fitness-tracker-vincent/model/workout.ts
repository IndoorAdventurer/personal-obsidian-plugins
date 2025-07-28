import { App, Notice, parseYaml, stringifyYaml } from "obsidian";
import Exercise from "./exercise";
import { ExerciseSession, FitnessSet } from "./exercise-session";

/**
 * An exercise with some extra workout-specific data.
 */
export interface WorkoutExerciseItem {
    exercise: Exercise,         //   Which exercise it is.
    comment: string,            //   Comment the user writes down afterwards.
    done: ExerciseSession,      //   The completed sets.
    todo: ExerciseSession       //   The uncompleted sets.
};

export default class Workout {
    workoutName: string;        // E.g. Leg Day Workout
    startTime: number | null;   // Unix time when we started the exercise
    endTime: number | null;     // Unix time when we ended the exercise

    // List of exercises for this workout:
    exercises: WorkoutExerciseItem[];

    /**
     * Constructor creates new empty workout
     */
    constructor(name: string) {
        this.workoutName = name;
        // TODO: add settings as data member here too if required later on.
        this.startTime = null;
        this.endTime = null;
        this.exercises = [];
    }

    /**
     * Factory function. Returns a `Workout` object from a yaml string
     */
    static async workoutFromYaml(yamlStr: string, app: App): Promise<Workout> {
        try {
            const yamlObj = parseYaml(yamlStr);
            
            const name = yamlObj["workout-name"] || yamlObj["workoutName"] || undefined;
            if (!name)
                throw Error(`Make sure you give your workout a name (workout-name: "Name")`);
            const wo = new Workout(name);
            wo.startTime = Workout.humanReadableTimeToEpoch(yamlObj.startTime);
            wo.endTime = Workout.humanReadableTimeToEpoch(yamlObj.endTime);
    
            // Parse the rest of the data. Either a new workout or a reload:
            if ("exercise-list" in yamlObj)
                await this.exercisesFromYamlFresh(yamlObj, wo, app);
            else if ("exercises" in yamlObj)
                await this.exercisesFromYamlReload(yamlObj, wo, app);
            else {
                throw Error(`Can't parse workout. Make sure you specify "exercise-list".`);
            }
            
            return wo;
            
        } catch (error) {
            if (error instanceof Error) {
                new Notice(`Error: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Add an exercise to this workout from a file name.
     */
    public async addExercise(fileName: string, app: App) {
        const exercise = new Exercise(app);
        await exercise.loadFromFile(fileName);

        this.exercises.push({
            exercise: exercise,
            comment: "",
            done: [],
            todo: exercise.currentVolume
        });
    }

    /**
     * Delete en exercise from this workout.
     * @returns 
     */
    public deleteExercise(ex: WorkoutExerciseItem) {
        const exIdx = this.exercises.indexOf(ex);
        if (exIdx !== -1) {
            this.exercises.splice(exIdx, 1);
            return;
        }
        throw Error("Exercise does not exist.");
    }

    /**
     * Move an exercise up or down in the list
     * @param ex The exercise to move
     * @param relative Relative position (e.g. -1 for one up; +1 for one down).
     */
    public moveExercise(ex: WorkoutExerciseItem, relative: number) {
        const exIdx = this.exercises.indexOf(ex);
        if (exIdx === -1)
            throw Error("Exercise does not exist.");

        const newIdx = exIdx + relative;

        if (newIdx < 0 || newIdx >= this.exercises.length)
            return; // Do nothing. Also no error.

        [this.exercises[exIdx], this.exercises[newIdx]] =
            [this.exercises[newIdx], this.exercises[exIdx]];
    }

    /**
     * @returns string containing a yaml representation of this object
     */
    public toYaml(): string {
        const data = {
            ...this,
            startTime: Workout.epochTimeToHumanReadable(this.startTime),
            endTime: Workout.epochTimeToHumanReadable(this.endTime),
            exercises: this.exercises.map(item => {
                return {...item, exercise: item.exercise.fileName};
            })
        };

        return stringifyYaml(data);
    }

    /**
     * Loading exercises from a fresh new workout (i.e. yaml written by human)
     */
    private static async exercisesFromYamlFresh(
            yamlObj: any, wo: Workout, app: App) {
        for (const el of yamlObj["exercise-list"]) {
            if (!(el[0] && el[0][0] && typeof el[0][0] === "string" && el[0][0].length > 1)) {
                throw Error("Make sure exercise-list is a list of [[WikiLinks]].");
            }
            
            await wo.addExercise(el[0][0], app);
        }
    }

    /**
     * Loading exercises from a non-fresh workout (i.e. the GUI reloaded while
     * a workout had already started).
     */
    private static async exercisesFromYamlReload(
            yamlObj: any, wo: Workout, app: App) {
        for (const data of yamlObj["exercises"]) {
            const exercise = new Exercise(app);
            await exercise.loadFromFile(data["exercise"]);
            
            wo.exercises.push({
                ...data,
                exercise: exercise
            })
        }
    }

    /**
     * Turns a timestamp gotten from Date.now() into a human readable date string.
     */
    private static epochTimeToHumanReadable(timestamp: number | null): string | null{
        if (!timestamp)
            return null;
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    /**
     * Turns a human readable date string YYYY-MM-DDTHH:MM:SS into epoch time
     */
    private static humanReadableTimeToEpoch(timestamp: string | undefined): number | null {
        if (timestamp)
            return new Date(timestamp).getTime();
        return null;
    }
    
    /**
     * Toggles set between done and not done.
     * @param item 
     * @param exercise 
     */
    static toggleSetDone(exercise: WorkoutExerciseItem, set: FitnessSet) {
        const indexInDone = exercise.done.indexOf(set);
        if (indexInDone !== -1) {   // It was in "done".
            exercise.done.splice(indexInDone, 1);
            exercise.todo.unshift(set);
            return;
        }

        const indexInTodo = exercise.todo.indexOf(set);
        if (indexInTodo !== -1) {   // It was in "todo".
            exercise.todo.splice(indexInTodo, 1);
            exercise.done.push(set);
            return;
        }
        
        throw Error("Set does not belong to this exercise.");
    }

    /**
     * Adds a set to a given exercise by copying the last one.
     */
    static addSet(exercise: WorkoutExerciseItem) {
        const lastElement = exercise.todo.at(-1) ?? exercise.done.at(-1);
        if (!lastElement) {
            new Notice("Please manually add at least one set to the exercise file so I know the units.");
            throw Error("Need at least one set so I know the units.");
        }
        exercise.todo.push(structuredClone(lastElement));
    }

    /**
     * Deletes all todo sets from a given exercise.
     */
    static deleteTodoSets(exercise: WorkoutExerciseItem) {
        if (exercise.done.length === 0) {
            new Notice("Exercises must have at least one set.");
            return;
        }
        exercise.todo = [];
    }
};
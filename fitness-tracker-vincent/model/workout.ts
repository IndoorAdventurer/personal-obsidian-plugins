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
        this.startTime = null;
        this.endTime = null;
        this.exercises = [];
    }

    /**
     * Factory function. Returns a `Workout` object from a yaml string
     */
    static async workoutFromYaml(yamlStr: string, app: App): Promise<Workout> {
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
            const eMsg = `Can't parse workout. Make sure you specify "exercise-list".`;
            new Notice(eMsg);
            throw Error(eMsg);
        }
        
        return wo;
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
                return {...item, exercise: item.exercise.notePath};
            })
        };

        return stringifyYaml(data);
    }

    /**
     * Loading exercises from a fresh new workout (i.e. yaml written by human)
     */
    private static async exercisesFromYamlFresh(yamlObj: any, wo: Workout, app: App) {
        for (const el of yamlObj["exercise-list"]) {
            if (!(el[0] && el[0][0] && typeof el[0][0] === "string" && el[0][0].length > 1)) {
                const eMsg = "Make sure exercise-list is a list of [[WikiLinks]].";
                new Notice(eMsg);
                throw Error(eMsg);
            }
            
            const exercise = new Exercise(app);
            await exercise.loadFromFile(el[0][0]);

            wo.exercises.push({
                exercise: exercise,
                comment: "",
                done: [],
                todo: exercise.currentVolume
            });
        }
    }

    /**
     * Loading exercises from a non-fresh workout (i.e. the GUI reloaded while
     * a workout had already started).
     */
    private static async exercisesFromYamlReload(yamlObj: any, wo: Workout, app: App) {
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
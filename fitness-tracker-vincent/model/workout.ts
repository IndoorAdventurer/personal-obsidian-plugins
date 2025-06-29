import { Notice } from "obsidian";
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
};
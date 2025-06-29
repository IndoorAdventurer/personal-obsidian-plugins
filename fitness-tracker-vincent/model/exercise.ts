import { ExerciseSession } from "./exercise-session";

/**
 * Defines a fitness exercise (e.g. bench press).
 */
export default class Exercise {
    notePath: string;               // Note corresponding to this exercise.
    currentVolume: ExerciseSession; // How many sets/reps/kg you currently do.
    recordVolume: ExerciseSession;  // Highest volume ever lifted.

    personalNotes: string;          // Reminds when doing the exercise (markdown).
    latestComment: string;          // E.g. go up 1kg in volume next time.
};

// TODO add image as well. We'll see how later.
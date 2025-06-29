
/**
 * Defines a single workout set.
 */
export interface FitnessSet {
    repetitions: number;
    weight: number;
    unit: "kg" | "kg/dumbbell" | "bodyweight";
}

/**
 * Defines your total workout volume for a single exercise.
 */
export type ExerciseSession = FitnessSet[];

/**
 * TODO functions for:
 * - parsing ExerciseSession from yaml (use parseYaml, probably)
 *  - robust against different ways of writing down units (kg, kilogram; pd, per dumbbell, etc).
 * - writing ExerciseSession down as yaml
 * - calculating total load so I can say if I broke any records (total volume is just everything multiplied)
 * - calculating 1RM so I can track that too. [optional]
 */
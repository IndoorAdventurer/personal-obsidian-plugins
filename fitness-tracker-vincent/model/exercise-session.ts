const kgAlias = ["kg", "kilogram", "kilo", "kilos"];

/**.
 * Maps standard way of writing it to all allowed ways of writing it:
 */
const unitAliasList = {
    "kg": kgAlias,
    "kg/dumbbell": [" per dumbbell", "/dumbbell", " p.d.", " pd", "pd"]
        .flatMap(pd => kgAlias.map(kg => kg + pd)),
    "bodyweight": ["bodyweight"]
};

/**
 * For each unit the standard way of writing it:
 */
type NormalizedFitnessUnits = keyof typeof unitAliasList;

/**
 * Defines a single workout set.
*/
export interface FitnessSet {
    repetitions: number;
    weight: number;
    unit: NormalizedFitnessUnits;
};

/**
 * Defines your total workout volume for a single exercise.
 */
export type ExerciseSession = FitnessSet[];

/**
 * @param data a string describing a set (e.g. 10x 15 kg pd).
 */
export function parseFitnessSet(data: string): FitnessSet {
    // Parsing "NUMBER x" part
    const repsRegex = "\\s*(\\d+)\\s*x\\s*";

    // Parsing NUMBER UNIT
    const weigtUnitRegex = "(\\d+(?:[.,]\\d+)?)\\s*([a-zA-Z./ ]+)\\s*";

    // Total regex: reps and optional weight+unit:
    const totalRegex = new RegExp(`^${repsRegex}(?:${weigtUnitRegex})?\$`);

    const match = data.toLowerCase().match(totalRegex);
    if (!match)
        throw Error(`Could not parse fitness set "${data}"`);
    
    if (!match[2]) {
        return {
            repetitions: parseInt(match[1]),
            weight: 1,
            unit: "bodyweight"
        };
    } else if (match[3]) {
        return {
            repetitions: parseInt(match[1]),
            weight: parseFloat(match[2]),
            unit: normalizeUnit(match[3])
        }
    }
    throw Error("Something went wrong..")
}

/**
 * Returns string representation from fitness set.
 */
export function serializeFitnessSet(set: FitnessSet): string {
    if (set.unit === "bodyweight")
        return `${set.repetitions}x`;
    return `${set.repetitions} x ${set.weight} ${set.unit}`;
}

/**
 * Returns the normalized form of a fitness unit from the input
 * (e.g. kilogram pd -> kg/dumbbell)
 */
function normalizeUnit(unit: string) {
    for (const key in unitAliasList) {
        if (unitAliasList[key as NormalizedFitnessUnits].includes(unit))
            return key as NormalizedFitnessUnits;
    }
    throw Error(`Could not find unit ${unit}.`);
}

/**
 * Computes the total load of an Exercise session, which is basically just
 * sets x reps x weight.
 * @param session 
 * @returns 
 */
export function computeVolume(session: ExerciseSession) {
    // TODO: unit-specific mods: scale lbs to kg; multiply by 2 for per dumbbell
    return session
        .map(set => set.repetitions * set.weight)
        .reduce((sum, n) => sum + n, 0);
}

/**
 * TODO functions for:
 * - writing ExerciseSession down as yaml
 * - calculating 1RM so I can track that too. [optional]
 */
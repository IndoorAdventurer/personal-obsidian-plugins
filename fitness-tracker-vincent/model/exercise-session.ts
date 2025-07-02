const kgAlias = ["kg", "kilogram"];

/**.
 * Maps standard way of writing it to all allowed ways of writing it:
 */
const unitAliasList = {
    "kg": kgAlias,
    "kg per dumbbell": [" per dumbbell", "/dumbbell", " p.d.", " pd", "pd"]
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
    const weigtUnitRegex = "(\\d+)\\s*([a-zA-Z./ ]+)\\s*";

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
 * TODO functions for:
 * - writing ExerciseSession down as yaml
 * - calculating total load so I can say if I broke any records (total volume is just everything multiplied)
 * - calculating 1RM so I can track that too. [optional]
 */

/**
 * Data the user can set:
 */
export interface FitnessAppSettings {
    exerciseFolder: string;  // Folder with notes for individual exercises
};

/**
 * Default values for FitnessAppSettings:
 */
export const FITNESSAPP_DEFAULT_SETTINGS: Partial<FitnessAppSettings> = {
    exerciseFolder: ""      // Root directory by default
}
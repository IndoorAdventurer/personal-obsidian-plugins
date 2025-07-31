# Obsidian Fitness Tracking Plugin

Track your workouts seamlessly within your Obsidian vault with this powerful fitness plugin. Manage exercises, create workout templates, and monitor your progress—all while keeping your fitness data integrated with your note-taking system.

## Features

- **Exercise Management**: Create individual notes for each exercise with personal comments and form cues
- **Workout Templates**: Build reusable workout templates for different training days
- **Progress Tracking**: Check off completed sets and automatically update exercise records
- **Personal Notes**: Add comments and reminders that carry forward to your next workout
- **Integrated Workflow**: Seamlessly fits into your daily note-taking routine

## Getting Started

### 1. Setting Up Exercise Notes

For each exercise you want to track, create a new note using the included exercise template. For example:

- `Push Ups.md`
- `Dumbbell Bench Press.md`
- `Squats.md`

Each exercise note will store your historical data, personal form cues, and progress notes.

### 2. Creating Workout Templates

Create templates for your different workout routines (e.g., "Push Day", "Pull Day", "Leg Day"). Each template should contain a fitness-workout codeblock with your desired exercises:

```
    ```fitness-workout
    workout-name: Push Day
    exercise-list:
    - [[Push Ups]]
    - [[Dumbbell Bench Press]]
    - [[Overhead Press]]
    - [[Tricep Dips]]
    ```
```

### 3. Adding Workouts to Daily Notes

In your daily notes, insert one of your workout templates. The plugin will process the codeblock and provide an interactive workout interface.

## Usage

### Basic Workout Structure

Use YAML format with WikiLinks for exercises:

```
    ```fitness-workout
    workout-name: Your Workout Name
    exercise-list:
    - [[Exercise Name]]
    - [[Another Exercise]]
    ```
```

### Adding Workout-Specific Comments

You can add contextual comments to specific exercises for this particular workout using the pipe syntax:

```
    ```fitness-workout
    workout-name: Upper Body
    exercise-list:
    - [[Push Ups | Start with knees if needed]]
    - [[Squats | Optional - only if energy permits]]
    - [[Plank | Hold for 30-60 seconds]]
    ```
```

These comments are specific to this workout instance and are different from the general form cues stored in your exercise notes.

### During Your Workout

When you open a daily note with a workout codeblock, the plugin provides:

1. **Set Tracking**: Check off completed sets as you finish them
2. **Weight/Reps Updates**: Modify weights or reps on the fly—changes automatically sync to your exercise notes
3. **Personal Comments**: View your saved form cues and reminders for each exercise
4. **Progress Notes**: Add notes about how the workout went for future reference (e.g. "Went well. Should go up 1 kg next time.")

### Exercise Notes Features

Each exercise note can contain:

- **Form Cues**: Personal reminders about proper technique (e.g., "Keep back straight", "Control the negative")
- **Progress History**: Automatic tracking of weights, reps, and sets over time
- **Workout Notes**: Comments you add during workouts that help inform future sessions

## Example Workflow

1. **Setup Phase**:
   - Create exercise notes for Push Ups, Squats, Dumbbell Rows
   - Add personal form cues to each exercise note
   - Use Obsidian's built-in template functionality to create a "Full Body" workout template with your YAML codeblock and WikiLink exercise list

2. **Daily Use**:
   - Open today's daily note
   - Insert your "Full Body" workout template using Obsidian's template feature
   - Complete your workout, checking off sets and updating weights
   - Add a note: "Felt strong today, ready to increase weight next time"

3. **Next Workout**:
   - Your exercise notes now contain updated weights and your previous note
   - The plugin reminds you of your intention to increase weight

## Benefits of This Approach

- **Integrated Knowledge**: Your fitness data lives alongside your other notes and thoughts
- **Flexible Structure**: Adapt workouts on the fly with comments and modifications
- **Personal Coaching**: Build your own database of form cues and technique reminders
- **Progress Visibility**: See your improvement over time within the familiar Obsidian interface
- **Sustainable System**: No need for separate apps—everything lives in your existing workflow

Start tracking your fitness journey today and turn your Obsidian vault into a comprehensive fitness companion!

---

*This README was written by Claude (Anthropic's AI assistant).*
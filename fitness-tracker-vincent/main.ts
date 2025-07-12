import Exercise from 'model/exercise';
import Workout from 'model/workout';
import { MarkdownPostProcessorContext, parseYaml, Plugin, stringifyYaml } from 'obsidian';
import ActiveWorkoutView from 'presentation/active-workout-view';


export default class FitnessPlugin extends Plugin {
	
	async onload() {
		
		this.registerMarkdownCodeBlockProcessor("fitness-workout",
			async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				
				const workout = await Workout.workoutFromYaml(source, this.app);
				const aView = new ActiveWorkoutView(el, this.app, workout);
				ctx.addChild(aView);
				aView.load();


				// console.log(workout.toYaml());

				// console.log(ctx);
				// console.log(el);
				// console.log(ctx.getSectionInfo(el));
				// const sInfo = ctx.getSectionInfo(el);
				// if (!sInfo) throw Error("Could not find block");
				// const {lineStart, lineEnd} = sInfo;

				// const newBlock = '```fitness-workout\nworkout-name: "Hoi"\nexercise-list:\n - [[Dumbbell Bench Press]]\n```\n';
				
				// const editor = this.app.workspace.activeEditor?.editor;
				// if (!editor) throw Error("No active editor!");

				// setTimeout(() => {
				// 	editor.replaceRange(newBlock, {line: lineStart, ch: 0}, {line: lineEnd+1, ch:0});
				// 	console.log("Change made!");
				// }, 5000);
				
				// console.log("Loading exercise file")
				
				// const exercise = new Exercise(this.app);
				// await exercise.loadFromFile("Dumbbell Bench Press");
				
				
				
				// const workout: Workout = {
				// 	workoutName: "Push Day Workout",
				// 	startTime: 100,
				// 	endTime: null,
				// 	exercises: [
				// 		{
				// 			exercise: {
				// 				notePath: "Dumbbell bench press",
				// 				currentVolume: [],
				// 				recordVolume: [],
				// 				personalNotes: "Keep going.",
				// 				latestComment: "Went well."
				// 			},
				// 			comment: "Went well",
				// 			done: [
				// 				{repetitions: 10, weight: 20, unit: "kg"},
				// 			],
				// 			todo: [
				// 				{repetitions: 10, weight: 30, unit: "kg"},
				// 				{repetitions: 10, weight: 40, unit: "kg"},
				// 			]
				// 		},
				// 		{
				// 			exercise: {
				// 				notePath: "Assisted pull-ups",
				// 				currentVolume: [],
				// 				recordVolume: [],
				// 				personalNotes: "Keep **going**.\n - Aaap\n - Noot\n - Mies",
				// 				latestComment: "Went well."
				// 			},
				// 			comment: "Went well",
				// 			done: [],
				// 			todo: [
				// 				{repetitions: 10, weight: 1, unit: "bodyweight"},
				// 				{repetitions: 10, weight: 1, unit: "bodyweight"},
				// 			]
				// 		},
				// 		{
				// 			exercise: {
				// 				notePath: "Romanian deadlifts",
				// 				currentVolume: [],
				// 				recordVolume: [],
				// 				personalNotes: "This one was ~~not~~ hard!",
				// 				latestComment: ""
				// 			},
				// 			comment: "Went well",
				// 			done: [],
				// 			todo: []
				// 		},
				// 	]
				// };

				// const aView = new ActiveWorkoutView(workout, this.app, el);
				// aView.drawWorkout();
				


				// const rows = source.split('\n').filter((row) => row.length > 0);

				
				// // Now test with callout:
				// const callout = el.createDiv("callout");
				// callout.setAttribute("data-callout", "info");
				// callout.setAttribute("data-callout-fold", "-");
				// callout.addClass("callout", "is-collapsible", "is-collapsed")
				
				// const callout_title = callout.createDiv("callout-title");
				
				// const titleText = callout_title.createDiv("callout-title-inner");
				// titleText.textContent = "Super Geile Callout";

				// const collapse_icon = callout_title.createDiv("callout-icon");
				// collapse_icon.addClass("callout-fold", "is-collapsed")
				// collapse_icon.innerHTML = `
				// <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
				// 	viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
				// 	stroke-linejoin="round" class="svg-icon lucide-chevron-down">
				// 	<path d="m6 9 6 6 6-6"></path>
				// </svg>`;
				// const callout_content = callout.createDiv("callout-content");
				// callout_content.style.display = "none";
				// // const my_content = callout_content.createDiv();
				// // my_content.textContent = "Dag iedereeen!!! ^^";

				// const table = callout_content.createEl('table');
				// const body = table.createEl('tbody');

				// for (let i = 0; i < rows.length; i++) {
				// 	const cols = rows[i].split(',');

				// 	const row = body.createEl('tr');

				// 	for (let j = 0; j < cols.length; j++) {
				// 		row.createEl('td', { text: cols[j] });
				// 	}
				// }

				// // Adding an image:
				// console.log(this.app.vault.adapter.getResourcePath("https://upload.wikimedia.org/wikipedia/commons/4/43/Maarten_van_Rossem_-_2025_%28001%29_%28cropped%29.jpg"));
				// const img = callout_content.createEl("img", {attr: {src: this.app.vault.adapter.getResourcePath("https://upload.wikimedia.org/wikipedia/commons/4/43/Maarten_van_Rossem_-_2025_%28001%29_%28cropped%29.jpg"), alt: "MVR"}});
				// img.style.width = "100px";

				// let is_collapsed = false;

				// callout_title.addEventListener("click", () => {
				// 	is_collapsed = !is_collapsed;

				// 	if (is_collapsed) {
				// 		callout.addClass("is-collapsed");
				// 		collapse_icon.addClass("is-collapsed");
				// 		callout_content.style.display = "none";
				// 	} else {
				// 		callout.removeClass("is-collapsed");
				// 		collapse_icon.removeClass("is-collapsed");
				// 		callout_content.style = "";
				// 	}
				// })
			}
		)

		// const my_list = ["aap", "noot", "mies"];

// 		const eg_yaml = `- aap
// - noot   
// - mies`
// 		console.log(parseYaml(eg_yaml));

	}

	async onunload() {
		// Nothing yet
	}

	// async loadSettings() {
	// 	this.settings = Object.assign({}, ZETTELSUITE_DEFAULT_SETTINGS, await this.loadData());
	// }

	// async saveSettings() {
	// 	this.saveData(this.settings)
	// }
}


// <div class="el-div">
	// <div data-callout-metadata="" data-callout-fold="-" data-callout="note" class="callout is-collapsible is-collapsed">
		// <div class="callout-title" dir="auto"><div class="callout-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg></div><div class="callout-title-inner">Callout</div><div class="callout-fold is-collapsed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg></div></div><div class="callout-content" style="display: none;">
		// <p dir="auto">This is a test callout. I just want to see what will happen</p>
		// </div>
	// </div>
// </div>
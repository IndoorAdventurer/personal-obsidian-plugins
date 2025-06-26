import { MarkdownPostProcessorContext, Plugin } from 'obsidian';


export default class FitnessPlugin extends Plugin {
	
	async onload() {
		
		this.registerMarkdownCodeBlockProcessor("fitness-tracker",
			(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				const rows = source.split('\n').filter((row) => row.length > 0);

				const table = el.createEl('table');
				const body = table.createEl('tbody');

				for (let i = 0; i < rows.length; i++) {
					const cols = rows[i].split(',');

					const row = body.createEl('tr');

					for (let j = 0; j < cols.length; j++) {
						row.createEl('td', { text: cols[j] });
					}
				}
			}
		)

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

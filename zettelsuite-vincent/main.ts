import { Editor, EditorPosition, MarkdownView, Menu, MenuItem, Plugin, TFile, Workspace, WorkspaceLeaf, normalizePath } from 'obsidian';
import ZettelSuiteView, {NoteDef} from 'zettel_suite_view';
import { ZettelSuiteSettings, ZETTELSUITE_DEFAULT_SETTINGS } from 'zettel_suite_settings';
import ZettelSuiteSettingsTab from 'zettel_suite_settings_tab';
// import * as path from 'path';

/**
 * This plugin is for quickly creating boilerplate notes for my Zettelkasten
 * system, directly at the right place.
 */
export default class ZettelSuitePlugin extends Plugin {

	settings: ZettelSuiteSettings;

	// Default templates within the plugin directory:
	template_files: {[key: string]: string} = {
		moc: "moc-template.md",
		fleeting: "fleeting-note-template.md",
		permanent: "permanent-note-template.md",
		literature: "literature-note-template.md",
		annotations: "paper-annotations-template.md"
	};

	// Corresponding settings keys (because i'm an idiot and didn't give them
	// the same names 🤷‍♂️)
	settings_keys: {[key: keyof typeof this.template_files]: string} = {
		moc: "custom_moc_template",
		fleeting: "custom_fleeting_template",
		permanent: "custom_permanent_template",
		literature: "custom_literature_template",
		annotations: "custom_annotations_template"
	};

	async onload() {
		this.extendTemplatePaths();
		
		await this.loadSettings();
		this.addSettingTab(new ZettelSuiteSettingsTab(this.app, this));

		// This plugin is mainly a single view that lets you create a note from
		// a form.
		this.registerView(
			ZettelSuiteView.VIEW_TYPE_ZETTELSUITEVIEW,
			leaf => new ZettelSuiteView(
				leaf,
				nd => this.createSimpleNote(nd),
				nd => this.createLiteratureNote(nd)
			)
		);

		// Adding a command to re-open the main view if someone closes it.
		this.addCommand({
			id: "open-view",
			name: "Open Zettelsuite Panel",
			callback: () => this.activateView()
		})

		// Adding creation options to the context menu for non-existing notes:
		this.registerEvent(
			this.app.workspace.on("editor-menu",
				(menu: Menu, editor: Editor, info: MarkdownView) =>
					this.addContextMenuOptions(menu, editor, info))
		);
	}

	async onunload() {
		// Nothing yet
	}

	/**
	 * Create a MOC, fleeting note or permanent note
	 * @param nd contains all the data (in this case just title and type) to create.
	 */
	async createSimpleNote(nd: NoteDef) {
		let template = await this.load_file(this.resolveTemplatePath(nd.note_type))
		template = this.templateInserts(template, nd);
		const directory = {
			moc: this.settings.moc_folder,
			fleeting: this.settings.fleeting_folder,
			literature: this.settings.literature_folder,
			permanent: this.settings.permanent_folder
		}[nd.note_type]
		await this.createFileAndOpen(nd.file_name!, directory, template);
	}

	/**
	 * @param nd contains data to create the literature note from
	 */
	async createLiteratureNote(nd: NoteDef) {
		let lit_template = await this.load_file(this.resolveTemplatePath("literature"))
		let ann_template = await this.load_file(this.resolveTemplatePath("annotations"))

		const lit_name = this.nameFromNoteDef(nd, "literature")
		const ann_name = this.nameFromNoteDef(nd, "annotations")

		lit_template = this.templateInserts(lit_template, {
			...nd,
			file_name: lit_name,
			annotations_file: nd.annotation_target ? ann_name : ""
		});
		ann_template = this.templateInserts(ann_template, {...nd, file_name: ann_name});

		if (nd.annotation_target) // Doing first so literature note gets opened last/on top
			await this.createFileAndOpen(ann_name, this.settings.annotations_folders, ann_template);
		await this.createFileAndOpen(lit_name, this.settings.literature_folder, lit_template);
	}

	/**
	 * Opens the side panel. For if it got closed for some reason.
	 */
	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(
			ZettelSuiteView.VIEW_TYPE_ZETTELSUITEVIEW)
		
		if (leaves.length > 0)
			leaf = leaves[0];
		else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: ZettelSuiteView.VIEW_TYPE_ZETTELSUITEVIEW,
				active: true
			})
		}

		if (leaf)
			workspace.revealLeaf(leaf);
	}

	/**
	 * Checks if we right-clicked on a non-existing note, and shows options to
	 * create it as MOC, fleeting or permanent note if so.
	 * @param menu The context menu to add the options to
	 * @param editor The Editor object
	 * @param info the Markdown view
	 */
	private addContextMenuOptions(menu: Menu, editor: Editor, info: MarkdownView) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		const wikiLink = this.getWikiLinkAtCursor(line, cursor.ch)
		if (	// Return if we didn't click on link or if linked file
				// exists already:
			!wikiLink ||
			this.app.metadataCache
				.getFirstLinkpathDest(wikiLink, info.file?.path || ""))
			return;

			// Creating menu items to create with template:
			for (const [type, name] of [
				["moc", "MOC"],
				["fleeting", "Fleeting Note"],
				["permanent", "Permanent Note"]
			]) {
				menu.addItem(item => item
					.setTitle(`Create as ${name}`)
					.onClick(async ev => this.createSimpleNote({
						note_type: type as any, file_name: wikiLink
					}))
				);
			}
	}

	/**
	 * shortcut for loading file:
	 */
	async load_file(file_name: string) {
		return await this.app.vault.adapter.read(file_name);
	}

	/**
	 * Prepends the full path to the template file names.
	 */
	private extendTemplatePaths() {
		if (!this.manifest.dir) {
			console.error("Can't read plugin dir to get templates :-(");
			return;
		}
		const plugin_dir = normalizePath(`${this.manifest.dir}/templates`);
		for (const key in this.template_files)
			this.template_files[key] = normalizePath(`${plugin_dir}/${this.template_files[key]}`);
	}

	/**
	 * Either returns path from this.template_files, or from custom user settings
	 * @param key A key into this.templates_files
	 */
	private resolveTemplatePath(note_type: keyof typeof this.template_files): string {
		const settings_key = this.settings_keys[note_type] as keyof ZettelSuiteSettings;
		if (this.settings[settings_key] && typeof this.settings[settings_key] === "string")
			return this.settings[settings_key];
		return this.template_files[note_type]
	}

	/**
	 * For literature notes and annotations files, the name should be either
	 * Lastname, YYYY, Title or lastname_YYYY Title. This function creates
	 * those names from nd.
	 */
	private nameFromNoteDef(nd: NoteDef, type: "literature" | "annotations") {
		let name = "anonymous";
		if (nd.authors && nd.authors[0])
			name = nd.authors[0].split(",")[0].trim();
		if (type === "literature")
			return `${name}, ${nd.pubdate}, ${nd.title}`;
		return `${name.toLocaleLowerCase()}_${nd.pubdate} ${nd.title}`;
	}

	/**
	 * Replaces strings between double curly brackets with relevant data
	 * @param template The template to replace these for
	 * @param nd Data structure containing relevant data from user input
	 * @returns Modified version of `template`
	 */
	private templateInserts(template: string, nd: NoteDef): string {
		const orEmptyStr = (str: string | undefined) => str ? str : "";
		const tag_list = this.settings.default_tags.map(tag => `\n  - ${tag}`)
			.join("");
		const annotations_file =
			nd.annotations_file ? `"[[${nd.annotations_file}]]"`: "none";

		const convertAuthor = (author: string) => {
			const parts = author.split(",")
				.map(part => part.trim()).filter(part => part.length > 0);
			if (parts.length !== 2)
				return author.trim();
			const [ lastName, Firstnames ] = parts;
			return `\n  - ${Firstnames} ${lastName}`
		}
		const authors = nd.authors?.map(convertAuthor).join("");
		
		return template
			// General:
			.replace(/{{file_name}}/g, orEmptyStr(nd.file_name))
			.replace(/{{today}}/g, this.getDateTime())
			.replace(/{{tags}}/g, tag_list)

			// Literature notes specific:
			.replace(/{{lit_type}}/g, orEmptyStr(nd.lit_type))
			.replace(/{{annotations_file}}/g, annotations_file)
			.replace(/{{title}}/g, orEmptyStr(nd.title))
			.replace(/{{authors}}/g, orEmptyStr(authors))
			.replace(/{{pubdate}}/g, orEmptyStr(nd.pubdate))
			.replace(/{{bibtex}}/g, orEmptyStr(nd.bibtex))
			.replace(/{{annotation_target}}/g, orEmptyStr(nd.annotation_target))
	}

	/**
	 * @returns A data and time string the way Obsidian likes it.
	 */
	private getDateTime(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	/**
	 * @param name File name (.md will be appended to it)
	 * @param directory Directory to put file in
	 * @param contents File contents
	 */
	private async createFileAndOpen(name: string, directory: string, contents: string) {
		const full_path = normalizePath(`${directory}/${name}.md`);
		await this.app.vault.create(full_path, contents);
		const to_open = await this.app.vault.getAbstractFileByPath(full_path);
		if (to_open && to_open instanceof TFile)
			await this.app.workspace.getLeaf("tab").openFile(to_open);
	}

	/**
	 * Returns the file name of a wikilink if we right clicked on one. Else,
	 * returns an empty string
	 * @param line the line we clicked on (string)
	 * @param column the index within line closed to the clicking position
	 */
	private getWikiLinkAtCursor(line: string, column: number): string {
		const wikiLinkRegEx = /\[\[([^\]]+)\]\]/g

		// Finding if we right-clicked on a link:
		let match;
		while ((match = wikiLinkRegEx.exec(line)) !== null) {
			const [start, end] = [match.index, match.index + match[0].length];
			if (column >= start && column <= end)
				break;
		}
		if (!match)
			return "";

		// Taking of the potential alias part and returning it:
		return match[1].split("|")[0].trim();
	}

	async loadSettings() {
		this.settings = Object.assign({}, ZETTELSUITE_DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		this.saveData(this.settings)
	}
}

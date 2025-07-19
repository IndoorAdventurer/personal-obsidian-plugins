import FitnessPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

/**
 * User Interface for changing the settings related to this plugin.
 */
export class FitnessAppSettingsTab extends PluginSettingTab {
    plugin: FitnessPlugin;

    constructor(app: App, plugin: FitnessPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Exercise Folder")
            .setDesc("Folder containing your exercise notes. Each note should" +
                " represent one exercise (e.g., 'Bench Press', 'Chin-Up')." +
                " Make sure the folder already exists!"
            ).addText(text =>
                text
                    .setPlaceholder("e.g. My_Exercises/")
                    .setValue(this.plugin.settings.exerciseFolder)
                    .onChange(async value => {
                        this.plugin.settings.exerciseFolder = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
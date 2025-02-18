import { AgeOfSigmarActorSheet } from "./actor-sheet.js";

export class NpcSheet extends AgeOfSigmarActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/age-of-sigmar-soulbound/template/sheet/npc.html",
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
            ].concat(buttons);
        }
        return buttons;
    }
}

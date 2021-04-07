import { prepareCustomRoll, prepareCommonRoll, prepareCombatRoll, preparePowerRoll } from "../common/dialog.js";

export class AgeOfSigmarActorSheet extends ActorSheet {

    getData() {
        const data = super.getData();
        data.data = data.data.data; // project system data so that handlebars has the same name and value paths
        return data;
      }    


    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-create").click(ev => this._onItemCreate(ev));
        html.find(".item-edit").click(ev => this._onItemEdit(ev));
        html.find(".item-delete").click(ev => this._onItemDelete(ev));
        html.find("input").focusin(ev => this._onFocusIn(ev));
        html.find(".item-state").click(async ev => await this._onItemStateUpdate(ev));
        html.find(".roll-attribute").click(async ev => await this._prepareRollAttribute(ev));
        html.find(".roll-skill").click(async ev => await this._prepareRollSkill(ev));
        html.find(".roll-weapon").click(async ev => await this._prepareRollWeapon(ev));
        html.find(".roll-power").click(async ev => await this._prepareRollPower(ev));
		html.find(".show-power").click(async ev => await this._prepareShowPower(ev));
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
                {
                    label: game.i18n.localize("BUTTON.ROLL"),
                    class: "custom-roll",
                    icon: "fas fa-dice",
                    onclick: async (ev) => await prepareCustomRoll()
                }
            ].concat(buttons);
        }
        return buttons;
    }

    _onItemCreate(event) {
        event.preventDefault();
        let header = event.currentTarget;
        let data = foundry.utils.deepClone(header.dataset);
        data["name"] = `New ${data.type.capitalize()}`;
        this.actor.createEmbeddedDocuments("Item", [data], {renderSheet: true});
    }

    _onItemEdit(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", div.data("itemId"));
        item.sheet.render(true);
    }

    _onItemDelete(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
        div.slideUp(200, () => this.render(false));
    }

    _onFocusIn(event) {
        $(event.currentTarget).select();
    }

    async _onItemStateUpdate(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", (div.data("itemId")))
        let data;
        switch (item.data.data.state) {
            case "active":
                data = { _id: item.id, "data.state": "equipped"};
                break;
            case "equipped":
                data = { _id: item.id, "data.state": "other"};
                break;
            default:
                data = { _id: item.id, "data.state": "active"};
                break;
        }
        await this.actor.updateEmbeddedDocuments("Item", [data]);
        this._render();
    }

    async _prepareRollAttribute(event) {
        event.preventDefault();
        const attributeName = $(event.currentTarget).data("attribute");
        const attributes = this._setSelectedAttribute(attributeName)
        const skills = this._setSelectedSkill(null)
        await prepareCommonRoll(attributes, skills);
    }

    async _prepareRollSkill(event) {
        event.preventDefault();
        const skillName = $(event.currentTarget).data("skill");
        const attribute = this.actor.data.data.skills[skillName].attribute
        const attributes = this._setSelectedAttribute(attribute)
        const skills = this._setSelectedSkill(skillName)
        await prepareCommonRoll(attributes, skills);
    }

    async _prepareRollWeapon(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weapon = this.actor.getEmbeddedDocument("Item", div.data("itemId"));
        let attributeName, skillName;
        if (weapon.data.data.category === "melee") {
            attributeName = "body";
            skillName = "weaponSkill"
        } else {
            attributeName = "body";
            skillName = "ballisticSkill"
        }
        const attributes = this._setSelectedAttribute(attributeName)
        const skills = this._setSelectedSkill(skillName)
        const combat = this._getCombat(weapon);
        await prepareCombatRoll(attributes, skills, combat);
    }

    async _prepareRollPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.getEmbeddedDocument("Item", div.data("itemId"));
        let attributes, skills;
        if (power.data.type === "spell") {
            attributes = this._setSelectedAttribute("mind")
            skills = this._setSelectedSkill("channelling")
        } else {
            attributes = this._setSelectedAttribute("soul")
            skills = this._setSelectedSkill("devotion")
        }
        await preparePowerRoll(attributes, skills, power);
    }
	
	async _prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.getEmbeddedDocument("Item", div.data("itemId"));
        await power.sendToChat()
    }

    _setSelectedAttribute(attributeName) {
        let attributes = foundry.utils.deepClone(this.actor.data.data.attributes);
        for (let attribute of Object.values(attributes)) {
            attribute.selected = false;
        }
        if (attributeName) attributes[attributeName].selected = true;
        return attributes
    }

    _setSelectedSkill(skillName) {
        let skills = foundry.utils.deepClone(this.actor.data.data.skills);
        for (let skill of Object.values(skills)) {
            skill.selected = false;
        }
        if (skillName) skills[skillName].selected = true;
        return skills
    }

    _getCombat(weapon) {
        return {
            melee: this.actor.data.data.combat.melee.relative,
            accuracy: this.actor.data.data.combat.accuracy.relative,
            weapon: {
                name: weapon.data.name,
                category: weapon.data.data.category,
                damage: weapon.data.data.damage,
                traits: weapon.data.data.traits
            }
        };
    }
}
import { AgeOfSigmarActor } from "./actor/actor-aos.js";
import { AgeOfSigmarItem } from "./item/item-aos.js";
import { PlayerSheet } from "./actor/sheet/player-sheet.js";
import { NpcSheet } from "./actor/sheet/npc-sheet.js";
import { PartySheet } from "./actor/sheet/party-sheet.js";
import { AgeOfSigmarItemSheet } from "./item/sheet/item-sheet.js";
import { initializeHandlebars } from "./system/handlebars.js";
import hooks from "./system/hooks.js"
import AOS from "./system/config.js"
import Migration from "./system/migrations.js";
import SoulboundUtility from "./system/utility.js";
import Test from "./system/tests/test.js";
import CombatTest from "./system/tests/combat-test.js";
import SpellTest from "./system/tests/spell-test.js";
import MiracleTest from "./system/tests/miracle-test.js";
import ItemTraits from "./apps/item-traits.js"
import AgeOfSigmarEffect from "./system/effect.js";
import AgeOfSigmarEffectSheet from "./apps/active-effect-config.js";
import SoulboundCounter from "./apps/counter.js";
import ModuleUpdater from "./apps/module-updater.js";
import ModuleInitializer from "./apps/module-initialization.js";
import TagManager from "./system/tag-manager.js";
import ZoneConfig from "./apps/zone-config.js";

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = AgeOfSigmarActor;
    CONFIG.Item.documentClass = AgeOfSigmarItem;
    CONFIG.ActiveEffect.documentClass = AgeOfSigmarEffect
    CONFIG.ActiveEffect.sheetClass = AgeOfSigmarEffectSheet
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("age-of-sigmar-soulbound", PlayerSheet, { types: ["player"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", NpcSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", PartySheet, { types: ["party"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("age-of-sigmar-soulbound", AgeOfSigmarItemSheet, { makeDefault: true });
    initializeHandlebars();
    
    game.aos = {
        config : AOS,
        migration : Migration,
        utility : SoulboundUtility,
        rollClass : {
            Test,
            CombatTest,
            SpellTest,
            MiracleTest
        },
        apps: {
            ItemTraits,
            ModuleUpdater,
            ModuleInitializer,
            ZoneConfig
        },
        tags: new TagManager()
    };
    
    game.counter = new SoulboundCounter()
    
    CONFIG.fontDefinitions["Quadrant-Regular"] = {editor : true, fonts : []}
    CONFIG.defaultFontFamily = "Quadrant-Regular"
    CONFIG.canvasTextStyle._fontFamily = "Quadrant-Regular"
});

hooks();
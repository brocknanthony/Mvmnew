const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Gettext = imports.gettext.domain("cinnamon-applets");
const _ = Gettext.gettext;

const appletUUID = 'slideshow@cinnamon.org';
const AppletDirectory = imports.ui.appletManager.appletMeta[appletUUID].path;

function MyApplet(metadata, orientation, panel_height, instanceId) {
    this._init(metadata, orientation, panel_height, instanceId);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panel_height, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instanceId);

        this._slideshowSettings = new Gio.Settings({ schema: 'org.cinnamon.desktop.background.slideshow' });

        try {
            if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
                if (!this._slideshowSettings.get_boolean("slideshow-paused")) {
                    this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
                    this.set_applet_tooltip(_("Click to pause the currently active slideshow"));
                } else {
                    this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
                    this.set_applet_tooltip(_("Click to resume the currently active slideshow"));
                }
            } else {
                this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-disabled-symbolic.svg');
                this.set_applet_tooltip(_("No slideshow currently active. Right click to activate or configure"));
            }

            this._slideshowSettings.connect("changed::slideshow-enabled", Lang.bind(this, this._on_slideshow_enabled_changed));
            this._slideshowSettings.connect("changed::slideshow-paused", Lang.bind(this, this._on_slideshow_paused_changed));

            this.enable_slideshow_switch = new PopupMenu.PopupSwitchMenuItem(_("Slideshow Active"), this._slideshowSettings.get_boolean("slideshow-enabled"));
            this._applet_context_menu.addMenuItem(this.enable_slideshow_switch);
            this.enable_slideshow_switch.connect("toggled", Lang.bind(this, this._on_slideshow_enabled_toggled));

            this._applet_context_menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            this.next_image_context_menu_item = new Applet.MenuItem(_("Next Image"), "media-seek-forward", Lang.bind(this, this.get_next_image));
            this._applet_context_menu.addMenuItem(this.next_image_context_menu_item);

            this._applet_context_menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            this.open_settings_context_menu_item = new Applet.MenuItem(_("Background Settings"), "preferences-desktop-wallpaper", Lang.bind(this, function() {
                Util.spawnCommandLine("cinnamon-settings backgrounds")
            }));
            this._applet_context_menu.addMenuItem(this.open_settings_context_menu_item);
        }
        catch(e) {
            global.logError(e);
        }
  
    },

    on_applet_clicked: function(event) {
        if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
            if (!this._slideshowSettings.get_boolean("slideshow-paused")) {
                this._slideshowSettings.set_boolean("slideshow-paused", true);
                this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
                this.set_applet_tooltip(_("Click to resume the currently active slideshow"));
            } else {
                this._slideshowSettings.set_boolean("slideshow-paused", false);
                this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
                this.set_applet_tooltip(_("Click to pause the currently active slideshow"));
            }
        }
    },

    _on_slideshow_enabled_toggled: function() {
        if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
            this._slideshowSettings.set_boolean("slideshow-enabled", false);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-disabled-symbolic.svg');
            this.set_applet_tooltip(_("No slideshow currently active. Right click to activate or configure"));
        } else {
            this._slideshowSettings.set_boolean("slideshow-enabled", true);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
            this.set_applet_tooltip(_("Click to pause the currently active slideshow"));
        }
    },

    _on_slideshow_enabled_changed: function() {
        if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
            this.enable_slideshow_switch.setToggleState(true);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
            this.set_applet_tooltip(_("Click to pause the currently active slideshow"));
        } else {
            this.enable_slideshow_switch.setToggleState(false);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-disabled-symbolic.svg');
            this.set_applet_tooltip(_("No slideshow currently active. Right click to activate or configure"));
        }
    },

    _on_slideshow_paused_changed: function() {
        if (this._slideshowSettings.get_boolean("slideshow-paused")) {
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
            this.set_applet_tooltip(_("Click to resume the current slideshow"));
        } else {
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
            this.set_applet_tooltip(_("Click to pause the current slideshow"));
        }
    },

    get_next_image: function() {
        Main.slideshowManager.getNextImage();
    }
};

function main(metadata, orientation, panel_height, instanceId) {
    let myApplet = new MyApplet(metadata, orientation, panel_height, instanceId);
    return myApplet;
}

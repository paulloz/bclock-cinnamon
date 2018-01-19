const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const UPowerGlib = imports.gi.UPowerGlib;

function BClock(metadata, orientation, panel_height, instance_id) {
    this._init(metadata, orientation, panel_height, instance_id);
}

let ROWS = 4;
let COLUMNS = 6;

BClock.prototype = {
    __proto__: Applet.Applet.prototype,

    _init: function(metadata, orientation, panel_height, instance_id) {
        Applet.Applet.prototype._init.call(this, orientation, panel_height, instance_id);

        this.setAllowedLayout(Applet.AllowedLayout.HORIZONTAL);
        this.actor.remove_style_class_name('applet-box');

        let spacing = 1 * global.ui_scale;
        let height = (panel_height - (3 * spacing)) / 4;
        let width = height * 1.5;

        let manager;
        manager = new Clutter.GridLayout({
            "column-spacing": spacing,
            "row-spacing": spacing,
            "column-homogeneous": true,
            "row-homogeneous": true
        });
        this.manager = manager;
        this.manager_container = new Clutter.Actor({ layout_manager: manager });
        this.actor.add_actor(this.manager_container);
        this.manager_container.show();

        // B-Clock is 4 rows and 6 columns
        this.cells = [];
        for (let row = 0; row < ROWS; ++row) {
            for (let column = 0; column < COLUMNS; ++column) {
                let cell = new St.Button({
                    style_class: 'workspace'
                });
                cell.set_width(width);
                cell.set_height(height);
                this.manager_container.add_actor(cell);
                this.manager.attach(cell, column, row, 1, 1);
                cell.show();
                this.cells.push(cell);
            }
        }

        this._upClient = new UPowerGlib.Client();
        try {
            this._upClient.connect('notify-resume', Lang.bind(this, this._update));
        } catch (e) {
            this._upClient.connect('notify::resume', Lang.bind(this, this._update));
        }

        this._updatePeriodic();
    },

    _update: function() {
        let now = new Date();
        let nextUpdate = 60 - now.getSeconds() + 1;

        let cur_col = 0;

        for (let time of [now.getHours(), now.getMinutes(), now.getSeconds()]) {
            for (let x of [parseInt(time / 10), parseInt(time % 10)]) {
                for (let row = ROWS - 1; row >= 0; --row) {
                    this.cells[(COLUMNS * row) + cur_col].style_class = x & 1 ? 'on' : 'off';
                    x >>>= 1;
                }
                ++cur_col;
            }
        }

        for (let idx of [0, 2, 4, 6]) this.cells[idx].style_class = '';

        nextUpdate = 1;

        return nextUpdate;
    },

    _updatePeriodic: function() {
        let nextUpdate = this._update();
        this._periodicTimeoutId = Mainloop.timeout_add_seconds(nextUpdate, Lang.bind(this, this._updatePeriodic));
    },

    on_applet_removed_from_panel: function() {
        if (this._periodicTimeoutId) {
            Mainloop.source_remove(this._periodicTimeoutId);
        }
    }
};

function main(metadata, orientation, panel_height, instance_id) {
    return (new BClock(metadata, orientation, panel_height, instance_id));
}

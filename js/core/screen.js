/* ==========================================================================
   SCREEN — the settings that belong to the machine, not to one mode: how
   bright the tube is, whether the glass shows, the volume and the alert sound.
   They are chosen in the Monitors and Sound control panels but apply to both
   the Desktop and the Terminal, so they are applied from the start.
   ========================================================================== */
import { Settings } from './settings.js';
import { Sound } from './sound.js';
import { params } from './util.js';

export function initScreen() {
    const dim = document.getElementById('screenDim');
    Settings.on((key, value) => {
        if (key === 'brightness') dim.style.opacity = String(((100 - value) / 100) * 0.85);
        else if (key === 'glass') document.body.classList.toggle('fx-off', params.get('fx') === '0' || !value);
        else if (key === 'volume') Sound.setLevel(value / 7);
        else if (key === 'alert') Sound.alertKind = value;
    }, { immediate: true });
}

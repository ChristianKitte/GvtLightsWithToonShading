//*************************************************************************
// App Werte
//*************************************************************************

/**
 * Die Nummer des aktiven Modells
 * @type {number}
 */
var activeModel = 0;

/**
 * Die Einstellung zur Ausführung der Animation
 * @type {boolean}
 */
var animateScene = document.getElementById("animate-scene").checked;

/**
 * Der Infotext für den verwendeten Projektionstyp
 * @type {HTMLElement}
 */
var projektionsText = document.getElementById("projection_text");
projektionsText.innerText = "Projektionstyp: Orthogonal";

/**
 * Definiert einige default Phong-Materialien
 * @type {{}} Ein PhongMaterial
 */
var phongDefaultMaterial = {};
phongDefaultMaterial.Default = createPhongMaterial();
phongDefaultMaterial.Red = createPhongMaterial({kd: [1., 0., 0.]});
phongDefaultMaterial.Green = createPhongMaterial({kd: [0., 1., 0.]});
phongDefaultMaterial.Blue = createPhongMaterial({kd: [0., 0., 1.]});
phongDefaultMaterial.White = createPhongMaterial({
    ka: [1., 1., 1.],
    kd: [0., 1., 0.],
    ks: [1., 0., 0.]
});

/**
 * Erzeugt ein Material zur Verwendung mit der Phong Beleuchtungsberechnung auf Basis
 * von vier Reflexions-Koeffizienten. Diese stellen einen RGB Vektor dar:
 * ka - Ambiente Reflexion (Umgebungslicht)
 * kd - Difuse Reflexion (Konturen)
 * ks - Spekulare Reflexion (Glanzpunkte)
 * ke - Spiegel- oder Phong-Koeffizient
 * @param material Vorgaben mit optionaler Vorgabe von ka, kd, ks, ke
 * @returns {{}} Ein PhongMaterial
 */
function createPhongMaterial(material) {
    material = material || {};
    // Set some default values,
    // if not defined in material paramter.
    material.ka = material.ka || [0.6, 0.6, 0.6];
    material.kd = material.kd || [0.6, 0.6, 0.6];
    material.ks = material.ks || [0.8, 0.8, 0.8];
    material.ke = material.ke || 10.;

    return material;
}

//*************************************************************************
// 3th Party
//
// Start der Animation
// http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
//
//*************************************************************************

/**
 * Implement requestAnimationFrame
 * @type {((callback: FrameRequestCallback) => number)|*|(function(*): number)}
 */
window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function (f) {
        return setTimeout(f, 1000 / 60)
    } // simulate calling code 60

/**
 * Implement cancelAnimationFrame
 * @type {((handle: number) => void)|*|(function(*): void)}
 */
window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || function (requestID) {
        clearTimeout(requestID)
    } //fall back

//*************************************************************************
// UI Handler
//*************************************************************************

/**
 * Setzt den Wert für die Ausführung der Animation
 */
document.getElementById("animate-scene").onchange = () => {
    animateScene = document.getElementById("animate-scene").checked;

    if (animateScene) {
        window.requestAnimationFrame(app.rotate);
    } else {
        window.cancelAnimationFrame(app.rotate);
    }
}
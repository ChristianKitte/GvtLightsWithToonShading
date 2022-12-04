/**
 * Startet die Anwendung
 */
window.onload = function () {
    app.start()
    window.requestAnimationFrame(app.rotate);
}

/**
 * Kapselt die Initziierung und Konfiguration von WebGL
 * @type {{webGL: {}}}
 */
var WebGlInstance = (function () {
    /**
     * Die Klasse webGL
     * @type {{}}
     */
    let webGL = {};

    /**
     * Startet die Iniziierung von WebGL
     */
    webGL.create = function () {
        iniWebGl();
    }

    /**
     * Iniziiert WebGL
     */
    function iniWebGl() {
        /**
         * Der aktuell gültige WebGL Kontext
         * @type {*} Ein WebGL Kontext
         */
        getContext(webGL, 0.9, 0.9, 0.9, 1);

        /**
         * Das Aktuell gültige WebGL Programm
         */
        webGL.program = webGL.gl.createProgram();

        iniWebGLApp();
        initUniforms();
    }

    /**
     * Konfiguriert den Zugriff auf die verwendeten Uniform Variablen
     */
    function initUniforms() {
        // Zugriff auf uniform uModel
        webGL.program.modelMatrix = webGL.gl.getUniformLocation(webGL.program, "uModel");

        // Zugriff auf uniform uView
        webGL.program.viewMatrix = webGL.gl.getUniformLocation(webGL.program, "uView");

        // Zugriff auf uniform uProjection
        webGL.program.projectionMatrix = webGL.gl.getUniformLocation(webGL.program, "uProjection");

        // Zugriff auf uniform Umgebungslicht ambientLight
        webGL.program.ambientLightUniform = webGL.gl.getUniformLocation(webGL.program, "ambientLight");

        // Array für Zugriff auf  Lichtquellen
        webGL.program.lightUniform = [];

        // Array für Zugriff auf max. 10 Lichtquellen mit je einer uniform struct light
        for (var j = 0; j < 10; j++) {
            var lightNb = "light[" + j + "]";
            // Store one object for every light source.
            var l = {};
            l.isOn = webGL.gl.getUniformLocation(webGL.program, lightNb + ".isOn");
            l.position = webGL.gl.getUniformLocation(webGL.program, lightNb + ".position");
            l.color = webGL.gl.getUniformLocation(webGL.program, lightNb + ".color");
            webGL.program.lightUniform[j] = l;
        }

        // Zugriff auf die eizelnen felder der uniform struct material
        webGL.program.materialKaUniform = webGL.gl.getUniformLocation(webGL.program, "material.ka");
        webGL.program.materialKdUniform = webGL.gl.getUniformLocation(webGL.program, "material.kd");
        webGL.program.materialKsUniform = webGL.gl.getUniformLocation(webGL.program, "material.ks");
        webGL.program.materialKeUniform = webGL.gl.getUniformLocation(webGL.program, "material.ke");
    }

    /**
     * Erzeugt einen WebGL Kontext mit dem als RGB übergebenen Farbwert als Hintergrund
     * und gibt diesen zurück. Zusätzlich wird der Ausgabebereich vergrößert
     *
     * http://www.ibesora.me/creating-a-webgl2-canvas/
     *
     * @param redVal Der Rotwert des Hintergrundes
     * @param greenVal Der Grünwert des Hintergrundes
     * @param blueVal Der Blauwert des Hintergrundes
     * @param alphaVal Der Aplhawert des Hintergrundes
     * @returns {*} Einen WebGL Kontext
     */
    function getContext(redVal, greenVal, blueVal, alphaVal) {
        // Get the WebGL context
        let canvas = document.getElementById('canvas');

        webGL.gl = canvas.getContext('webgl2');
        webGL.gl.viewportWidth = canvas.width;
        webGL.gl.viewportHeight = canvas.height;
        webGL.gl.viewport(0, 0, webGL.gl.canvas.width, webGL.gl.canvas.height);

        webGL.gl.clearColor(redVal, greenVal, blueVal, alphaVal);//RGB der Hintergrundfarbe
    }

    /**
     * Initialisiert und konfiguriert die WebGL Anwendung und definiert die Shader und
     * das Programm. Es wird ein gültiger WebGL Kontext erwartet.
     */
    function iniWebGLApp() {
        var vsShader = webGL.gl.createShader(webGL.gl.VERTEX_SHADER);
        webGL.gl.shaderSource(vsShader, vertexShader);
        webGL.gl.compileShader(vsShader);
        webGL.gl.attachShader(webGL.program, vsShader);

        var fsShader = webGL.gl.createShader(webGL.gl.FRAGMENT_SHADER);
        webGL.gl.shaderSource(fsShader, fragmentShader);
        webGL.gl.compileShader(fsShader);
        webGL.gl.attachShader(webGL.program, fsShader);

        webGL.gl.linkProgram(webGL.program);

        if (!webGL.gl.getProgramParameter(webGL.program, webGL.gl.LINK_STATUS)) {
            console.log(webGL.gl.getShaderInfoLog(vertexShader));
            console.log(webGL.gl.getShaderInfoLog(fragmentShader));
        }

        const src = webGL.gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(vsShader);
        console.log(src);

        webGL.gl.frontFace(webGL.gl.CCW);
        webGL.gl.enable(webGL.gl.CULL_FACE);
        webGL.gl.cullFace(webGL.gl.BACK);

        // Depth(Z)-Buffer.
        webGL.gl.enable(webGL.gl.DEPTH_TEST);
        webGL.gl.depthFunc(webGL.gl.LEQUAL);

        // Polygon offset of rastered Fragments.
        webGL.gl.enable(webGL.gl.POLYGON_OFFSET_FILL);
        webGL.gl.polygonOffset(5, 5);

        webGL.gl.useProgram(webGL.program);
    }

    /**
     * Legt das WebGL Objekt offen
     */
    return {
        webGL: webGL
    }
}());







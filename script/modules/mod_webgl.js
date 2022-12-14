/**
 * Kapselt die Initialisierung und Konfiguration von WebGL
 * @type {{webGL: {}}}
 */
var WebGlInstance = (function () {
    /**
     * Die Klasse webGL
     * @type {{}}
     */
    let webGL = {};

    /**
     * Definiert die Lichtquellen einer Szene
     * @type {{light: [{color: number[], isOn: boolean, position: number[]},{color: number[], isOn: boolean, position: number[]}], ambientLight: number[]}}
     */
    let beleuchtung = {
        /**
         * Umgebungslicht
         */
        ambientLight: [0.5, 0.5, 0.5],

        /**
         * Punktlichter
         */
        light: [
            {
                isOn: true,
                position: [6., 1., 3.],
                //position: [0., 0., 0.],
                color: [1., 1., 0.]
            }, {
                isOn: true,
                position: [6., 1., 3.],
                //position: [0., 0., 0.],
                color: [1., 1., 0.]
            },]
    };

    /**
     * Startet die Initialisierung von WebGL
     */
    webGL.create = function () {
        iniWebGl();
    }

    /**
     * Initialisiert WebGL
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

    var lightUniform = [];

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
        WebGlInstance.webGL.gl.uniform3fv(webGL.program.ambientLightUniform, beleuchtung.ambientLight);

        // Zugriff auf die eizelnen Felder der uniform struct material
        webGL.program.materialKaUniform = webGL.gl.getUniformLocation(webGL.program, "material.ka");
        webGL.program.materialKdUniform = webGL.gl.getUniformLocation(webGL.program, "material.kd");
        webGL.program.materialKsUniform = webGL.gl.getUniformLocation(webGL.program, "material.ks");
        webGL.program.materialKeUniform = webGL.gl.getUniformLocation(webGL.program, "material.ke");

        // Belegen der eizelnen Felder der uniform struct material mit einem Defaultwert
        WebGlInstance.webGL.gl.uniform3fv(webGL.program.materialKaUniform, phongDefaultMaterial.Default.ka);
        WebGlInstance.webGL.gl.uniform3fv(webGL.program.materialKdUniform, phongDefaultMaterial.Default.kd);
        WebGlInstance.webGL.gl.uniform3fv(webGL.program.materialKsUniform, phongDefaultMaterial.Default.ks);
        WebGlInstance.webGL.gl.uniform1f(webGL.program.materialKeUniform, phongDefaultMaterial.Default.ke);

        // Array für Zugriff auf  Lichtquellen
        //webGL.program.lightUniform = [];

        // Array für Zugriff auf max. 10 Lichtquellen mit je einer uniform struct light
        for (var j = 0; j < beleuchtung.light.length; j++) {
            var lightNb = "light[" + j + "]";
            // Store one object for every light source.

            var l = {};
            l.isOn = webGL.gl.getUniformLocation(webGL.program, lightNb + ".isOn");
            l.position = webGL.gl.getUniformLocation(webGL.program, lightNb + ".position");
            l.color = webGL.gl.getUniformLocation(webGL.program, lightNb + ".color");

            lightUniform[j] = l;
        }

        /*
        for (var j = 0; j < beleuchtung.light.length; j++) {
            if (beleuchtung.light[j].isOn) {
                // bool is transferred as integer.
                WebGlInstance.webGL.gl.uniform1i(webGL.program.lightUniform[j].isOn, beleuchtung.light[j].isOn);

                // Tranform light postion in eye coordinates.
                // Copy current light position into a new array.
                let lightPos = [].concat(beleuchtung.light[j].position);

                // Add homogenious coordinate for transformation.
                //lightPos.push(1.0);
                //vec4.transformMat4(lightPos, lightPos, camera.vMatrix);

                // Remove homogenious coordinate.
                //lightPos.pop();
                //WebGlInstance.webGL.uniform3fv(webGL.program.lightUniform[j].position, lightPos);
                WebGlInstance.webGL.gl.uniform3fv(webGL.program.lightUniform[j].position, beleuchtung.light[j].position);
                WebGlInstance.webGL.gl.uniform3fv(webGL.program.lightUniform[j].color, beleuchtung.light[j].color);
            }
        }*/
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

        //const src = webGL.gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(vsShader);
        //console.log(src);

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
        webGL: webGL,
        sceneLight: beleuchtung,
        sceneLightUniform: lightUniform
    }
}());







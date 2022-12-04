/**
 * Das Hauptmodul der Anwendung. Es steuert die Ausgabe der model sowie deren Erzeugung und
 * ermöglciht eine Interaktion
 * @type {{start: start}}
 */
var app = (function () {
    /**
     * Eine Kollektion der aktuell auszugebenden model
     * @type {*[]}
     */
    let models = [];

    /**
     * Zeitspanne zwischen Animation in Millisekunde
     * @type {number}
     */
    let animationRate = 500;

    /**
     * Definiert eine virtuelle Kamera
     * @type {{eye: number[], distance: number, lrtb: number, vMatrix: mat4, center: number[], projectionType: string, up: number[], fovy: number, pMatrix: mat4, zAngle: number}}
     */
    let camera = {
        // Initial position of the camera.
        eye: [0, 1, 4],
        // Point to look at.
        center: [0.1, -.5, -2],
        // Roll and pitch of the camera.
        up: [0, 1, 0],
        // Opening angle given in radian.
        // radian = degree*2*PI/360.
        fovy: 60.0 * Math.PI / 180,
        // Camera near plane dimensions:
        // value for left right top bottom in projection.
        lrtb: 14.0, //3.0,
        // View matrix.
        vMatrix: glMatrix.mat4.create(),
        // Projection matrix.
        pMatrix: glMatrix.mat4.create(),
        // Projection types: ortho, perspective, frustum.
        projectionType: "ortho",
        // Angle to Z-Axis for camera when orbiting the center
        // given in radian.
        zAngle: 0.5, //0,
        yAngle: 0,
        // Distance in XZ-Plane from center when orbiting.
        distance: 14,
    };

    /**
     * Handelt die berücksichtigten Tastatureingaben aus und führt die notwendige Änderungen
     * aus
     */
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        event.preventDefault();
        var deltaRotate = Math.PI / 36;
        var deltaTranslate = 0.05;

        if (keyName === 'Control') {
            // do not alert when only Control key is pressed.
            return;
        }

        switch (keyName) {
            case "ArrowUp": // ==> nach oben über die Szene
                            //camera.zAngle += Math.PI / 36;
                camera.yAngle += deltaRotate;
                //camera.eye
                render();
                break;
            case "ArrowDown": // ==> nach unten über die Szene
                //camera.zAngle -= Math.PI / 36;
                camera.yAngle += deltaRotate;
                render();
                break;
            case "ArrowLeft": // ==> links um die Szene
                camera.zAngle += deltaRotate;
                render();
                break;
            case "ArrowRight": // ==> Rechts um die Szene
                camera.zAngle -= deltaRotate;
                render();
                break;

            case "o": // +y
                camera.projectionType = "ortho";
                projektionsText.innerText = "Projektionstyp: Orthogonal";
                render();
                break;
            case "p": // +y
                //camera.projectionType = "perspective";
                //projektionsText.innerText = "Projektionstyp: Perspektivisch";
                //render();
                break;
            case "f": // +y
                //camera.projectionType = "frustum";
                //projektionsText.innerText = "Projektionstyp: Frustum";
                //render();
                break;

            case "s": // +y
                camera.center[1] = camera.center[1] - 0.5;
                render();
                break;
            case "w": // -y
                camera.center[1] = camera.center[1] + 0.5;
                render();
                break;
            case "d": // -x
                camera.center[0] = camera.center[0] + 0.5;
                render();
                break;
            case "a": // x
                camera.center[0] = camera.center[0] - 0.5;
                render();
                break;
            case "Z":
                switch (camera.projectionType) {
                    case("ortho"):
                        camera.lrtb += 0.1;
                        render();
                        break;
                    case("frustum"):
                        camera.lrtb += 0.1;
                        render();
                        break;
                    case("perspective"):
                        camera.fovy += 5 * Math.PI / 180;
                        render();
                        break;
                }
                break;
            case "z":
                switch (camera.projectionType) {
                    case("ortho"):
                        camera.lrtb -= 0.1;
                        render();
                        break;
                    case("frustum"):
                        camera.lrtb -= 0.1;
                        render();
                        break;
                    case("perspective"):
                        //camera.fovy -= 5 * Math.PI / 180;
                        //render();
                        break;
                }
                break;
            case "n": // n ==> Radius kleiner
                camera.distance++;
                render();
                break;
            case "N": // shift-n ==> Radius größer
                camera.distance--;
                render();
                break;
        }

    }, false);

    /**
     * Startet die Initiierung des Moduls
     */
    function start() {
        init();
    }

    /**
     * Führ die notwendigen Initialisierungsschritt aus
     */
    function init() {
        models = [];

        WebGlInstance.webGL.create();
        camera.aspect = WebGlInstance.webGL.gl.viewportWidth / WebGlInstance.webGL.gl.viewportHeight;

        initModels();
        render();
    }

    /**
     * Definiert Szenen, in dem es auf Basis des Paramters activeModel (configure.js) ein oder mehr model erzeugt und
     * zur Kollektion models hinhzufügt.
     */
    function initModels() {
        if (activeModel === 0) {
            createModel(
                "modKegel",
                [0, 0, 0],
                [0, 1, 0], Math.PI / 1.0,
                [150, 2000, 600],
                true, Math.PI / 500.0,
                false, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 0);
            createModel(
                "modSphere",
                [0, 0, 0],
                [1, 1, 0], 30,
                [500, 500, 500],
                false, Math.PI / 500.0,
                false, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 0);
            createModel(
                "modTorus",
                [0, 0, 0],
                [0, 1, 0], 0,
                [500, 500, 500],
                true, Math.PI / 500.0,
                false, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 0);
        }
    }

    /**
     * Steuert die Erzeugung eines Modells, indem es für das geforderte Modell alle notwendigen
     * Initiierungen vornimmt (iniDataAndBuffer sowie iniTransformations). Das fertige Modell
     * wird in die Kollektion models eingefügt.
     * @param modelName Der Name des Modells (entspricht dem Namen des Modellmoduls)
     * @param translate Die initiale Translation des Modells. Geht von Mittelpunkt zu Mittelpunkt der Bewegung aus
     * @param rotate Die Achsen, um die rotiert werden soll (einmalig oder bei turning = true).
     * @param rotateBaseDegree Grad der initialen, einmaligen Rotation des Modells auf der in rotate festgelegten X, Y, Z Achse
     * @param scale Die skalierung des Modells auf Basis einer um 1/100 rescalierten Basis
     * @param performTurning True, wenn sich ein Modell kontinuierlich drehen (turningDegree)
     * @param turningDegree Angabe der dauernden Drehung je Schritt im Bogenmaß auf der in rotate festgelegten X, Y, Z Achse (für turning = true)
     * @param performOrbit True, wenn das Modell sich in einen Orbit kontinuierlich Bewegen soll
     * @param orbitCenter Koordinaten des Mittelpunktes für den Orbit (für performOrbit = true)
     * @param orbitRadius Radius des Orbits auf der X, Y, Z Achse, bezogen auf den Mittelpunkt bezogen (für performOrbit = true)
     * @param orbitDegree Angabe der dauernden Bewegung je Schritt im Bogenmaß auf dem Orbit (für performOrbit = true)
     */
    function createModel(
        modelName = "",
        translate = [0.0, 0.0, 0.0],
        rotate = [0.0, 0.0, 0.0],
        rotateBaseDegree = 0.0,
        scale = [1.0, 1.0, 1.0],
        performTurning = false,
        turningDegree = 0.0,
        performOrbit = false,
        orbitCenter = [0.0, 0.0, 0.0],
        orbitRadius = [0.0, 0.0, 0.0],
        orbitDegree = 0.0) {

        let model = {};

        initDataAndBuffersForModel(model, modelName);

        initTransformationsForModel(
            model,
            translate,
            rotate,
            rotateBaseDegree,
            scale,
            performTurning,
            turningDegree,
            performOrbit,
            orbitCenter,
            orbitRadius,
            orbitDegree);

        models.push(model);
    }

    /**
     * Initiiert das Erzeugen eines neuen Modells und das Anlegen relevanter Eigenschaften für die beötigten
     * Daten und Buffer. Hierbei definiert der Modellname ein Modell anhand seiner Klasse. Dies Modell
     * wird aus den verfügbaren Modellen erzeugt und dessen Vorgaben in das übergebenen Modell übergeben.
     * @param model Das zu initiierende leere Modell
     * @param modelName Referenz auf ein in einem Modul hinterlegten Modell und seinen Daten
     */
    function initDataAndBuffersForModel(model, modelName) {
        this[modelName]['createModellVertex'].apply(model);

        // Buffer für die Punkte erzeugen und laden
        model.vbo = WebGlInstance.webGL.gl.createBuffer();
        WebGlInstance.webGL.gl.bindBuffer(WebGlInstance.webGL.gl.ARRAY_BUFFER, model.vbo);
        WebGlInstance.webGL.gl.bufferData(WebGlInstance.webGL.gl.ARRAY_BUFFER, new Float32Array(model.vertices), WebGlInstance.webGL.gl.STATIC_DRAW);

        // Buffer für die Indizes erzeugen und laden
        model.ibo = WebGlInstance.webGL.gl.createBuffer();
        WebGlInstance.webGL.gl.bindBuffer(WebGlInstance.webGL.gl.ELEMENT_ARRAY_BUFFER, model.ibo);
        WebGlInstance.webGL.gl.bufferData(WebGlInstance.webGL.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.verticesIndexTriangle), WebGlInstance.webGL.gl.STATIC_DRAW);
        model.ibo.numerOfEmements = model.verticesIndexTriangle.length;

        // posAttrib erzeugen und verwenden
        aPosition = WebGlInstance.webGL.gl.getAttribLocation(WebGlInstance.webGL.program, 'aPosition');
        WebGlInstance.webGL.gl.enableVertexAttribArray(aPosition);

        aNormal = WebGlInstance.webGL.gl.getAttribLocation(WebGlInstance.webGL.program, 'aNormal');
        WebGlInstance.webGL.gl.enableVertexAttribArray(aNormal);

        aColor = WebGlInstance.webGL.gl.getAttribLocation(WebGlInstance.webGL.program, 'aColor');
        WebGlInstance.webGL.gl.enableVertexAttribArray(aColor);

        // Zeiger erzeugen und konfigurieren
        WebGlInstance.webGL.gl.vertexAttribPointer(aPosition, 3, WebGlInstance.webGL.gl.FLOAT, false, 10 * 4, 0);
        WebGlInstance.webGL.gl.vertexAttribPointer(aColor, 4, WebGlInstance.webGL.gl.FLOAT, false, 10 * 4, 3 * 4);
        WebGlInstance.webGL.gl.vertexAttribPointer(aNormal, 3, WebGlInstance.webGL.gl.FLOAT, false, 10 * 4, 7 * 4);
    }

    /**
     * Fügt dem übergebenen Modell Eigenschaften für seine Positionierung, Skalierung und Animation hinzu. Zudem werden
     * Eigenschaften für die interne Verwendung hinzugefügt
     * Scale Matrix hinzufügen
     * @param model Eine Instanz des Modells
     * @param translate Die initiale Translation des Modells. Geht von Mittelpunkt zu Mittelpunkt der Bewegung aus
     * @param rotate Die Achsen, um die rotiert werden soll (einmalig oder bei turning = true).
     * @param rotateBaseDegree Grad der initialen, einmaligen Rotation des Modells auf der in rotate festgelegten X, Y, Z Achse
     * @param scale Die skalierung des Modells auf Basis einer um 1/100 rescalierten Basis
     * @param performTurning True, wenn sich ein Modell kontinuierlich drehen (turningDegree)
     * @param turningDegree Angabe der dauernden Drehung je Schritt im Bogenmaß auf der in rotate festgelegten X, Y, Z Achse (für turning = true)
     * @param performOrbit True, wenn das Modell sich in einen Orbit kontinuierlich Bewegen soll
     * @param orbitCenter Koordinaten des Mittelpunktes für den Orbit (für performOrbit = true)
     * @param orbitRadius Radius des Orbits auf der X, Y, Z Achse, bezogen auf den Mittelpunkt bezogen (für performOrbit = true)
     * @param orbitDegree Angabe der dauernden Bewegung je Schritt im Bogenmaß auf dem Orbit (für performOrbit = true)
     */
    function initTransformationsForModel(
        model = {},
        translate = [0.0, 0.0, 0.0],
        rotate = [0.0, 0.0, 0.0],
        rotateBaseDegree = 0.0,
        scale = [1.0, 1.0, 1.0],
        performTurning = false,
        turningDegree = 0.0,
        performOrbit = false,
        orbitCenter = [0.0, 0.0, 0.0],
        orbitRadius = [0.0, 0.0, 0.0],
        orbitDegree = 0.0) {

        // Positionierung des Modells
        model.translate = translate;
        model.rotate = rotate;
        model.rotateBaseDegree = rotateBaseDegree;
        model.scale = scale;

        // Rotation des Modells
        model.performTurning = performTurning;
        model.turningDegree = turningDegree;

        // Kreisbewegung des Modells
        model.performOrbit = performOrbit;
        model.orbitCenter = orbitCenter;
        model.orbitRadius = orbitRadius;
        model.orbitDegree = orbitDegree;

        // Berechnungsvariablen und Zustände für das Modell
        model.currentTurningDegree = 0.0;
        model.currentOrbitDegree = 0.0;
        model.xAlt = 0.0;
        model.yAlt = 0.0;
        model.zAlt = 0.0;

        // Matrizen des Modells
        model.modelMatrix = glMatrix.mat4.create();
        model.viewMatrix = glMatrix.mat4.create();
        model.scaleMatrix = glMatrix.mat4.create();
    }

    /**
     * Konfiguriert und setzt die Matrizen für Model, View und Projektion und Triggert die
     * Ausgabe der aktuellen model einer Szene
     */
    function render() {
        // Löschen der alten Ausgabe
        WebGlInstance.webGL.gl.clear(WebGlInstance.webGL.gl.COLOR_BUFFER_BIT | WebGlInstance.webGL.gl.DEPTH_BUFFER_BIT);

        // konfiguriert und setzt die globale Projektionsmatrix der Kamera (Projection Matrix)
        setCameraProjectionMatrix();

        // konfiguriert und setzt die globale Viewmatrix der Kamera (View Matrix)
        setCameraViewMatrix();

        // Alle model durchlaufen, Eigenschaften für Rotation, Scale und Translation für das
        // jeweils aktuelle Modell aktualisieren und das Modell ausgeben
        for (var i = 0; i < models.length; i++) {
            // Erstellt und setzt die Model Matrix für das aktuelle Modell nach den aktuell eingestellten Werten
            setModelTransformationForModel(models[i]);
            // Ausgabe des Modells
            drawModel(models[i]);
        }
    }

    /**
     * Legt und setzt die Projektion Matrix nach dem gewählten Projektionstyp fest
     */
    function setCameraProjectionMatrix() {
        let v = camera.lrtb;

        // Erstellt die Projektionsmatrix auf Basis des in projectionType eingestellten Wertes
        switch (camera.projectionType) {
            case("ortho"):
                glMatrix.mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 100);
                break;
            case("frustum"):
                glMatrix.mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 100);
                break;
            case("perspective"):
                glMatrix.mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 100);
                break;
        }

        WebGlInstance.webGL.gl.uniformMatrix4fv(WebGlInstance.webGL.program.projectionMatrix, false, camera.pMatrix);
    }

    /**
     * Legt und setzt die View Matrix fest
     */
    function setCameraViewMatrix() {
        // Calculate x,z position/eye of camera orbiting the center.
        var x = 0, z = 2;

        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);

        camera.eye[1] = camera.center[z];
        camera.eye[1] += camera.distance * Math.sin(camera.yAngle);

        glMatrix.mat4.identity(camera.vMatrix);
        glMatrix.mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

        WebGlInstance.webGL.gl.uniformMatrix4fv(WebGlInstance.webGL.program.viewMatrix, false, camera.vMatrix);
    }

    /**
     * Erstellt und setzt die Model Matrix für das übergebene Modell
     * @param model Das Model
     */
    function setModelTransformationForModel(model) {
        let mMatrix = model.modelMatrix;
        glMatrix.mat4.identity(mMatrix);

        // Scale
        let reScaled = [model.scale[0] / 100.0, model.scale[1] / 100.0, model.scale[2] / 100.0];
        glMatrix.mat4.scale(mMatrix, mMatrix, reScaled);

        // Rotate
        if (model.performTurning) { // permanente Drehbewegung um turningDegree in die in rotate definierten Achsen
            model.currentTurningDegree += model.turningDegree;
            glMatrix.mat4.rotate(mMatrix, mMatrix, model.currentTurningDegree, model.rotate);
        } else { // einmaliges Drehen um rotateBaseDegree in die in rotate definierten Achsen
            glMatrix.mat4.rotate(mMatrix, mMatrix, model.rotateBaseDegree, model.rotate);
        }

        // Translate.
        if (model.performOrbit) {
            glMatrix.mat4.translate(mMatrix, mMatrix, model.translate);

            model.currentOrbitDegree += model.orbitDegree;

            let x = model.orbitRadius[0] * Math.cos(model.currentOrbitDegree) - model.orbitCenter[0];
            let y = model.orbitRadius[1] * Math.sin(model.currentOrbitDegree) - model.orbitCenter[1];

            let newX = x - model.xAlt;
            let newY = y - model.yAlt;

            glMatrix.mat4.translate(mMatrix, mMatrix, [newX + model.orbitCenter[0], newY + model.orbitCenter[1], 0.0]);

            model.xAlt = x;
            model.yAlt = y;
        } else {
            glMatrix.mat4.translate(mMatrix, mMatrix, model.translate);
        }

        WebGlInstance.webGL.gl.uniformMatrix4fv(WebGlInstance.webGL.program.modelMatrix, false, mMatrix);
    }

    /**
     * Gibt das übergebene Modell aus
     * @param model Das Model
     */
    function drawModel(model) {
        WebGlInstance.webGL.gl.enableVertexAttribArray(aColor);

        // Knotendaten verfügbar machen und binden
        WebGlInstance.webGL.gl.bufferData(WebGlInstance.webGL.gl.ARRAY_BUFFER, new Float32Array(model.vertices), WebGlInstance.webGL.gl.STATIC_DRAW);
        // Indexarray für die Linien binden und ausgeben
        WebGlInstance.webGL.gl.bufferData(WebGlInstance.webGL.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.verticesIndexTriangle), WebGlInstance.webGL.gl.STATIC_DRAW);

        model.ibo.numerOfEmements = model.verticesIndexTriangle.length;

        WebGlInstance.webGL.gl.drawElements(WebGlInstance.webGL.gl.TRIANGLES, model.ibo.numerOfEmements, WebGlInstance.webGL.gl.UNSIGNED_SHORT, 0);

        if (true) {
            WebGlInstance.webGL.gl.bufferData(WebGlInstance.webGL.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.verticesIndexLine), WebGlInstance.webGL.gl.STATIC_DRAW);

            model.ibo.numerOfEmements = model.verticesIndexLine.length;

            // Ausgabe
            WebGlInstance.webGL.gl.disableVertexAttribArray(aColor);
            WebGlInstance.webGL.gl.drawElements(WebGlInstance.webGL.gl.LINES, model.ibo.numerOfEmements, WebGlInstance.webGL.gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Neuer Animationsschritt
     */
    function rotate() {
        if (models.length > 0) {
            render();

            if (animateScene) {
                window.requestAnimationFrame(rotate);
            }
        }
    }

    /**
     * Die offengelegte API
     */
    return {
        start: start,
        rotate: rotate
    }
}());
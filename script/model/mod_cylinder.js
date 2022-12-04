/**
 * Das Modell eines Zylinders
 * @type {{createModellVertex: createModellVertex}}
 */
var modCylinder = (function () {
    /**
     * Zur vereinfachten Nutzung und als kleine Optimierung
     * @type {number} Die Zahl PI aus Math.PI
     */
    const pi = Math.PI;

    /**
     * Erzeugt alle Vertices (Punkte), deren Indizes, die benötigten Linien sowie Dreiecke
     */
    function createModellVertex() {
        /**
         * Array, das die aktuell vorkommendem Vertices hält
         * * @type {*[]}
         *  */
        this.vertices = [];
        var vertices = this.vertices;

        /**
         * Array, das die aktuell vorkommendem Normalen hält
         * * @type {*[]}
         *  */
        this.normals = [];
        var normals = this.normals;

        /**
         * Array, das die aktuellen VerticesIndizes für die Linien hält
         * @type {*[]}
         */
        this.verticesIndexLine = [];
        var verticesIndexLine = this.verticesIndexLine;

        /**
         * Array, das die aktuellen VerticesIndizes für die Dreiecke hält
         * * @type {*[]}
         *  */
        this.verticesIndexTriangle = [];
        var verticesIndexTriangle = this.verticesIndexTriangle;

        // Parameter Winkel/Grad
        let stepU = 32;
        let du = 2 * pi / stepU;

        // Parameter Höhe
        let stepV = 16;
        let dv = 1 / stepV;

        let r = 0.6;
        let scale = 100.0;

        for (let u = 0.0, i = 0; i <= stepU; u += du, i++) { // Winkel / Kreis
            let farbwert = 0;

            for (let v = 0.0, j = 0; j <= stepV; v += dv, j++) { // Höhe
                let iVertex = i * (stepV + 1) + j; // ==> Anzahl der Knoten

                let x = r * Math.cos(u);
                let y = v - 0.5;
                let z = r * Math.sin(u);

                // Punkte und Farbe definieren
                vertices.push(x * scale); // X Koordinate
                vertices.push(y * scale); // Y Koordinate
                vertices.push(z * scale); // Z Koordinate

                if (farbwert === 0) {
                    vertices.push(1.0, 0.0, 1.0, 1); // Farbwert
                    farbwert++;
                } else if (farbwert === 1) {
                    vertices.push(0.0, 1.0, 0.0, 1); // Farbwert
                    farbwert++;
                } else if (farbwert === 2) {
                    vertices.push(0.4, 0.4, 0.4, 1); // Farbwert
                    farbwert = 0;
                }

                vertices.push(1.0, 1.0, 1.0); // Normale

                // Definiert die Linien für das Gitternetz
                if (i > 0 && j > 0) {
                    verticesIndexLine.push(iVertex - 1);
                    verticesIndexLine.push(iVertex);
                }

                if (i > 0 && j > 0) {
                    verticesIndexLine.push(iVertex - (stepV + 1));
                    verticesIndexLine.push(iVertex);
                }

                // Definiert zwei Dreiecke, die zusammen das durch die Linien begrenzte Rechteck bilden
                if (j > 0 && i > 0) {
                    verticesIndexTriangle.push(iVertex);
                    verticesIndexTriangle.push(iVertex - 1);
                    verticesIndexTriangle.push(iVertex - (stepV + 1));

                    verticesIndexTriangle.push(iVertex - 1);
                    verticesIndexTriangle.push(iVertex - (stepV + 1) - 1);
                    verticesIndexTriangle.push(iVertex - (stepV + 1));
                }
            }
        }
    }

    /**
     * Legt die Funktionalität offen
     */
    return {
        createModellVertex: createModellVertex
    }
}());
/**
 * Der Code des Vertex Shader der über jeden Punkt ausgeführt wird
 * @type {string}
 */
const vertexShader = `#version 300 es  
  
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    uniform mat3 normalMatrix;

    in vec3 aPosition;
    in vec4 aColor;
    in vec3 aNormal;
    
    out vec4 vColor;
    out float vBrightness;
    out vec3 vNormal;
    
    vec3 lightDirection = normalize(vec3(3.0, 3.0, 1.0));
    //vec3 normal;
    vec4 vColorx;
    // Ambient light.
    uniform vec3 ambientLight;
    
    // Pointlights.
    const int MAX_LIGHT_SOURCES = 10;
    struct LightSource {
        bool isOn;
        vec3 position;
        vec3 color;
    };  
    uniform LightSource light[MAX_LIGHT_SOURCES];
    
    // Material.
    struct PhongMaterial {
        vec3 ka;
        vec3 kd;
        vec3 ks;
        float ke;
    };
    uniform PhongMaterial material;
    
    // Phong Beleuchtungsberechnung für eine Lichtquellen
    vec3 phong(vec3 p, vec3 n, vec3 v, LightSource l) {            
        vec3 L = l.color;
        
    
        vec3 s = normalize(l.position-p);
        vec3 r = reflect(-s, n);
    
        float x =dot(s,n)*10.;
        
        //float sn = max( dot(s,n), 0.0);
        float sn = max( x, 0.0);
        float rv = max( dot(r,v), 0.0);
    
        vec3 diffuse = material.kd * L * sn;
        //vec3 diffuse = material.kd * L * sn;
    
        vec3 specular = material.ks * L * pow(rv, material.ke);
     
        return diffuse + specular;
    }
    
    // Phong Beleuchtungsberechnung für mehrere Lichtquellen
    vec3 phong(vec3 p, vec3 n, vec3 v) {
        // Berechnet Einfluss des Ambienten Lichts mit Koeffizient ka
        vec3 result = material.ka * ambientLight;
    
        // Addiert die Einflüsse der weiteren Lichtquellen
        for(int j=0; j < MAX_LIGHT_SOURCES; j++){
            if(light[j].isOn){
                result += phong(p, n, v, light[j]);
            }
        }
        
        return result;        
    }

    void main()
    {       
        vBrightness = max(dot(lightDirection, aNormal),0.0);
        vColorx = aColor;
        //vNormal=aNormal;
        
        gl_Position=uProjection * uView * uModel * vec4(aPosition, 100.0);
        gl_PointSize=1.0;  
        
        //uNormalMatrix
        mat4 mvMatrix=uView * uModel;
        vec4 tPosition = mvMatrix * vec4(aPosition, 1.0);
        vec3 tNormal = normalize(normalMatrix * aNormal);
        
        //vec3 tNormal = normalize(uView * aNormal);
    
        // Calculate view vector.
        vec3 v = normalize(-tPosition.xyz);
        //vec3 tNormal = normalize(aNormal);
        //vec3 tPosition = normalize(gl_Position);
        //vec3 v = -normalize(vec3(0.,0.,0.));// -gl_Position.xyz;
        
        vColor = vec4( phong(tPosition.xyz, tNormal, v), 1.0);
        //vColor = vec4( phong(gl_Position.xyz, aNormal, v), 1.0);
        //vColor = vec4( phong(vec3(0.,0.,0.), aNormal, v), 1.0);
        //LightSource ls=light[0];
        //vColor=vec4(ambientLight,1.0);
    }
    
    `;


/**
 * Der Code des Fragment Shader, der über jeden Pixel des Fragments ausgeführt wird.
 * @type {string} Der Code
 */
const fragmentShader = `#version 300 es
    
    precision mediump float;
    
    in vec4 vColor;
    in vec3 vNormal;
    in float vBrightness;
    
    out vec4 fragColor;
    
    // float near = -10.00; 
    // float far  = 2000.00; 
  
    // float LinearizeDepth(float depth) 
    // {
        // float z = depth * 2.0 - 1.0; // back to NDC 
        // return (2.0 * near * far) / (far + near - z * (far - near));
    // }
    
    void main()
    {          
        float zbuffer = fract(gl_FragCoord.z/0.3);
        //fragColor = vec4(zbuffer,zbuffer,zbuffer, 1.0);
        //fragColor=vColor*1.0/zbuffer;
        fragColor=vColor;
    }
       
    `;
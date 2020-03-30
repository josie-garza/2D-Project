Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  in vec4 vertexPosition;
  in vec4 vertexTexCoord;
  out vec4 texCoord; // passed to FS
  out vec4 modelPosition;

  uniform struct {
  	mat4 modelMatrix;
    vec3 offset;
  } gameObject;

  uniform struct {
    mat4 viewProjMatrix;
  } camera;

  void main(void) {
    texCoord = vertexTexCoord;
    if (gameObject.offset.z > 0.0) {
      texCoord[0] *= gameObject.offset.z;
      texCoord[0] += (gameObject.offset.x / 6.0);
      texCoord[1] *= gameObject.offset.z;
      texCoord[1] += (gameObject.offset.y / 6.0);
      texCoord[1] += 0.0025;
    }
    modelPosition = vertexPosition;
    gl_Position = vertexPosition * gameObject.modelMatrix
     * camera.viewProjMatrix;
  }
`;
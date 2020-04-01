Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  in vec4 vertexPosition;
  in vec4 vertexTexCoord;
  out vec4 texCoord; // passed to FS
  out vec4 modelPosition;

  uniform struct {
  	mat4 modelMatrix;
    vec4 offset;
  } gameObject;

  uniform struct {
    mat4 viewProjMatrix;
  } camera;

  void main(void) {
    texCoord = vertexTexCoord;
    if (gameObject.offset[2] > 0.0) {
      texCoord[0] *= gameObject.offset[2];
      texCoord[0] += (gameObject.offset[0] * gameObject.offset[2]);
      texCoord[1] *= gameObject.offset[3];
      texCoord[1] += (gameObject.offset[1] * gameObject.offset[3]);
      texCoord[1] += 0.0025;
    }
    modelPosition = vertexPosition;
    gl_Position = vertexPosition * gameObject.modelMatrix
     * camera.viewProjMatrix;
  }
`;
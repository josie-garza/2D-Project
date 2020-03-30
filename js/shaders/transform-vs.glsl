Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  in vec4 vertexPosition;
  
  uniform struct{
    mat4 modelMatrix;
  } gameObject;

  uniform struct{
    mat4 viewProjMatrix;
  } camera;
 
  void main(void) {
    gl_Position = vertexPosition;
    gl_Position *= gameObject.modelMatrix;
    gl_Position *= camera.viewProjMatrix;
  }
`;
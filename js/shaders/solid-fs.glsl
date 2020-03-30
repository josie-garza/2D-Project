Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;
  uniform struct{
    vec4 color;
  } material;
  out vec4 fragmentColor;

  void main(void) {
    fragmentColor = material.color;
  }
`;
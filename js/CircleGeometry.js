"use strict";
/* exported StarGeometry */
class CircleGeometry {
  constructor(gl) {
    this.gl = gl;

    // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    var vertexArray = [0,0,0];
    
    for (var i = 0; i < 2 * Math.PI ; i+=(2*Math.PI/40)) {
      var bigRadius = 0.75;
      var X = Math.cos(i) * bigRadius; //* 0.5625;
      var Y = Math.sin(i) * bigRadius;
      vertexArray.push(X, Y, 0);
    }

    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertexArray),
      gl.STATIC_DRAW);

    // allocate and fill index buffer in device memory (OpenGL name: element array buffer)
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    var indexArray = [];
    
    for (var i = 1; i < 40; i+=1) {
      indexArray.push(0, i, i+1);
    }
    indexArray.push(0, 40, 1)

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexArray),
      gl.STATIC_DRAW);

    // create and bind input layout with input buffer bindings (OpenGL name: vertex array)
    this.inputLayout = gl.createVertexArray(); // called vertex array object (VAO)
    gl.bindVertexArray(this.inputLayout);
    // Explaining what the vertex buffer is
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(0); // we will call the data in this buffer attribute 0
    gl.vertexAttribPointer(0,
      3, gl.FLOAT, //< three pieces of float
      false, //< do not normalize (make unit length)
      0, //< tightly packed
      0 //< data starts at array start
    );

    gl.bindVertexArray(null);
  }

  draw() {
    const gl = this.gl;

    gl.bindVertexArray(this.inputLayout);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  

    gl.drawElements(gl.TRIANGLES, 120, gl.UNSIGNED_SHORT, 0);
  }
}

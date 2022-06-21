import React, { Component } from 'react'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

THREE.Quaternion.prototype.setFromRVec = function(rvec) {
  const norm = rvec.length();
  if( Math.abs(norm) === 0 ) {
    return this.set( 0,0,0,1 );
  }
  return this.setFromAxisAngle( rvec.normalize(), norm );
}

class ThreeScene extends Component {
  constructor(props) {
    super(props)

    // defining camera parameters
    this.fieldOfView = 60;
    this.nearClippingPane = 0.1;
    this.farClippingPane = 1100;
    this.initialPosition = new THREE.Vector3(.5,.5,-1.5);

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
  }

  componentDidMount() {
    console.log("mount");
    this.scene = new THREE.Scene()
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();

    this.initScene()
    this.createControls();
    this.createSkyDome();
    this.createLight();

    this.updateScene();

    this.mount.appendChild(this.renderer.domElement)
    this.renderer.domElement.style.position = 'absolute';
    this.updateCanvasSize();

    this.start()
  }

  updateScene() {
    this.root.clear();
    this.root.add( this.props.scene );
  }

  initScene() {
    this.scene.add(new THREE.AxesHelper(1));
    this.root = new THREE.Group();
    this.scene.add( this.root );
  }

  createSkyDome() {
    const vertexShader = 
`varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

    const fragmentShader = 
`uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;

    var uniforms = {
      topColor:    { value: new THREE.Color( 0x444444 ) },
      bottomColor: { value: new THREE.Color( 0x111122 ) },
      offset:      { value: 33 },
      exponent:    { value: 0.6 }
    };
    var skyGeo = new THREE.SphereGeometry( 1000, 32, 15 );
    var skyMat = new THREE.ShaderMaterial( { 
      vertexShader: vertexShader, 
      fragmentShader: fragmentShader, 
      uniforms: uniforms, 
      side: THREE.BackSide } );
    var sky = new THREE.Mesh( skyGeo, skyMat );
    this.scene.add( sky );
  }

  createRenderer() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = true;

    return renderer;
  }

  createCamera() {
    const aspectRatio = this.getAspectRatio();
    const camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    camera.position.copy( this.initialPosition );
    return camera;
  }

  createLight() {
    const light1 = new THREE.PointLight(0xffffff, 1, 1000);
    light1.position.set(100, 100, 100);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 1, 1000);
    light2.position.set(0, 0, -100);
    this.scene.add(light2);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
  }

  getAspectRatio() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    if (height === 0) {
      return 0;
    }
    return width / height;
  }

  componentWillUnmount() {
    console.log("unmount");
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  componentDidUpdate() {
    this.updateScene();
  }

  start() {
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.animate)
    }
  }

  stop() {
    window.cancelAnimationFrame(this.frameId)
    this.frameId = undefined
  }

  animate() {
    if( this.scene ) {
      this.renderScene()
    }

    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.updateCanvasSize();
    this.renderer.render(this.scene, this.camera)
  }

  updateCanvasSize() {
    // check if the size has changed, and camera and renderer need to be
    // updated
    const rect = this.mount.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height; 
    const size = new THREE.Vector2( width, height )
    const r_size = new THREE.Vector2();
    this.renderer.getSize( r_size );
    if( !size.equals( r_size ) ) {
      this.camera.aspect = this.getAspectRatio();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( width, height );
    }
  }

  render() {
    return (
      <div
        style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}
        ref={(mount) => { this.mount = mount }}>
      </div>
    )
  }
}

export default ThreeScene

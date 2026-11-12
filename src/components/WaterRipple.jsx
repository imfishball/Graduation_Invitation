import { useEffect, useRef, useState } from 'react'

const VS_SOURCE = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`

const TRAIL_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_rippleTrail_buffer;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_deltaTime;
uniform vec4 u_mousePosition; // xy = current pos [0..1], zw = velocity
uniform float u_mousePointerDown;
uniform float u_mouseHover;
uniform float u_trailDecay;
uniform float u_trailRadius;
uniform float u_trailSoftness;
uniform float u_centerFade;
uniform float u_trailStrength;

void main() {
    vec2 uv = v_uv;
    vec2 res = u_resolution.xy / u_pixelRatio;
    float ref = sqrt(res.x * res.y);

    const float simDetail = 800.0;
    vec2 simRes = res / ref * simDetail;
    vec2 px = 1.0 / simRes;

    vec4 prevData = texture(u_rippleTrail_buffer, uv);
    float current = prevData.r;
    float previous = prevData.g;

    float left  = texture(u_rippleTrail_buffer, uv - vec2(px.x, 0.0)).r;
    float right = texture(u_rippleTrail_buffer, uv + vec2(px.x, 0.0)).r;
    float down  = texture(u_rippleTrail_buffer, uv - vec2(0.0, px.y)).r;
    float up    = texture(u_rippleTrail_buffer, uv + vec2(0.0, px.y)).r;

    float neighborAverage = (left + right + down + up) * 0.25;
    float r = clamp(u_deltaTime * 60.0, 0.5, 2.0);
    float decay = pow(mix(0.95, 0.99, u_trailDecay), r);
    float next = (neighborAverage * 2.0 - previous) * decay;

    vec2 p     = uv * res / ref;
    vec2 mouse = u_mousePosition.xy * res / ref;
    float dist = distance(p, mouse);

    float stamp = 1.0 - smoothstep(u_trailRadius * (1.0 - u_trailSoftness), u_trailRadius, dist);
    float centerFade = smoothstep(0.0, max(u_centerFade * 0.2, 0.001), dist);

    float speed = length(u_mousePosition.zw);
    float speedAmount = clamp(speed * u_trailStrength, 0.0, 1.0);
    float pressAmount = 1.0 + u_mousePointerDown * 1.5;

    next += stamp * centerFade * u_mouseHover * speedAmount * pressAmount * min(r, 3.0);

    fragColor = vec4(next, current, 0.0, 1.0);
}`

const CLICK_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_clickState_buffer;
uniform float u_deltaTime;
uniform float u_mousePointerDown;
uniform vec4 u_mousePosition;
uniform float u_trailDecay;

const int SLOTS = 9;

vec4 readSlot(int i) {
    return texture(u_clickState_buffer, vec2((float(i) + 0.5) / float(SLOTS), 0.5));
}

float clickLifetime() {
    float f = mix(0.9, 0.95, u_trailDecay);
    return -3.0 / (log(f) / log(10.0)) / 60.0;
}

void main() {
    int s = int(clamp(floor(v_uv.x * float(SLOTS)), 0.0, float(SLOTS - 1)));
    float life = clickLifetime();
    float down = u_mousePointerDown;

    vec4 g = readSlot(0);
    float prevDown = g.r;
    float wasRising = g.g;
    float cooldown = g.b;
    if (length(g) < 1e-4) cooldown = 100.0;

    float delta = down - prevDown;
    bool rising = (delta > 0.003);
    bool spawnNow = rising && (wasRising < 0.5) && (cooldown > 0.05);

    if (s == 0) {
        float nextCooldown = spawnNow ? 0.0 : min(cooldown + u_deltaTime, 100.0);
        fragColor = vec4(down, rising ? 1.0 : 0.0, nextCooldown, 0.0);
        return;
    }

    vec4 next = readSlot(s);
    if (length(next) < 1e-4) next = vec4(0.0, 0.0, -1.0, 0.0);

    if (next.b >= 0.0) {
        float a = next.b + u_deltaTime;
        next.b = (a > life) ? -1.0 : a;
    }

    int target = 1;
    float best = -1e9;
    for (int i = 1; i < SLOTS; i++) {
        float age = readSlot(i).b;
        float score = (age < 0.0) ? 1e6 : age;
        if (score > best) { best = score; target = i; }
    }

    if (spawnNow && s == target) {
        next.rg = u_mousePosition.xy;
        next.b = 0.0;
    }

    fragColor = next;
}`

const MAIN_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform sampler2D u_rippleTrail_buffer;
uniform sampler2D u_clickState_buffer;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_trailDecay;
uniform float u_trailRadius;
uniform float u_trailStrength;
uniform float u_trailDisplacement;
uniform float u_dispersion;
uniform float u_clickRipple;
uniform float u_clickSpeed;

const int SLOTS = 9;

vec2 coverFit(vec2 uv) {
    vec2 flipped = vec2(uv.x, 1.0 - uv.y);
    vec2 texRes = vec2(textureSize(u_texture, 0));
    vec2 ratio = u_resolution.xy / texRes;
    float maxRatio = max(ratio.x, ratio.y);
    return (flipped - 0.5) * (ratio / maxRatio) + 0.5;
}

float clickLifetime() {
    float f = mix(0.9, 0.95, u_trailDecay);
    return -3.0 / (log(f) / log(10.0)) / 60.0;
}

vec2 clickRingOffset(vec2 uv, vec2 res, float ref, vec2 originUV, float age) {
    vec2 p      = uv * res / ref;
    vec2 origin = originUV * res / ref;
    vec2 d      = p - origin;
    float dist  = length(d);
    if (dist < 1e-5) return vec2(0.0);
    vec2 dir    = d / dist;

    float life = clickLifetime();
    float t = clamp(u_clickSpeed * age / life, 0.0, 1.0);

    float reach = u_trailRadius * 3.0;
    float front = reach * t;
    float k    = 6.2831853 / max(0.25 * reach, 1e-4);
    float band = max(0.25 * reach, 1e-3);

    float x        = dist - front;
    float envelope = exp(-(x * x) / (band * band));
    float fade     = 1.0 - smoothstep(life * 0.6, life, age);
    float wave     = cos(k * x) * envelope * fade;

    vec2 dirUV = normalize(dir * ref / res);
    return dirUV * wave * u_trailStrength * 0.02;
}

void main() {
    vec2 uv = v_uv;
    vec2 res = u_resolution.xy / u_pixelRatio;
    float ref = sqrt(res.x * res.y);

    const float simDetail = 800.0;
    vec2 simRes = res / ref * simDetail;
    vec2 px = 1.0 / simRes;

    float hL = texture(u_rippleTrail_buffer, uv - vec2(px.x, 0.0)).r;
    float hR = texture(u_rippleTrail_buffer, uv + vec2(px.x, 0.0)).r;
    float hD = texture(u_rippleTrail_buffer, uv - vec2(0.0, px.y)).r;
    float hU = texture(u_rippleTrail_buffer, uv + vec2(0.0, px.y)).r;

    vec2 grad = vec2(hL - hR, hD - hU);
    vec2 dragOffset = grad * u_trailDisplacement * ref / res;

    vec2 clickOffset = vec2(0.0);
    if (u_clickRipple > 0.5) {
        float life = clickLifetime();
        for (int i = 1; i < SLOTS; i++) {
            vec4 slot = texture(u_clickState_buffer, vec2((float(i) + 0.5) / float(SLOTS), 0.5));
            float age = slot.b;
            if (age < 0.0 || age > life) continue;
            clickOffset += clickRingOffset(uv, res, ref, slot.rg, age);
        }
    }

    vec2 baseOffset = dragOffset + clickOffset;
    vec2 offsetR = baseOffset * (1.0 - u_dispersion * 0.5);
    vec2 offsetG = baseOffset;
    vec2 offsetB = baseOffset * (1.0 + u_dispersion * 0.5);

    vec4 sR = texture(u_texture, coverFit(uv + offsetR));
    vec4 sG = texture(u_texture, coverFit(uv + offsetG));
    vec4 sB = texture(u_texture, coverFit(uv + offsetB));

    fragColor = vec4(sR.r, sG.g, sB.b, 1.0);
}`

export default function WaterRipple({
  imageSrc = '/assets/hero.webp',
  trailRadius = 0.1,
  centerFade = 0.25,
  trailSoftness = 0.5,
  trailStrength = 0.5,
  trailDecay = 0.5,
  trailDisplacement = 0.03,
  dispersion = 0.0,
  clickRipple = true,
  clickSpeed = 1.0,
}) {
  const canvasRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return

    gl.getExtension('EXT_color_buffer_float')
    gl.getExtension('OES_texture_float_linear')

    function createShader(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(s)
        gl.deleteShader(s)
        throw new Error(err)
      }
      return s
    }

    function createProgram(vsSrc, fsSrc) {
      const vs = createShader(gl.VERTEX_SHADER, vsSrc)
      const fs = createShader(gl.FRAGMENT_SHADER, fsSrc)
      const prog = gl.createProgram()
      gl.attachShader(prog, vs)
      gl.attachShader(prog, fs)
      gl.linkProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog))
      }
      return prog
    }

    let trailProg, clickProg, mainProg
    try {
      trailProg = createProgram(VS_SOURCE, TRAIL_FS)
      clickProg = createProgram(VS_SOURCE, CLICK_FS)
      mainProg = createProgram(VS_SOURCE, MAIN_FS)
    } catch (e) {
      console.warn('WaterRipple WebGL shader compile failed:', e)
      return
    }

    const trailLocs = {
      buffer: gl.getUniformLocation(trailProg, 'u_rippleTrail_buffer'),
      resolution: gl.getUniformLocation(trailProg, 'u_resolution'),
      pixelRatio: gl.getUniformLocation(trailProg, 'u_pixelRatio'),
      deltaTime: gl.getUniformLocation(trailProg, 'u_deltaTime'),
      mousePosition: gl.getUniformLocation(trailProg, 'u_mousePosition'),
      mousePointerDown: gl.getUniformLocation(trailProg, 'u_mousePointerDown'),
      mouseHover: gl.getUniformLocation(trailProg, 'u_mouseHover'),
      trailDecay: gl.getUniformLocation(trailProg, 'u_trailDecay'),
      trailRadius: gl.getUniformLocation(trailProg, 'u_trailRadius'),
      trailSoftness: gl.getUniformLocation(trailProg, 'u_trailSoftness'),
      centerFade: gl.getUniformLocation(trailProg, 'u_centerFade'),
      trailStrength: gl.getUniformLocation(trailProg, 'u_trailStrength'),
    }

    const clickLocs = {
      buffer: gl.getUniformLocation(clickProg, 'u_clickState_buffer'),
      deltaTime: gl.getUniformLocation(clickProg, 'u_deltaTime'),
      mousePointerDown: gl.getUniformLocation(clickProg, 'u_mousePointerDown'),
      mousePosition: gl.getUniformLocation(clickProg, 'u_mousePosition'),
      trailDecay: gl.getUniformLocation(clickProg, 'u_trailDecay'),
    }

    const mainLocs = {
      texture: gl.getUniformLocation(mainProg, 'u_texture'),
      trailBuffer: gl.getUniformLocation(mainProg, 'u_rippleTrail_buffer'),
      clickBuffer: gl.getUniformLocation(mainProg, 'u_clickState_buffer'),
      resolution: gl.getUniformLocation(mainProg, 'u_resolution'),
      pixelRatio: gl.getUniformLocation(mainProg, 'u_pixelRatio'),
      trailDecay: gl.getUniformLocation(mainProg, 'u_trailDecay'),
      trailRadius: gl.getUniformLocation(mainProg, 'u_trailRadius'),
      trailStrength: gl.getUniformLocation(mainProg, 'u_trailStrength'),
      trailDisplacement: gl.getUniformLocation(mainProg, 'u_trailDisplacement'),
      dispersion: gl.getUniformLocation(mainProg, 'u_dispersion'),
      clickRipple: gl.getUniformLocation(mainProg, 'u_clickRipple'),
      clickSpeed: gl.getUniformLocation(mainProg, 'u_clickSpeed'),
    }

    // Quad geometry
    const quadVao = gl.createVertexArray()
    gl.bindVertexArray(quadVao)
    const quadBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    // Ping-pong buffers
    let isDisposed = false

    function createFBO(w, h, filterMode = gl.LINEAR) {
      const tex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      const fbo = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.bindTexture(gl.TEXTURE_2D, null)
      return { tex, fbo, w, h }
    }

    let simW = 800, simH = 500
    let trailFBOs = [createFBO(simW, simH, gl.LINEAR), createFBO(simW, simH, gl.LINEAR)]
    let clickFBOs = [createFBO(9, 1, gl.NEAREST), createFBO(9, 1, gl.NEAREST)]
    let trailIdx = 0
    let clickIdx = 0

    // Load background image
    const bgTex = gl.createTexture()
    const img = new Image()
    let imgLoaded = false
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (isDisposed) return
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, bgTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindTexture(gl.TEXTURE_2D, null)
      imgLoaded = true
      lastActiveTime = performance.now()
      setIsReady(true)
      syncRenderState()
    }
    img.src = imageSrc

    // Mouse tracking state: start inactive (-999, -999)
    const IDLE_SLEEP_MS = 2800
    let mouseX = -999.0, mouseY = -999.0
    let prevMouseX = -999.0, prevMouseY = -999.0
    let isDown = 0.0
    let isHover = 0.0
    let lastTime = performance.now()
    let lastActiveTime = performance.now()

    const wakeLoop = () => {
      lastActiveTime = performance.now()
      syncRenderState()
    }

    const updateCoords = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      mouseX = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width))
      mouseY = Math.max(0.0, Math.min(1.0, 1.0 - (e.clientY - rect.top) / rect.height))
      isHover = 1.0
      lastActiveTime = performance.now()
    }

    const onPointerMove = (e) => {
      updateCoords(e)
      wakeLoop()
    }

    const onPointerDown = (e) => {
      updateCoords(e)
      isDown = 1.0
      wakeLoop()
    }

    const onPointerUp = () => {
      isDown = 0.0
      lastActiveTime = performance.now()
    }

    const onPointerLeave = () => {
      isHover = 0.0
      isDown = 0.0
      mouseX = -999.0
      mouseY = -999.0
      prevMouseX = -999.0
      prevMouseY = -999.0
      lastActiveTime = performance.now()
    }

    // Listen on hero section and window
    let isHeroVisible = true
    const heroSection = canvas.closest('section') || canvas.parentElement
    if (heroSection) {
      heroSection.addEventListener('pointerenter', onPointerMove, { passive: true })
      heroSection.addEventListener('pointermove', onPointerMove, { passive: true })
      heroSection.addEventListener('pointerdown', onPointerDown, { passive: true })
      heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('pointerup', onPointerUp, { passive: true })
    }

    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
    const maxDpr = isCoarsePointer ? 1.25 : 1.75
    const simTarget = isCoarsePointer ? 420 : 800

    let animId = 0
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr)

    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const renderW = Math.round(w * dpr)
      const renderH = Math.round(h * dpr)
      if (canvas.width !== renderW || canvas.height !== renderH) {
        canvas.width = renderW
        canvas.height = renderH
      }

      // Proportional simulation resolution
      const ref = Math.sqrt(w * h)
      const newSimW = Math.max(64, Math.round((w / ref) * simTarget))
      const newSimH = Math.max(64, Math.round((h / ref) * simTarget))
      if (newSimW !== simW || newSimH !== simH) {
        simW = newSimW
        simH = newSimH
        trailFBOs.forEach((f) => {
          gl.deleteTexture(f.tex)
          gl.deleteFramebuffer(f.fbo)
        })
        trailFBOs = [createFBO(simW, simH, gl.LINEAR), createFBO(simW, simH, gl.LINEAR)]
      }
    }

    const onResize = () => {
      resize()
      wakeLoop()
    }
    window.addEventListener('resize', onResize, { passive: true })
    resize()

    function render(now) {
      if (isDisposed || !isHeroVisible || document.hidden) {
        animId = 0
        return
      }
      if (!imgLoaded) {
        animId = requestAnimationFrame(render)
        return
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const hasPendingActivity =
        isHover > 0.5 || isDown > 0.5 || now - lastActiveTime <= IDLE_SLEEP_MS
      if (hasPendingActivity) {
        animId = requestAnimationFrame(render)
      } else {
        animId = 0
      }

      // Compute cursor velocity (units / sec)
      let velX = 0.0, velY = 0.0
      if (prevMouseX > -900 && mouseX > -900 && dt > 0) {
        velX = (mouseX - prevMouseX) / dt
        velY = (mouseY - prevMouseY) / dt
      }
      prevMouseX = mouseX
      prevMouseY = mouseY

      gl.bindVertexArray(quadVao)

      // 1. Pass 1: rippleTrail ping-pong
      const readTrail = trailFBOs[trailIdx]
      const writeTrail = trailFBOs[1 - trailIdx]
      trailIdx = 1 - trailIdx

      gl.bindFramebuffer(gl.FRAMEBUFFER, writeTrail.fbo)
      gl.viewport(0, 0, simW, simH)
      gl.useProgram(trailProg)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, readTrail.tex)
      gl.uniform1i(trailLocs.buffer, 0)

      gl.uniform2f(trailLocs.resolution, canvas.width, canvas.height)
      gl.uniform1f(trailLocs.pixelRatio, dpr)
      gl.uniform1f(trailLocs.deltaTime, dt)
      gl.uniform4f(trailLocs.mousePosition, mouseX, mouseY, velX, velY)
      gl.uniform1f(trailLocs.mousePointerDown, isDown)
      gl.uniform1f(trailLocs.mouseHover, isHover)
      gl.uniform1f(trailLocs.trailDecay, trailDecay)
      gl.uniform1f(trailLocs.trailRadius, trailRadius)
      gl.uniform1f(trailLocs.trailSoftness, trailSoftness)
      gl.uniform1f(trailLocs.centerFade, centerFade)
      gl.uniform1f(trailLocs.trailStrength, trailStrength)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // 2. Pass 2: clickState ping-pong (9x1 nearest buffer)
      const readClick = clickFBOs[clickIdx]
      const writeClick = clickFBOs[1 - clickIdx]
      clickIdx = 1 - clickIdx

      gl.bindFramebuffer(gl.FRAMEBUFFER, writeClick.fbo)
      gl.viewport(0, 0, 9, 1)
      gl.useProgram(clickProg)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, readClick.tex)
      gl.uniform1i(clickLocs.buffer, 0)

      gl.uniform1f(clickLocs.deltaTime, dt)
      gl.uniform1f(clickLocs.mousePointerDown, isDown)
      gl.uniform4f(clickLocs.mousePosition, mouseX, mouseY, velX, velY)
      gl.uniform1f(clickLocs.trailDecay, trailDecay)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // 3. Pass 3: Main Render to Screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(mainProg)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, bgTex)
      gl.uniform1i(mainLocs.texture, 0)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, writeTrail.tex)
      gl.uniform1i(mainLocs.trailBuffer, 1)

      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, writeClick.tex)
      gl.uniform1i(mainLocs.clickBuffer, 2)

      gl.uniform2f(mainLocs.resolution, canvas.width, canvas.height)
      gl.uniform1f(mainLocs.pixelRatio, dpr)
      gl.uniform1f(mainLocs.trailDecay, trailDecay)
      gl.uniform1f(mainLocs.trailRadius, trailRadius)
      gl.uniform1f(mainLocs.trailStrength, trailStrength)
      gl.uniform1f(mainLocs.trailDisplacement, trailDisplacement)
      gl.uniform1f(mainLocs.dispersion, dispersion)
      gl.uniform1f(mainLocs.clickRipple, clickRipple ? 1.0 : 0.0)
      gl.uniform1f(mainLocs.clickSpeed, clickSpeed)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, null)
    }

    function syncRenderState() {
      if (isDisposed) return
      const activeWindow =
        isHover > 0.5 || isDown > 0.5 || performance.now() - lastActiveTime <= IDLE_SLEEP_MS
      if (isHeroVisible && !document.hidden && (!imgLoaded || activeWindow)) {
        if (!animId) {
          lastTime = performance.now()
          animId = requestAnimationFrame(render)
        }
      } else if (animId && (!isHeroVisible || document.hidden)) {
        cancelAnimationFrame(animId)
        animId = 0
      }
    }

    let visibilityObserver = null
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (!entry) return
          const becameVisible = !isHeroVisible && entry.isIntersecting
          isHeroVisible = entry.isIntersecting
          if (becameVisible) lastActiveTime = performance.now()
          syncRenderState()
        },
        { rootMargin: '120px 0px', threshold: 0.01 }
      )
      visibilityObserver.observe(heroSection || canvas)
    }

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) wakeLoop()
      else syncRenderState()
    }
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    syncRenderState()

    return () => {
      isDisposed = true
      img.onload = null
      if (animId) cancelAnimationFrame(animId)
      visibilityObserver?.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('resize', onResize)
      if (heroSection) {
        heroSection.removeEventListener('pointerenter', onPointerMove)
        heroSection.removeEventListener('pointermove', onPointerMove)
        heroSection.removeEventListener('pointerdown', onPointerDown)
        heroSection.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('pointerup', onPointerUp)
      }
      gl.deleteProgram(trailProg)
      gl.deleteProgram(clickProg)
      gl.deleteProgram(mainProg)
      gl.deleteVertexArray(quadVao)
      gl.deleteBuffer(quadBuf)
      gl.deleteTexture(bgTex)
      trailFBOs.forEach((f) => {
        gl.deleteTexture(f.tex)
        gl.deleteFramebuffer(f.fbo)
      })
      clickFBOs.forEach((f) => {
        gl.deleteTexture(f.tex)
        gl.deleteFramebuffer(f.fbo)
      })
    }
  }, [
    imageSrc,
    trailRadius,
    centerFade,
    trailSoftness,
    trailStrength,
    trailDecay,
    trailDisplacement,
    dispersion,
    clickRipple,
    clickSpeed,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="hero__water-canvas"
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
      aria-hidden="true"
    />
  )
}

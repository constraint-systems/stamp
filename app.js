let size = 16
let history_limit = 128

let color = {}
color.bg = '#282828'
color.fg = '#ebdbb2'
color.red = '#cc241d'
color.green = '#98971a'
color.yellow = '#d79921'
color.blue = '#458588'
color.purple = '#b16286'
color.aqua = '#689d68'
color.gray = '#a89984'
color.black = '#1d2021'

function snap(value) {
  return Math.floor(value / size) * size
}
function px(value) {
  return value + 'px'
}

window.addEventListener('load', () => {
  let dpr = window.devicePixelRatio || 1

  function setUpCanvas(c, width, height) {
    c.width = width * dpr
    c.height = height * dpr
    c.style.width = px(width)
    c.style.height = px(height)
    let cx = c.getContext('2d')
    cx.scale(dpr, dpr)
    return cx
  }

  function $(id) {
    return document.getElementById(id + 'ref')
  }
  let $cc = $('cc')
  let $oc = $('oc')
  let $checker = $('checker')
  let $ccholder = $('ccholder')
  let $ocholder = $('ocholder')
  let $canvastitle = $('canvastitle')
  let $sourcetitle = $('sourcetitle')
  let $modeholder = $('modeholder')
  let $mcc = $('mcc')
  let $moc = $('moc')
  let $modes = $modeholder.querySelectorAll('button')
  let $csread = $('csread')
  let $osread = $('osread')
  let $sizeread = $('sizeread')
  let $divideread = $('divideread')
  let $read = $('read')
  let $infobar = $('infobar')
  let $info = $('info')
  let $infobutton = $('infobutton')
  let $fileinput = $('fileinput')
  let $size = $('size')

  let ccx = $cc.getContext('2d')
  let ocx = $oc.getContext('2d')

  // state
  let state = {}
  state.mode = '1'
  state.km = {}
  state.cs = [0, 0, 1, 1]
  state.os = [0, 0, 1, 1]
  state.divide = 1
  state.before_resize = '1'
  state.history = []
  state.history.index = null

  let info_state = {}
  info_state.active = true
  if (window.innerWidth > 500) {
    info_state.width = 320
    info_state.position = [window.innerWidth - 320 - 16, 56]
  } else {
    info_state.position = [24, 56]
    info_state.width = window.innerWidth - 24 * 2
  }

  let keyboard_state = {}
  if (window.innerWidth > 500) {
    keyboard_state.active = false
  } else {
    keyboard_state.active = true
  }

  function setInfo() {
    $info.style.display = info_state.active ? 'block' : 'none'
    $info.style.left = px(info_state.position[0])
    $info.style.top = px(info_state.position[1])
    $info.style.width = px(info_state.width)
  }
  setInfo()

  let $keyboard = $('keyboard')
  function setKeyboard() {
    $keyboard.style.display = keyboard_state.active ? 'grid' : 'none'
  }
  setKeyboard()

  // set checker background
  let checker = document.createElement('canvas')
  let checkerx = setUpCanvas(checker, size * 2, size * 2)
  checkerx.fillStyle = '#fff'
  checkerx.fillRect(0, 0, checker.width, checker.height)
  checkerx.fillStyle = '#ddd'
  checkerx.fillRect(size, 0, size, size)
  checkerx.fillRect(0, size, size, size)
  let checker_image = checker.toDataURL()
  $checker.style.cssText =
    'position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'
  $checker.style.backgroundImage = 'url(' + checker_image + ')'
  $checker.style.backgroundSize = px(size * 2) + ' ' + px(size * 2)

  function loadImage(src) {
    let ww = window.innerWidth - size * 1
    // let wh = window.innerHeight - size * 4
    let wh =
      window.innerHeight -
      size * 4 -
      (keyboard_state.active ? 56 * 3 + 16 * 2 : 0)
    let w_aspect = ww / wh

    let img = document.createElement('img')
    img.onload = () => {
      // get width and height
      let iaspect = img.width / img.height
      let dbl_width = img.width * 2
      let dbl_height = img.height * 2
      let dw_aspect = dbl_width / img.height
      let dh_aspect = img.width / dbl_height
      let compare_w = Math.abs(dw_aspect - w_aspect)
      let compare_h = Math.abs(dh_aspect - w_aspect)
      let layout, lwidth, iwidth, iheight
      if (compare_w < compare_h) {
        layout = 'side'
        if (dw_aspect > w_aspect) {
          iwidth = snap(Math.min(ww / 2, img.width))
          iheight = snap(iwidth / iaspect)
        } else {
          iheight = snap(Math.min(wh, img.height))
          iwidth = snap(iheight * iaspect)
        }
        lwidth = iwidth * 2
      } else {
        layout = 'stack'
        if (dh_aspect > w_aspect) {
          iwidth = snap(Math.min(ww, img.width))
          iheight = snap(iwidth / iaspect)
        } else {
          iheight = snap(Math.min(wh / 2, img.height))
          iwidth = snap(iheight * iaspect)
        }
        lwidth = iwidth
      }

      $read.style.width = px(lwidth)
      $ccholder.parentNode.parentNode.parentNode.style.width = px(lwidth)

      $ccholder.style.width = px(iwidth)
      $ccholder.parentNode.style.width = px(iwidth)
      setUpCanvas($cc, iwidth, iheight)

      $mcc.style.position = 'absolute'
      $mcc.style.left = px(-4)
      $mcc.style.top = px(-4)
      let mccx = setUpCanvas($mcc, iwidth + 8, iheight + 8)
      mccx.translate(4, 4)

      $ocholder.style.width = px(iwidth)
      $ocholder.parentNode.style.width = px(iwidth)
      setUpCanvas($oc, iwidth, iheight)
      ocx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        $oc.width / dpr,
        $oc.height / dpr
      )
      $moc.style.position = 'absolute'
      $moc.style.left = px(-4)
      $moc.style.top = px(-4)
      let mocx = setUpCanvas($moc, iwidth + 8, iheight + 8)
      mocx.translate(4, 4)

      // reset history
      let current = ccx.getImageData(0, 0, $cc.width, $cc.height)
      state.history = [current]
      state.history.index = null

      renderMode()
      renderOCursor()
      renderCCursor()
      renderDivide()
      renderInfo()
      renderSize()
    }
    img.src = src
  }
  loadImage('public/akira.jpg')

  function renderSize() {
    let cols = $oc.width / size
    let rows = $oc.height / size
    $size.innerText = cols + 'x' + rows
  }

  function renderInfo() {
    if (info_state.active) {
      $info.style.display = 'block'
      $infobutton.style.background = 'var(--gray)'
      $infobutton.style.color = 'var(--bg)'
    } else {
      $infobutton.style.background = 'var(--black)'
      $infobutton.style.color = 'var(--gray)'
      $info.style.display = 'none'
    }
  }

  let $tc = document.createElement('canvas')
  function stamp() {
    let current = ccx.getImageData(0, 0, $cc.width, $cc.height)
    if (state.history.index !== null) {
      state.history = state.history.slice(0, state.history.index)
    }
    state.history.push(current)
    state.history = state.history.slice(-history_limit)
    state.history.index = null

    if (state.divide === 1) {
      ccx.drawImage(
        $oc,
        ...state.os.map(v => v * (size * dpr)),
        ...state.cs.map(v => v * size)
      )
    } else {
      // tc is special case no dpr adjust
      $tc.width = (16 / state.divide) * state.cs[2]
      $tc.height = (16 / state.divide) * state.cs[3]
      let tcx = $tc.getContext('2d')
      tcx.drawImage(
        $oc,
        ...state.os.map(v => v * size * dpr),
        0,
        0,
        $tc.width,
        $tc.height
      )
      ccx.imageSmoothingEnabled = false
      ccx.drawImage(
        $tc,
        0,
        0,
        $tc.width,
        $tc.height,
        ...state.cs.map(v => v * size)
      )
    }
  }

  function erase() {
    let current = ccx.getImageData(0, 0, $cc.width, $cc.height)
    if (state.history.index !== null) {
      state.history = state.history.slice(0, state.history.index)
    }
    state.history.push(current)
    state.history = state.history.slice(-history_limit)
    state.history.index = null

    ccx.clearRect(...state.cs.map(v => v * size))
  }

  function handleMove(x, y) {
    let cs = state.cs
    let os = state.os
    let cs_check = cs.slice()
    cs_check[0] += x
    cs_check[1] += y
    let os_check = os.slice()
    os_check[0] += x
    os_check[1] += y

    let cols = $oc.width / (size * dpr)
    let rows = $oc.height / (size * dpr)

    function checkBounds(cursor) {
      return (
        cursor[0] + cursor[2] > 0 &&
        cursor[0] < cols &&
        cursor[1] + cursor[3] > 0 &&
        cursor[1] < rows
      )
    }

    let move_cs = false
    let move_os = false
    if (state.mode === '1') {
      if (checkBounds(cs_check) && checkBounds(os_check)) {
        move_cs = true
        move_os = true
      }
    } else if (state.mode === '2') {
      if (checkBounds(cs_check)) {
        move_cs = true
      }
    } else if (state.mode === '3') {
      if (checkBounds(os_check)) {
        move_os = true
      }
    }
    if (move_cs) {
      state.cs = cs_check
    }
    if (move_os) {
      state.os = os_check
    }
  }

  function handleResize(x, y) {
    let cs = state.cs
    let os = state.os

    let cols = $oc.width / (size * dpr)
    let rows = $oc.height / (size * dpr)

    let cs_check = cs.slice()
    cs_check[2] += x
    cs_check[3] += y
    let os_check = os.slice()
    os_check[2] += x
    os_check[3] += y

    // also limit width and height to canvas width and height
    let cs_clear =
      cs_check[0] + cs_check[2] > 0 &&
      cs_check[0] < cols &&
      cs_check[1] + cs_check[3] > 0 &&
      cs_check[1] < cols &&
      cs_check[2] <= cols &&
      cs_check[3] <= rows &&
      cs_check[2] > 0 &&
      cs_check[3] > 0

    let os_clear =
      os_check[0] + os_check[2] > 0 &&
      os_check[0] < cols &&
      os_check[1] + os_check[3] > 0 &&
      os_check[1] < cols &&
      os_check[2] <= cols &&
      os_check[3] <= rows &&
      os_check[2] > 0 &&
      os_check[3] > 0

    if (cs_clear && os_clear) {
      state.cs[2] += x
      state.cs[3] += y
      state.os[2] += x
      state.os[3] += y
    }
  }

  function renderCCursor() {
    let mccx = $mcc.getContext('2d')
    mccx.clearRect(-4, -4, $mcc.width, $mcc.height)
    mccx.lineWidth = 2

    if (state.mode === 'r') {
      mccx.strokeStyle = color.green
    } else {
      mccx.strokeStyle = color.fg
    }
    mccx.strokeRect(
      state.cs[0] * size - 1,
      state.cs[1] * size - 1,
      state.cs[2] * size + 2,
      state.cs[3] * size + 2
    )
    mccx.strokeStyle = color.bg
    mccx.strokeRect(
      state.cs[0] * size,
      state.cs[1] * size,
      state.cs[2] * size,
      state.cs[3] * size
    )

    $csread.innerText = state.cs.slice(0, 2).join(',')
    $sizeread.innerText = state.cs.slice(2).join('x')
  }

  function renderOCursor() {
    let mocx = $moc.getContext('2d')
    mocx.clearRect(-4, -4, $moc.width, $moc.height)
    mocx.lineWidth = 2
    if (state.mode === 'r') {
      mocx.strokeStyle = color.green
    } else {
      mocx.strokeStyle = color.fg
    }
    mocx.strokeRect(
      state.os[0] * size - 1,
      state.os[1] * size - 1,
      state.os[2] * size + 2,
      state.os[3] * size + 2
    )
    mocx.strokeStyle = color.bg
    mocx.strokeRect(
      state.os[0] * size,
      state.os[1] * size,
      state.os[2] * size,
      state.os[3] * size
    )

    $osread.innerText = state.os.slice(0, 2).join(',')
  }

  function renderMode() {
    $canvastitle.classList.remove('active')
    $sourcetitle.classList.remove('active')
    for (let i = 0; i < $modes.length; i++) {
      $modes[i].classList.remove('active')
    }
    if (state.mode === '1') {
      $canvastitle.classList.add('active')
      $sourcetitle.classList.add('active')
      $modes[0].classList.add('active')
    } else if (state.mode === '2') {
      $canvastitle.classList.add('active')
      $modes[1].classList.add('active')
    } else if (state.mode === '3') {
      $sourcetitle.classList.add('active')
      $modes[2].classList.add('active')
    } else if (state.mode === 'r') {
      $modes[3].classList.add('active')
    }

    if (state.mode === '1' || state.mode === '3') {
      $osread.style.color = 'var(--green)'
    } else {
      $osread.style.color = 'inherit'
    }
    if (state.mode === '1' || state.mode === '2') {
      $csread.style.color = 'var(--green)'
    } else {
      $csread.style.color = 'inherit'
    }
    if (state.mode === 'r') {
      $sizeread.style.color = 'var(--green)'
    } else {
      $sizeread.style.color = 'inherit'
    }
  }

  function setMode(value) {
    state.mode = value
    renderMode()
  }

  function renderDivide() {
    $divideread.innerText = 'x' + 16 / state.divide
  }

  function keyAction(key, e) {
    if (key === 'x') {
      info_state.active = false
      renderInfo()
    }
    if (key === '?') {
      info_state.active = !info_state.active
      renderInfo()
    }

    let shift = e.shiftKey || keyboard_state.shift

    if (key === 'z') {
      if (shift) {
        if (
          state.history.index !== null &&
          state.history.length - 1 > state.history.index
        ) {
          new_u = state.history.index + 1
          ccx.putImageData(state.history[new_u], 0, 0)
          state.history.index = new_u
        }
      } else {
        let new_u
        if (state.history.index === null) {
          new_u = Math.max(0, state.history.length - 1)
          // preserve for redo
          let current = ccx.getImageData(0, 0, $cc.width, $cc.height)
          state.history.push(current)
        } else {
          if (state.history.index > 0) {
            new_u = Math.max(0, state.history.index - 1)
          }
        }
        ccx.putImageData(state.history[new_u], 0, 0)
        state.history.index = new_u
      }
    }

    if (key === 'o') {
      let input = $fileinput
      function handleChange(e) {
        let files = ''
        for (let item of this.files) {
          files += item.name + '.' + item.type
          if (item.type.indexOf('image') < 0) {
            continue
          }
          let src = URL.createObjectURL(item)
          loadImage(src)
        }
        this.removeEventListener('change', handleChange)
      }
      input.addEventListener('change', handleChange)

      input.click()
      // input.dispatchEvent(
      //   new MouseEvent('click', {
      //     bubbles: true,
      //     cancelable: true,
      //     view: window,
      //   })
      // )
    } else if (key === 'p') {
      let link = document.createElement('a')
      $cc.toBlob(function(blob) {
        link.setAttribute(
          'download',
          'stamp-' +
            new Date()
              .toISOString()
              .slice(0, -4)
              .replace(/-/g, '')
              .replace(/:/g, '')
              .replace(/_/g, '')
              .replace(/\./g, '') +
            'Z' +
            '.png'
        )

        link.setAttribute('href', URL.createObjectURL(blob))
        link.dispatchEvent(
          new MouseEvent(`click`, {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        )
      })
    }

    if (
      key === '1' ||
      key === '2' ||
      key === '3' ||
      key === 'r' ||
      key === 'escape' ||
      key === 'enter'
    ) {
      if (key === 'escape' || key === 'enter') {
        setMode(state.before_resize)
      } else if (key === 'r') {
        state.before_resize = state.mode
        setMode('r')
      } else {
        setMode(key)
      }
    }

    // 1 = 16, 2 = 8, 4 = 4, 8 = 2, 16 = 1
    if (key === '+') {
      if (state.divide > 1) {
        state.divide /= 2
      }
    } else if (key === '-') {
      if (state.divide < 16) {
        state.divide *= 2
      }
    }
    renderDivide()

    let km = state.km
    if (state.mode === 'r') {
      if (km.h || km.arrowleft) {
        handleResize(-1, 0)
      }
      if (km.l || km.arrowright) {
        handleResize(1, 0)
      }
      if (km.j || km.arrowdown) {
        handleResize(0, 1)
      }
      if (km.k || km.arrowup) {
        handleResize(0, -1)
      }
      if (
        km.h ||
        km.l ||
        km.j ||
        km.k ||
        km.arrowleft ||
        km.arrowright ||
        km.arrowup ||
        km.arrowdown
      ) {
        renderCCursor()
        renderOCursor()
      }
    } else {
      let canvas_move = state.mode === '1' || state.mode === '2'
      let source_move = state.mode === '1' || state.mode === '3'
      let move = [state.cs[2], state.cs[3]]
      if (shift) move = [1, 1]
      if (km.h || km.arrowleft) {
        handleMove(-move[0], 0)
      }
      if (km.l || km.arrowright) {
        handleMove(move[0], 0)
      }
      if (km.j || km.arrowdown) {
        handleMove(0, move[1])
      }
      if (km.k || km.arrowup) {
        handleMove(0, -move[1])
      }
      if (
        km.h ||
        km.l ||
        km.j ||
        km.k ||
        km.arrowleft ||
        km.arrowright ||
        km.arrowup ||
        km.arrowdown
      ) {
        renderCCursor()
        renderOCursor()
      }
    }
    if (km.d) {
      stamp()
    } else if (km.e) {
      erase()
    }
  }

  function downHandler(e) {
    state.km[e.key.toLowerCase()] = true
    keyAction(e.key.toLowerCase(), e)
  }

  function upHandler(e) {
    state.km[e.key.toLowerCase()] = false
  }

  window.addEventListener('keydown', downHandler)
  window.addEventListener('keyup', upHandler)
  window.addEventListener('paste', onPaste)
  window.addEventListener('dragover', onDrag)
  window.addEventListener('drop', onDrop)

  function onDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    let file = e.dataTransfer.files[0]
    let filename = file.path ? file.path : file.name ? file.name : ''
    let src = URL.createObjectURL(file)
    loadImage(src)
  }

  function onDrag(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function onPaste(e) {
    e.preventDefault()
    e.stopPropagation()
    for (const item of e.clipboardData.items) {
      if (item.type.indexOf('image') < 0) {
        continue
      }
      let file = item.getAsFile()
      let src = URL.createObjectURL(file)
      loadImage(src)
    }
  }

  info_state.pressed = false
  info_state.click_offset = [0, 0]
  $infobar.addEventListener('mousedown', e => {
    info_state.click_offset = [
      e.clientX - info_state.position[0],
      e.clientY - info_state.position[1],
    ]
    info_state.pressed = true
  })
  window.addEventListener('mousemove', e => {
    if (info_state.pressed) {
      info_state.position = [
        e.clientX - info_state.click_offset[0],
        e.clientY - info_state.click_offset[1],
      ]
      setInfo()
    }
  })
  window.addEventListener('mouseup', () => {
    info_state.pressed = false
  })

  function getButtonKey($button) {
    let key = $button.innerText.trim()
    let map = {
      '←': 'arrowleft',
      '↓': 'arrowdown',
      '↑': 'arrowup',
      '→': 'arrowright',
    }
    let map_keys = Object.keys(map)
    if (map_keys.indexOf(key) > -1) {
      key = map[key]
    }
    return key
  }

  let $keyboard_shift = $('keyboard_shift')
  keyboard_state.shift = false

  let $buttons = document.querySelectorAll('button')
  // one repeat check for all buttons
  let repeat_check = null
  let button_repeats = {}

  let touch = { current: false }

  $buttons.forEach(function($button) {
    let button_state = {}
    button_state.interval = null
    let key = getButtonKey($button)

    $button.addEventListener('touchstart', function(e) {
      touch.current = true
      // keyboard shift special case
      if (key === 'sh') {
        if (keyboard_state.shift === true) {
          keyboard_state.shift = false
          $keyboard_shift.classList.remove('active')
        } else {
          keyboard_state.shift = true
          $keyboard_shift.classList.add('active')
        }
      } else {
        repeat_check = null
        state.km[key] = true
        keyAction(key, { shiftKey: false })
        setTimeout(() => {
          if (repeat_check === key) {
            button_state.interval = setInterval(() => {
              if (repeat_check === key) {
                keyAction(key, { shiftKey: false })
              } else {
                clearInterval(button_state.interval)
              }
            }, 75)
          }
        }, 300)
        repeat_check = key
      }
      function handleEnd() {
        setTimeout(() => {
          touch.current = false
        }, 400)
        state.km[key] = false
        if (repeat_check === key) repeat_check = null
        clearInterval(button_state.interval)
        $button.removeEventListener('touchend', handleEnd)
        $button.removeEventListener('touchcancel', handleEnd)
      }
      $button.addEventListener('touchcancel', handleEnd)
      $button.addEventListener('touchend', handleEnd)

      // prevent default prevents all mouse events
      e.preventDefault()
      e.stopPropagation()
    })

    $button.addEventListener('mousedown', function() {
      if (!touch.current) {
        let key = getButtonKey(this)
        // keyboard shift special case
        if (key === 'sh') {
          if (keyboard_state.shift === true) {
            keyboard_state.shift = false
            $keyboard_shift.classList.remove('active')
          } else {
            keyboard_state.shift = true
            $keyboard_shift.classList.add('active')
          }
        } else {
          state.km[key] = true
          keyAction(key, { shiftKey: false })
          setTimeout(() => {
            if (button_state.repeat_check) {
              button_state.interval = setInterval(function() {
                keyAction(key, { shiftKey: false })
              }, 50)
            }
          }, 300)
          button_state.repeat_check = true
        }
        function handleUp() {
          state.km[key] = false
          button_state.repeat_check = false
          clearInterval(button_state.interval)
          window.removeEventListener('touchend', handleUp)
        }
        window.addEventListener('mouseup', handleUp)
      }
    })
  })
})

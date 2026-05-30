import { WebSocketServer } from 'ws';
import { Button, Key, Point, keyboard, mouse, screen } from '@nut-tree-fork/nut-js';

const port = Number(process.env.INPUT_AGENT_PORT || 9090);
const host = process.env.INPUT_AGENT_HOST || '127.0.0.1';
const authToken = process.env.INPUT_AGENT_TOKEN || '';
const relativeMouseSensitivity = Number(process.env.INPUT_AGENT_MOUSE_SENSITIVITY || 1);

keyboard.config.autoDelayMs = 0;
mouse.config.autoDelayMs = 0;
mouse.config.mouseSpeed = 10000;

const buttonMap = new Map([
  [0, Button.LEFT],
  [1, Button.MIDDLE],
  [2, Button.RIGHT]
]);

const keyMap = createKeyMap();
let actionQueue = Promise.resolve();
let cachedScreen = null;
let cachedScreenAt = 0;

const wss = new WebSocketServer({ host, port });

wss.on('connection', (ws, request) => {
  const remote = request.socket.remoteAddress;
  if (!isLoopback(remote)) {
    ws.close(1008, 'Only local connections are allowed');
    return;
  }

  ws.authed = authToken.length === 0;

  ws.on('message', (message) => {
    let input;
    try {
      input = JSON.parse(message);
    } catch (err) {
      return;
    }

    if (input.type === 'auth') {
      ws.authed = authToken.length === 0 || input.token === authToken;
      ws.send(JSON.stringify({ type: 'auth', ok: ws.authed }));
      if (!ws.authed) ws.close(1008, 'Invalid input agent token');
      return;
    }

    if (!ws.authed) return;
    enqueueInput(input);
  });
});

wss.on('listening', () => {
  console.log(`Pixulse input agent listening on ws://${host}:${port}`);
});

function enqueueInput(input) {
  actionQueue = actionQueue
    .then(() => handleInput(input))
    .catch((err) => {
      console.error('Input action failed:', err);
    });
}

async function handleInput(input) {
  switch (input.type) {
    case 'key':
      await handleKey(input);
      break;
    case 'mouse-move-absolute':
      await handleAbsoluteMouse(input);
      break;
    case 'mouse-move-relative':
      await handleRelativeMouse(input);
      break;
    case 'mouse-button':
      await handleMouseButton(input);
      break;
    case 'mouse-wheel':
      await handleMouseWheel(input);
      break;
    default:
      break;
  }
}

async function handleKey(input) {
  const key = keyMap.get(input.code);
  if (key === undefined) return;

  if (input.action === 'down') {
    await keyboard.pressKey(key);
  } else if (input.action === 'up') {
    await keyboard.releaseKey(key);
  }
}

async function handleAbsoluteMouse(input) {
  const bounds = await getScreenBounds();
  const x = clamp(Math.round(Number(input.x) * (bounds.width - 1)), 0, bounds.width - 1);
  const y = clamp(Math.round(Number(input.y) * (bounds.height - 1)), 0, bounds.height - 1);
  await mouse.setPosition(new Point(x, y));
}

async function handleRelativeMouse(input) {
  const bounds = await getScreenBounds();
  const current = await mouse.getPosition();
  const x = clamp(Math.round(current.x + Number(input.dx) * relativeMouseSensitivity), 0, bounds.width - 1);
  const y = clamp(Math.round(current.y + Number(input.dy) * relativeMouseSensitivity), 0, bounds.height - 1);
  await mouse.setPosition(new Point(x, y));
}

async function handleMouseButton(input) {
  const button = buttonMap.get(Number(input.button));
  if (button === undefined) return;

  if (input.action === 'down') {
    await mouse.pressButton(button);
  } else if (input.action === 'up') {
    await mouse.releaseButton(button);
  }
}

async function handleMouseWheel(input) {
  const verticalSteps = Math.min(Math.ceil(Math.abs(Number(input.deltaY || 0)) / 80), 12);
  const horizontalSteps = Math.min(Math.ceil(Math.abs(Number(input.deltaX || 0)) / 80), 12);

  if (verticalSteps > 0) {
    if (Number(input.deltaY) > 0) {
      await mouse.scrollDown(verticalSteps);
    } else {
      await mouse.scrollUp(verticalSteps);
    }
  }

  if (horizontalSteps > 0) {
    if (Number(input.deltaX) > 0) {
      await mouse.scrollRight(horizontalSteps);
    } else {
      await mouse.scrollLeft(horizontalSteps);
    }
  }
}

async function getScreenBounds() {
  const now = Date.now();
  if (cachedScreen && now - cachedScreenAt < 1000) {
    return cachedScreen;
  }

  cachedScreen = {
    width: await screen.width(),
    height: await screen.height()
  };
  cachedScreenAt = now;
  return cachedScreen;
}

function createKeyMap() {
  const map = new Map([
    ['Escape', Key.Escape],
    ['Backquote', Key.Grave],
    ['Minus', Key.Minus],
    ['Equal', Key.Equal],
    ['Backspace', Key.Backspace],
    ['Tab', Key.Tab],
    ['BracketLeft', Key.LeftBracket],
    ['BracketRight', Key.RightBracket],
    ['Backslash', Key.Backslash],
    ['CapsLock', Key.CapsLock],
    ['Semicolon', Key.Semicolon],
    ['Quote', Key.Quote],
    ['Enter', Key.Return],
    ['ShiftLeft', Key.LeftShift],
    ['ShiftRight', Key.RightShift],
    ['Comma', Key.Comma],
    ['Period', Key.Period],
    ['Slash', Key.Slash],
    ['ControlLeft', Key.LeftControl],
    ['ControlRight', Key.RightControl],
    ['MetaLeft', Key.LeftWin],
    ['MetaRight', Key.RightWin],
    ['AltLeft', Key.LeftAlt],
    ['AltRight', Key.RightAlt],
    ['Space', Key.Space],
    ['ContextMenu', Key.Menu],
    ['Insert', Key.Insert],
    ['Home', Key.Home],
    ['PageUp', Key.PageUp],
    ['Delete', Key.Delete],
    ['End', Key.End],
    ['PageDown', Key.PageDown],
    ['ArrowUp', Key.Up],
    ['ArrowLeft', Key.Left],
    ['ArrowDown', Key.Down],
    ['ArrowRight', Key.Right],
    ['NumLock', Key.NumLock],
    ['NumpadDivide', Key.Divide],
    ['NumpadMultiply', Key.Multiply],
    ['NumpadSubtract', Key.Subtract],
    ['NumpadAdd', Key.Add],
    ['NumpadEnter', Key.Enter],
    ['NumpadDecimal', Key.Decimal]
  ]);

  for (let index = 0; index <= 9; index += 1) {
    map.set(`Digit${index}`, Key[`Num${index}`]);
    map.set(`Numpad${index}`, Key[`NumPad${index}`]);
  }

  for (let code = 65; code <= 90; code += 1) {
    const letter = String.fromCharCode(code);
    map.set(`Key${letter}`, Key[letter]);
  }

  for (let index = 1; index <= 24; index += 1) {
    map.set(`F${index}`, Key[`F${index}`]);
  }

  return map;
}

function isLoopback(remoteAddress = '') {
  return remoteAddress === '127.0.0.1' ||
    remoteAddress === '::1' ||
    remoteAddress === '::ffff:127.0.0.1';
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

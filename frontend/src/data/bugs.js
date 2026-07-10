// Shared between the terminal's `play` command and the standalone game widget
// (embedded on Friend's home page + the /play page) - same bug set everywhere,
// so it reads as one connected game rather than two disconnected copies.
export const BUGS = [
  'if (user = null) { return false; }',
  'for (let i = 0; i <= arr.length; i++) {',
  'const data = await fetch(url).json();',
  'const query = "SELECT * FROM users WHERE id = " + userId;',
  'array[array.length] = newItem  // off by one waiting to happen',
]

export const GAME_SECONDS = 20

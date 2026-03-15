// tile in code for the HTML
const output = document.getElementById('output')
const input = document.getElementById('input')
const submit = document.getElementById('submit')

const game = new AcquireGame()
output.textContent = game.textBack

function runInput() {
  const value = input.value
  const response = game.stepThrough(value)
  output.textContent = response
  input.value = ''
  input.focus()
}

submit.addEventListener('click', runInput)
input.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    runInput()
  }
})

input.focus()

export function initializeTheme() {
  // Check if user has a theme preference stored
  const storedTheme = localStorage.getItem('theme')
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Apply theme based on stored preference, defaulting to light
  const theme = storedTheme || 'light'
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Store the theme preference
  localStorage.setItem('theme', theme)
}
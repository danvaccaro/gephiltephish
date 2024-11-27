(function() {
    function getInitialTheme() {
      const persistedTheme = localStorage.getItem('theme');
      if (persistedTheme) {
        return persistedTheme;
      }
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
  
    const theme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(theme);
  
    const meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = theme;
    document.head.appendChild(meta);
  })();
  
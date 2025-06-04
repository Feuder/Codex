document.addEventListener('DOMContentLoaded', () => {
  console.log('Startseite geladen');
  const links = document.querySelectorAll('.main-nav a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      console.log(`${link.textContent} geklickt`);
    });
  });
});

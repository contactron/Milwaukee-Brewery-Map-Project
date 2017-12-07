var slideout = new Slideout({
    'panel': document.getElementById('main'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
  });

  slideout.open();
  document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
    slideout.toggle();
  });
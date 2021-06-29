// Adds transition to img load.
addEventListener('DOMContentLoaded', function () {
  function initImage (img) {
    img.style.opacity = 0
    img.onload = function () {
      img.style.transition = 'opacity .5s ease-out'
      img.style.opacity = 1
    }
    if (img.complete) {
      img.onload()
    }
  }

  var images = document.querySelectorAll('.image img')
  for (var i = 0; i < images.length; i++) {
    initImage(images[i])
  }
})
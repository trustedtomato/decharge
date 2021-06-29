---
title: Programming Zatacka
date: 2018-05-16
---

Zatacka is a multiplayer game played generally on one computer.
You can view it's source on [Github](https://github.com/trustedtomato/zatacka) and
play the game [on its website](https://trustedtomato.github.io/zatacka/).

But what's more interesting from a techinal perspective is that how I got there.

In Zatacka, a player dies when its trail-leaving colored snake hits the wall or another trail. 

Firstly, I finished a version where I based the collision detection on the actual pixels of the canvas,
since by default, the pixels are black, and when someone goes through it, it gets colored.
To get the pixel data I called [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) for the entire canvas.
When doing that, the browser has to create a pretty huge Uint8ClampedArray: it's size is
`boardWidth * boardHeight * 4` (every pixel has 4 color channels, red, green, blue and alpha) bytes which is around 3.4MiB using a board
which fills my basic HD monitor.
If I make an array that big every 16th millisecond (which I have to at 60fps) then that fills in my 4GiB memory in 19 seconds *(there is no way to reuse the buffer)*.
The time is similar at different screen and memory sizes, and is definitely not good:
the forced garbage collecting introduces lags way too big.
Plus `getImageData` is expensive in itself because the pixel data is stored on the GPU,
so all the data has to be translated for usage on the CPU.

Next I tried many small getImageData calls, but that didn't cut it either.

Okay, then I shouldn't use getImageData. I'll maintain the image data myself and
then paint it with [putImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData).
Well, it turns out calling putImageData is expensive too (probably because of the CPU-GPU translation thing).

My final attempt was to maintain the data separately both on the GPU and CPU:
when I paint something on the canvas, I also set the corresponding array's corresponding elements to true,
so that when I check if a pixel is filled I only have to check its corresponding array element for its truthiness.
This way I don't have to call get/putImageData at all.
When benchmarking it, out of 2940 frames 11 took more time than 1ms and they were
```js
[​1.6199999999953434, 1.2799999999988358, 1.1599999999743886, 1.1400000000139698, 1.2600000000093132, 2.2399999999906868, 1.040000000008149, 1.040000000008149, 2.860000000015134, 6.1600000000034925, 1.0799999999871943, 1.0399999999790452]
```

That's a freakingly good performance.
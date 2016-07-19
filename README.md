# jquery-sloth-konami

jQuery plugin that rains sloths when the Konami code is entered.

See [here](https://github.com/aldahick/jquery-sloth-konami/tree/master/demo) for example usage and a nice sloth image. A short demo clip can be found [here](http://i.imgur.com/JJovQFJ.gifv).

## API

```
$("#foo").sloth({
    "imageUrl": "sloth.png", // the URL of your sloth image
    "drawWidth": 50, // the width of each sloth as it's drawn
    "drawHeight": 50, // the height of each sloth as it's drawn
    "renderInterval": 100, // the time in milliseconds between waterfall updates/renders
    "newSlothInterval": 200, // the time in milliseconds between sloth creations
    "waterfallSpeed": 15, // the number of pixels each sloth falls (on y-axis) per render/update
});
```

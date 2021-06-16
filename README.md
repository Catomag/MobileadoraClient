# Mobileadora client
A simple html page + pwa that can be used to connect to my [other app](https://github.com/InspiredGoat/Mobileadora). It can create buttons, joysticks, checkboxes and more whilst communicating efficiently with my custom server. 

Made in raw untamed js and html5 because react is for weaklings. And also compatibility and performance reasons ;)

## Library
The library connects to a Mobileadora server and fills an html "root" element with inputs (joysticks, buttons, checkboxes) and elements (Colors, text, spacing). By default the library will look for the first `<ma-frame>` tag it can find, and assign that as its root element all inputs and elements will be created there. The root element can be set with `ma.setRoot(element)`.

The library is controlled entirely through the `MobileadoraClient` object which is created like so:
`var ma = new MobileadoraClient();`

Then, `ma.connect(ipAddress)` should be called which attempts to connect the library to a Mobileadora server

The `ma.frameRemove()` function can be used to completely delete a frame and all its contents.

Appart from that the library handles the rest, switching frames, deleting frames and etc.

## Styling
All elements have the suffix `ma-` on their html tag (ie `<ma-joystick>` or `<ma-button>`). I would recomend starting with the styles.css file in this repository and tweaking the colors and animations to your liking. 

Also important to mention that there is a custom css class `"active"` which is given to buttons and checkboxes when they are turned on, similar to `:active`. However, this system works when pressing two inputs at the same time.


## index.html
There is an index.html page which provides a simple prototype to get started. It also includes a simple PWA, so that people can pretend its a NATIVE app
- By default the website connects to the server currently on the url with port 8080 added when the green button is pressed

# Adding this amazing library to your webzone
- fairly standard stuff, what you want to do is add `<script src="https://raw.githubusercontent.com/InspiredGoat/MobileadoraClient/main/mobiladora.js charset="utf-8"></script>"`
- you should also add the styles.css file in this repository as stated above, I found a nice set of values for the dimensons of all the objects

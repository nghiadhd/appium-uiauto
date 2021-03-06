## Appium-UIAuto

[![NPM version](http://img.shields.io/npm/v/appium-uiauto.svg)](https://npmjs.org/package/appium-uiauto)
[![Downloads](http://img.shields.io/npm/dm/appium-uiauto.svg)](https://npmjs.org/package/appium-uiauto)
[![Dependency Status](https://david-dm.org/appium/appium-uiauto/2.0.svg)](https://david-dm.org/appium/appium-uiauto/2.0)
[![devDependency Status](https://david-dm.org/appium/appium-uiauto/2.0/dev-status.svg)](https://david-dm.org/appium/appium-uiauto/2.0#info=devDependencies)

[![Build Status](https://api.travis-ci.org/appium/appium-uiauto.png?branch=2.0)](https://travis-ci.org/appium/appium-uiauto)
[![Coverage Status](https://coveralls.io/repos/appium/appium-uiauto/badge.svg?branch=2.0)](https://coveralls.io/r/appium/appium-uiauto?branch=2.0)


Appium interface for the iOS [UI Automation](https://developer.apple.com/library/watchos/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/UIAutomation.html) framework. Provides access to the JavaScript [API](https://developer.apple.com/library/ios/documentation/DeveloperTools/Reference/UIAutomationRef/).

Consists of a client, `UIAutoClient`, through which you interact with the iOS UI Automation framework, and a server which is embedded on the device, running the commands in the context of the running application.

In addition, there is a tool, `prepareBootstrap`, which builds a script which will be inserted onto the device. Any code that is necessary for running the commands can be added through that tool.


### Usage

#### `UIAutoClient`

The client is used to send JavaScript commands to the device. It needs to be instantiated with a socket location (which defaults to `/tmp/instruments_sock`), and started, after which commands can be sent using the `sendCommand` method:

```js
import UIAutoClient from 'appium-uiauto';


let client = new UIAutoClient();
client.start();

// send a command to get the source code for the view
let source = await this.uiAutoClient.sendCommand('au.mainApp().getTreeForXML()');
```

In practice the instantiation of the `UIAutoClient` is usually coupled with launching instruments for automating the device. This is handled by awaiting the promises from both that start of `UIAutoClient` and the launch of [`Instruments`](https://github.com/appium/appium-instruments):

```js
import UIAutoClient from 'appium-uiauto';
import { Instruments, utils } from 'appium-instruments';

let uiAutoClient = new UIAutoClient();
let instruments = await utils.quickInstruments();

await B.all([
  uiAutoClient.start().then(() => { instruments.registerLaunch(); }),
  instruments.launch()
]);

let source = await this.uiAutoClient.sendCommand('au.mainApp().getTreeForXML()');
```

#### `prepareBootstrap`

The second important function is `prepareBootstrap`, which is used to create the script which will be injected into the device. This includes custom Appium UI Automation code to fix certain functionality, as well as any other code that necessary.

Basic usage of `prepareBootstrap` creates a file with all of the Appium UI Automation code collated into one long script, which can then be put onto the device when launching Instruments:

```js
import { prepareBootstrap } from 'appium-uiauto';

let bootstrapPath = await prepareBootstrap();
```

Further, `prepareBootstrap` can take a hash with any of the following values:

- `sock` - the location of the instruments socket (defaults to `/tmp/instruments_sock`)
- `interKeyDelay` - the time, in `ms`, to pause between keystrokes when typing
- `justLoopInfinitely` - tells the server not to stop looking for new commands
- `autoAcceptAlerts` - automatically accept alerts as they arise
- `autoDismissAlerts` - automatically accept alerts as they arise
- `sendKeyStrategy` - the "strategy" for typing. This can be
      - `oneByOne` - type as normal, one key at a time
      - `grouped` - group together keys to be sent all at once
      - `setValue` - bypass the keyboard and directly set the value on the element rather than actually typing

The last option that can be sent in is `imports.pre`, through which is sent an array of paths to any JavaScript files to be added to the generated script. This is the means by which custom libraries can be added to the environment:

```js
import { prepareBootstrap } from 'appium-uiauto';

let bootstrapPath = await prepareBootstrap({
  sock: '/path/to/my/instruments_socket',
  interKeyDelay: 500,
  justLoopInfinitely: false,
  autoAcceptAlerts: true,
  autoDismissAlerts: true,
  sendKeyStrategy: 'oneByOne',
  imports: {
    pre: [
      '/path/to/my/first/import',
      '/path/to/my/second/import'
    ]
  }
});
```
#### `utils`

The `utils` object has a single helper function, `rotateImage`, which takes the path to an image, and the degrees to rotate, and executes a custom AppleScript function to rotate the image appropriately. Used to handle screenshots in Appium.

```js
import { utils } from 'appium-uiauto';
import { fs } from 'appium-support';

// set up client as appropriate
// ...

let shotFile = '/path/to/file/for/screenshot';
await uiAutoClient.sendCommand(`au.capture('${shotFile}')`);

// rotate the image
await utils.rotateImage(shotPath, -90);

let screenshot = await fs.readFile(shotPath);
```

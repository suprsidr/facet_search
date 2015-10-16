# HH Faceted Search Builder
Build and save Faceted Marketing URLs

# Quick start
The only development dependencies of this project is
[Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.org). So just
make sure you have them installed.
Then type few commands known to every Node developer...
```
git clone https://github.com/suprsidr/facet_search.git
cd facet_search
npm install
npm start
```

... and boom! You have running desktop application on your screen.

# Development

#### Installation

```
npm install
```

It will also download NW runtime, and install dependencies for second `package.json` file inside `app` folder.

#### Starting the app

```
npm start
```

# Making a release

**Note:** There are various icon and bitmap files in `resources` directory. Those are used in installers and are intended to be replaced by your own graphics.

To make ready for distribution installer use command:
```
npm run release
```
It will start the packaging process for operating system you are running this command on. Ready for distribution file will be outputted to `releases` directory.

You can create Windows installer only when running on Windows, the same is true for Linux and OSX. So to generate all three installers you need all three operating systems.

## Special precautions for Windows
As installer [NSIS](http://nsis.sourceforge.net/Main_Page) is used. You have to install it (version 3.0), and add NSIS folder to PATH in Environment Variables, so it is reachable to scripts in this project (path should look something like `C:/Program Files (x86)/NSIS`).

## Hints:

After initial run of step 2 (Insert in local DB) - future runs of this step will be much quicker if you create a unique index on ProdID

```
db.products.createIndex( { "ProdID": 1 }, { unique: true } )
```

# License

The MIT License (MIT)

Copyright (c) 2015 Wayne Patterson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

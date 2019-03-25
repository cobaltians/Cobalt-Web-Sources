### How to use ?

**Don't** use these scripts if you just want to use the framework.
Use the concatened & minified versions at [github.com/cobaltians/Cobalt-Web](https://github.com/cobaltians/Cobalt-Web) instead.

### I want to help on Cobalt, how does it work ?

Javascript files are split into a common file for all OS and an adapter file for each platform.

#### How to compile new versions from this sources ?

To build cobalt.js and cobalt.min.js files for each platform in one row, run the following command line:

    python compile.py
    
##### Building requirements

* You will need Python > 2.7
* 'uglifyjs' should be installed first for minified versions to be built. You can find UglifyJS [here](https://github.com/mishoo/UglifyJS2) as a node package.
* make sure to have git cloned [Cobalt-Web](https://github.com/cobaltians/Cobalt-Web)in the same folder as this one because the script will try to write to `../Cobalt-Web/`

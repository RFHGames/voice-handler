# Voice Handler

A simple tool to make the process of choosing takes from voice lines and naming them a bit easier.

This is an Electron app intended to be used with Node.js and NPM. Install dependencies with `npm install`, create a directory called `in` in the same directory as the tool, put your individual voice files in there (probably split using the voice splitting tool), then run with `npm start`.

When the program opens, you will be asked to choose an audio file to start with. The left and right buttons in the interface will then let you move to the next and previous files in the `in` directory.

User interface should be generally self-explanatory except for:

-   Jump To: Same as when the program opens.
-   Append To: Asks you to choose one of your existing output files. Once chosen, it takes the file currently selected in the tool and adds it to the end of the file you selected from the output.

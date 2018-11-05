# Langton's Anthill

Place Langton's Ants on Langton's Anthill and watch them build structures and paths. Each click adds a new ant to the anthill. The special thing about this anthill: the ant's rules are 255 instructions long. Accordingly, each cell of the anthill has 255 states.
You can play with the anthill at http://unpunk.de.

## Installation

To install your own copy and maybe play with the anthill's and ants' configuration, do the following.

1. Download the repo: https://github.com/bubens/LangtonsAnthill
2. Compile the typescript. The make.sh-Shellscript can do that for you:
```bash
# Make it executable
chown +x ./make.sh
# Run command
./make.sh
```
3. To use the same font I did (and in case they're not installed on your machine): [download](https://assets.ubuntu.com/v1/fad7939b-ubuntu-font-family-0.83.zip) the Ubuntu Fontfamily, unzip and copy ```Ubuntu-L.ttf``` to the ```style```-folder.
OR: Use your own favorite font instead.

4. Open ```index.html``` with your browser to try it locally. Use your favorite server software to make it available on the web.

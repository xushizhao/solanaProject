# Identifiable NFT ( iNFT in short ) Viewer
- Identifiable NFT Editor, can create iNFT template from single image. It is a powerful tools to deal with every detail of iNFT.

## Feather
- Need to load W3API from local, need to link the API folder to node_modules. Be careful, when new package is added to the project, you need to relink the folder.
```javascript
    # change to node_modules folder of UI
    cd node_modules
    
    # add link to NPM
    ln -s ../../../APIs ./w3api
```
## Scarcity Calculation
- Designer need to category image parts to special series. When all the parts in the same series, the iNFT result is a perfect one.
```javascript
    //parts的divide值
    const parts=[16,8,12,4]

    //if there is 3 series, how to categray the parts.
    //a single part of image can be categoried to different series
    const rare=[
            [0,1,2,3,4],    //part 1 , n0=5
            [0,4],          //part 2 , n1=2
            [0,1,12],       //part 3 , n2=3
            [0,1]           //part 4 , n3=2
        ],
        [...],  //Series 2, same as series 1
        [...]   //Series 3, same as series 1
    ]
    const target=rare[0]; 
    const rate=(target[0].length/parts[0])
        *(target[1].length/parts[1])
        *(target[2].length/parts[2])
        *(target[3].length/parts[3])
```

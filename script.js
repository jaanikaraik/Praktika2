let elementIndex = 0;

let currentFolder;
let allFolders1 = [];

var currentlySelecting = false;


window.addEventListener('DOMContentLoaded', (event) => {
    window.api.send("getAllFolders", "");
    window.api.receive('getAllFoldersResult', (replyString) => {
        try {
            allFolders1 = JSON.parse(replyString)['files'];
            let allFoldersSorted = sortFolderNamesArray(allFolders1);
            //console.log(allFoldersSorted);
            currentFolder = allFoldersSorted[elementIndex];
            choose(currentFolder.folderPath);
        } catch (err) {
            console.error(err);
        }
    });
});

function getFolderNumber(folderName) {
    //saame kätte kataloogi stringile vastava arvu
    console.log(`getFolderNumber(${folderName})`);
    let pattern = /\\([^\\]+)$/;
    let numberString = folderName.match(pattern);
    let number = parseInt(numberString);
    return number;
}

function sortFolderNamesArray(folderNamesArray) {
    //kataloogid sorteeritakse numbrilises mitte tähestikulises järjekorras
    console.log(`sortFolderNamesArray(${folderNamesArray})`);
    if (!folderNamesArray) {
        throw "folderNamesArray does not exist.";
    } else if (folderNamesArray.length == 0) {
        throw "folderNamesArray is empty.";
    }
    let newArray = []; //muuta
    for (let folderPath of folderNamesArray) {
        newArray.push({
            "folderPath": folderPath,
            "folderNumber": getFolderNumber(folderPath)
        });
    }
    newArray = newArray.sort((a, b) => a.folderNumber - b.folderNumber);
    return newArray;
}

function nextPerson() {
    if (!currentlySelecting) {
        //liigume järgmise idga inimese piltide juurde
        elementIndex += 1;
        currentFolder = allFolders1[elementIndex];
        choose(currentFolder);
    }
}

function previousPerson() {
    if (!currentlySelecting) {
        //liigume eelmise idga inimese piltide juurde
        if (elementIndex >= 1) {
            elementIndex -= 1;
            currentFolder = allFolders1[elementIndex];
            choose(currentFolder);
        }
    }
}

function print(text) {
    var node = document.createElement("LI");                 // Create a <li> node
    var textnode = document.createTextNode((text));         // Create a text node
    node.appendChild(textnode);                              // Append the text to <li>
    document.querySelector(".images").appendChild(node);
}
function addPicture(src, styleClass) {
    try {
        logHelper("styleClass", styleClass);
        var imageElement = document.createElement("img");                 // Create a <li> imageElement
        imageElement.setAttribute("src", src);
        //pildile pealeklikkimisfunktsiooni lisamine
        imageElement.addEventListener("click", function(){
            if (styleClass === 'images2') {
                selectImage(src, imageElement);
            }
        })
        document.querySelector("." + styleClass).appendChild(imageElement);
    } catch (err){
        console.error(err);
    }
    
}
function logHelper(name, value) {
    console.log(`${name}, type=${typeof (value)}, value=${value}`);
    if (typeof (value) === "object" && value !== null) {
        // get properties of object
        console.log(`||||, properties: ${Object.getOwnPropertyNames(value)}`);
    }
}

function emptyDiv(folderName) {
    const divNode = document.getElementById("database_people");
    divNode.innerHTML = '';
    //uus
    const divNode2 = document.getElementById("predicted_raw_collection");
    divNode2.innerHTML = '';
    //id ekraanil kuvamine
    const divNode3 = document.getElementById("person_id");
    let index = folderName.lastIndexOf("\\");
    let id = folderName.substr(index + 1);
    divNode3.innerHTML = id;
}

function choose(folderName) {
    logHelper("folderName", folderName);
    emptyDiv(folderName);
    window.api.receiveOnce("sendFolderPictures", (data) => {
        try{
            let resultObject = JSON.parse(data);
            let picturesArray = resultObject["transferArray"];
            for (let pictureName of picturesArray) {
                addPicture(pictureName, "images");
            }
            window.api.receiveOnce("sendFolderPictures", (data) => {
                let resultObject = JSON.parse(data);
                let picturesArray = resultObject["transferArray"];
                logHelper("picturesArray", picturesArray[0]);
                for (let pictureName of picturesArray) {
                    addPicture(pictureName, "images2");
                }
            });
            window.api.send("requestFolderPictures", folderName, "predicted_raw_collection");
        } catch(err){
            throw err;
        }
    });
    window.api.send("requestFolderPictures", folderName, "database_people");
}

function startSelect() {
    currentlySelecting = true;
    console.log(`Currently selecting.`);
}

function endSelect() {
    currentlySelecting = false;
    console.log(`Currently not selecting.`);

}

function selectImage(src, imgElement) {
    if (currentlySelecting) {
        //pane pilt faili
        window.api.send("sendFileName", src);
        //muuda css klass
        changeStyle(imgElement);
    }
}

function changeStyle(imgElement) {
    console.log(`Changing style of element.`);
    imgElement.classList.toggle('selected');
    console.log(`Toggled class selected`);

}
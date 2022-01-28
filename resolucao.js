const fs = require('fs')
const {promisify} = require('util')

const readFilePromise = promisify(fs.readFile)
const writeFilePromise = promisify(fs.writeFile)

var adjustedJson
var dataJson

// node js documentation 
fs.readFile('./broken-database.json',(err,dataString)=>{

    if(err) {
        console.log('Failed to read the file')
        return false
    }

    else {
        dataJson = JSON.parse(dataString)
        fixedName()
        fixedPrice()
        fixedQuantity()
        organizerObjs()
    }
})

function fixedName() {

    for(var element in dataJson ) {
        var corretName;
        var nameErr = dataJson[element].name
        nameErr = nameErr.replaceAll('ß','b') // w3 school
        nameErr = nameErr.replaceAll('æ','a')
        nameErr = nameErr.replaceAll('¢','c')
        nameErr = nameErr.replaceAll('ø','o')

        var words =  nameErr.split(' ')
        for(index in words) {
            const word = words[index]
            if(word === 'com' || word === 'de' || word === 'e') {
                words.splice(index,1,word)
            }
            else {
                const capitalizeWord = word.charAt(0).toUpperCase() + word.slice(1)
                words.splice(index,1,capitalizeWord)
            }
        }
        nameErr = words.join(' ')
        dataJson[element].name = nameErr
    }
}

function fixedPrice() {
    for(var element in dataJson) {
        var priceErr = dataJson[element].price
        priceErr = parseFloat(priceErr)  // w3 school

        dataJson[element].price = priceErr 
    }
}

function fixedQuantity() {
    for(element in dataJson) {

        const quantityItem = dataJson[element].quantity
        if(quantityItem === undefined) {
            const item = dataJson[element]

            const {id,name,price,category} = item
            
            const correctObj = {
                id:id,
                name:name,
                quantity:0,
                price:price,
                category:category
            }

            dataJson.splice(element,1,correctObj)
        }
    }
    // https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js 

    fs.stat("./saida.json", (err, stats) => { 
        const stringDataJson = JSON.stringify(dataJson,null,2)
        // https://www.geeksforgeeks.org/node-js-fs-stat-method/
        if(stats) {
            writeFilePromise('saida.json',stringDataJson,(err)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        else {
            const stringDataJson = JSON.stringify(dataJson,null,2)
            writeFilePromise('saida.json',stringDataJson,(err)=>{
                if(err){
                    console.log(err)
                }
            })
        }
    });
}

async function organizerObjs(){ // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    adjustedJson = await readFilePromise('./saida.json',(err)=>{}); // https://www.geeksforgeeks.org/node-js-fs-readfilesync-method/
    if(adjustedJson === 'undefined') {
        return console.log('The file was not finded')
    }

    adjustedJson = await JSON.parse(adjustedJson)

    adjustedJson.sort((a,b)=>{
        const categoryA = a.category
        const categoryB = b.category

        const idA = a.id
        const idB = a.id

        if(categoryA > categoryB) {
            return 1
        }

        else if(categoryA < categoryB) {
            return -1 
        }

        else {
            if(idA > idB) {
                return 1
            }
            if(idA < idB) {
                return -1
            }
        }
    })
    fs.writeFile("saida.json", JSON.stringify(adjustedJson,null,2), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    })
}


function calculateTotalPrice() {

    var priceAcessories = priceElectronics = priceHomeAppliences = pricePan = 0
   // preco dos accesorios = preco do Eletronicos = precos eletrodomesticos = preco das panelas

    for(var element in adjustedJson) {
        const priceElement = adjustedJson[element].price
        const categoryElement = adjustedJson[element].category

        switch(categoryElement) {
            case 'Acessórios':
                priceAcessories+=priceElement
                break
            case 'Eletrodomésticos':
                priceHomeAppliences+=priceElement
                break
            case 'Eletrônicos':
                priceElectronics+=priceElement
                break
            case 'Panelas' :
                pricePan +=priceElement
                break
            default :
                console.log('There is nothing category to correspind with this product')
        }
    }
}
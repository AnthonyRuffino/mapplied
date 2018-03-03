/* jshint node:true *//* global define, escape, unescape */
'use strict';


var Mapplied = {};
Mapplied.universe = {};

Mapplied.hasher = null;
Mapplied.guid = null;

Mapplied.universe.name = "Mason Williams Ruffino was born June 9th 2007";
Mapplied.universe.hash = null;
Mapplied.universe.hashAnalysis = null;

Mapplied.universe.maxIntSize = 9007199254740992;

Mapplied.universe.sectorLength = 1000;
Mapplied.universe.horizontalSquaredMultiplier = 0;
Mapplied.universe.horizontalLinearMultiplier = 0;
Mapplied.universe.defaultHorizontalSectors = 10;

Mapplied.universe.sectorHeight = 1000;
Mapplied.universe.verticalSquaredMultiplier = 0;
Mapplied.universe.verticalLinearMultiplier = 0;
Mapplied.universe.defaultVerticalSectors = 10;

Mapplied.universe.sectorViewScopeX = 4;
Mapplied.universe.sectorViewScopeY = 4;





var dictionary = {};
dictionary.biome0 = 'Water';
dictionary.biome1 = 'Lava';
dictionary.biome2 = 'Desert';
dictionary.biome3 = 'Swamp';
dictionary.biome4 = 'Badlands';
dictionary.biome5 = 'Industrial';
dictionary.biome6 = 'Forest';
dictionary.biome7 = 'Prairie';
dictionary.biome8 = 'Suburb';
dictionary.biome9 = 'City';







Mapplied.getUniverse = function() {
    return Mapplied.universe;
};
   
Mapplied.getQuadrantAsPlainSpeak = function(request) {
    
    var quadrant = request.quadrant;
    
    var returnObject = {};
    returnObject.universeName = Mapplied.universe.name;
    
    returnObject.quadrantHash = quadrant.hash;
    returnObject.quadrantNumber = quadrant.quadrantNumber;
    returnObject.coordinates = request.coordinates;
    
    returnObject.populationDensity = quadrant.biomes.populationDensity;
    returnObject.biome1 = dictionary['biome' + quadrant.biomes.biome1.code];
    returnObject.biome2 = dictionary['biome' +quadrant.biomes.biome2.code];
    returnObject.biome3 = dictionary['biome' +quadrant.biomes.biome3.code];
    returnObject.biome4 = dictionary['biome' +quadrant.biomes.biome4.code];
    
    returnObject.dimentions = quadrant.dimentions;
    
    returnObject.sectors = quadrant.sectors;

    
    return returnObject;
}


Mapplied.defaultCoordinates = {x:100,y:100};

Mapplied.getCoordinates = function(params, quadrant) {
    var coordinates = {};
    
    var valuesWerePassed = params.x !== undefined && params.x != null && params.y !== undefined && params.y != null;
    
    var xCoordinate = Mapplied.defaultCoordinates.x;
    var yCoordinate = Mapplied.defaultCoordinates.y;

    if(valuesWerePassed){
        xCoordinate = parseInt(params.x);
        yCoordinate = parseInt(params.y);
        
        if(isNaN(xCoordinate) || isNaN(yCoordinate)){
            xCoordinate = Mapplied.defaultCoordinates.x;
            yCoordinate = Mapplied.defaultCoordinates.y;
        }else{
            xCoordinate = Mapplied.compensateCoordinate(xCoordinate, quadrant.dimentions.sectorColumnCount);
            yCoordinate = Mapplied.compensateCoordinate(yCoordinate, quadrant.dimentions.sectorRowCount);
        }
    }
    
    coordinates.x = xCoordinate;
    coordinates.y = yCoordinate;
    
    return coordinates;
}

Mapplied.compensateCoordinate = function(val, bound){
    var returnValue = val;
    
    var isNegative = returnValue < 0;
    
    if(isNegative){
        returnValue = Math.abs(returnValue);
    }
    
    if(returnValue > bound){
        var divFloor = Math.floor(returnValue/bound);
        returnValue = returnValue - (bound * divFloor);
        
        if(returnValue === 0){
            if(isNegative){
                returnValue = 1;
            }else{
                returnValue = bound;
            }
        }else if(isNegative){
            returnValue = bound - returnValue + 1;
        }
        
        return returnValue;//Mapplied.compensateCoordinate(returnValue, bound);
    }
    
    if(returnValue === 0){
        if(isNegative){
            returnValue = bound;
        }else{
            returnValue = 1;
        }
    }else if(isNegative){
        returnValue = bound - returnValue + 1;
    }
    
    return returnValue;
}

Mapplied.getQuadrant = function(params) {
    
    var quadrantNumber = null;
    if(params.q !== undefined && params.q != null){
        quadrantNumber = parseInt(params.q);
    }
    
    
    
    var validQuadrantNumberPassed = !(quadrantNumber === undefined || quadrantNumber === null || isNaN(quadrantNumber));
    
    var isPlainSpeak = parseInt(params.isPlainSpeak);
    
    var quadrantName = params.name;
    var quadrantIsNamed = (quadrantName !== undefined && quadrantName !== null);
    
    var quadrant = {};
    
    
    var keyToAppendForHash = "undetermined";
        
    if(validQuadrantNumberPassed && !quadrantIsNamed){
        keyToAppendForHash = quadrantNumber;
    }else if(quadrantIsNamed && validQuadrantNumberPassed){
        keyToAppendForHash = quadrantName + ":" + quadrantNumber;
    }else if(!quadrantIsNamed && !validQuadrantNumberPassed){
        keyToAppendForHash = NaN;
        quadrantNumber = 0;
    }else if(quadrantIsNamed && !validQuadrantNumberPassed){
        keyToAppendForHash = quadrantName;
        quadrantNumber = 0;
    }
    
    quadrant.hash = Mapplied.hasher.hash(Mapplied.universe.hash + ":" + keyToAppendForHash);
    
    
    quadrant.quadrantNumber = quadrantNumber;
    quadrant.hashAnalysis = Mapplied.getHashAnalysis(quadrant.hash);
    
    quadrant.dimentions = Mapplied.getDimentions(quadrantNumber);
    quadrant.biomes = Mapplied.getBiomes({quadrant:quadrant});
    //this needs to return only near-by sectors.  It should default to 1,1.  You should be able to specify only loading sectors in certain directions.  Or only loading sectors not in  agiven set.
    
    
    var coordinates = Mapplied.getCoordinates(params, quadrant);
    var direction = {xDelta:params.xDelta, yDelta:params.yDelta};
    
    quadrant.sectors = Mapplied.getSectors({quadrant:quadrant, coordinates:coordinates, direction:direction});
    
    if(isPlainSpeak == 1){
        return Mapplied.getQuadrantAsPlainSpeak({quadrant:quadrant,coordinates:coordinates});
    }else{
        return {coordinates:coordinates,quadrant:quadrant};
    }
    
};



Mapplied.getDimentions = function (q) {
    var dimentions = {};
    
    var quadrantNumber = 0;
    
    if(q !== undefined){
        quadrantNumber = parseInt(q);
    }

    if(quadrantNumber === 0){
        dimentions.quadrantLength = Mapplied.universe.sectorLength * Mapplied.universe.defaultHorizontalSectors;
        dimentions.quadrantHeight = Mapplied.universe.sectorHeight * Mapplied.universe.defaultVerticalSectors;
        
        dimentions.sectorRowCount = Mapplied.universe.defaultHorizontalSectors;
        dimentions.sectorColumnCount = Mapplied.universe.defaultVerticalSectors
    }else{
        var lengthScale = Mapplied.universe.defaultHorizontalSectors;
        if(Mapplied.universe.horizontalSquaredMultiplier !== 0 || Mapplied.universe.horizontalLinearMultiplier !== 0){
            lengthScale = lengthScale* (Mapplied.universe.horizontalSquaredMultiplier * Math.pow(quadrantNumber,2) + Mapplied.universe.horizontalLinearMultiplier * Math.abs(quadrantNumber));
        }
        dimentions.quadrantLength = Mapplied.universe.sectorLength * lengthScale;
        dimentions.sectorColumnCount = Math.ceil(lengthScale);
        
        var heightScale = Mapplied.universe.defaultVerticalSectors;
        if(Mapplied.universe.verticalSquaredMultiplier !== 0 || Mapplied.universe.verticalLinearMultiplier !== 0){
            heightScale = heightScale * (Mapplied.universe.verticalSquaredMultiplier * Math.pow(quadrantNumber,2) + Mapplied.universe.verticalLinearMultiplier * Math.abs(quadrantNumber));
        }
        dimentions.quadrantHeight = Mapplied.universe.sectorHeight * heightScale;
        dimentions.sectorRowCount = Math.ceil(heightScale);
    }
    
    return dimentions;
};

Mapplied.getSectors = function (request) {
    var sectors = {};
    var quadrant = request.quadrant;
    
    var coordinates = request.coordinates;
    var direction = request.directions;
    
    var directionIncluded = direction !== undefined && direction !== null;
    
    var xDelta = 0;
    var yDelta = 0;
    
    if(directionIncluded){
        
        yDelta = parseInt(direction.yDelta);
        xDelta = parseInt(direction.xDelta);
        
        if(xDelta === undefined || xDelta === null || isNaN(xDelta)){
            xDelta = 0;
        }
        
        if(yDelta === undefined || yDelta === null || isNaN(yDelta)){
            yDelta = 0;
        }
        
        if(xDelta === 0 && yDelta === 0){
            directionIncluded = false;
        }
    }
    
    var xScope = Mapplied.universe.sectorViewScopeX;
    var yScope = Mapplied.universe.sectorViewScopeY;
    
    if(xScope > (quadrant.dimentions.sectorColumnCount/2)){
        xScope = Math.floor(quadrant.dimentions.sectorColumnCount/2);
    }
    
    if(yScope > (quadrant.dimentions.sectorRowCount/2)){
        yScope = Math.floor(quadrant.dimentions.sectorRowCount/2);
    }
    
    if(directionIncluded === false){
        
        var secRowNum = 1;
        var secColNum = 1;
        var sector = {};
        
        for(secColNum = coordinates.x; secColNum <= coordinates.x + xScope; secColNum++){
            sector.x = Mapplied.compensateCoordinate(secColNum, quadrant.dimentions.sectorColumnCount);
            
            for(secRowNum = coordinates.y; secRowNum <= coordinates.y + yScope; secRowNum++){
                sector.y = Mapplied.compensateCoordinate(secRowNum, quadrant.dimentions.sectorRowCount);
                sector.hash = Mapplied.hasher.hash(quadrant.hash + ":" + sector.x + "," + sector.y);
                var hashAnalysis = Mapplied.getHashAnalysis(sector.hash);
                sector.biomes = getChildBiomes({x:sector.x, y:sector.y, parent:quadrant, hashAnalysis:hashAnalysis});
                sectors[sector.x + "," + sector.y] = {x:sector.x, y: sector.y, hash:sector.hash, biomes:sector.biomes};
            }

            
            for(secRowNum = coordinates.y - 1; secRowNum >= coordinates.y - yScope; secRowNum--){
                
                var secRowNumToUse = secRowNum;
                
                if(secRowNumToUse <= 0){
                    secRowNumToUse = secRowNumToUse - 1;
                }
                
                sector.y = Mapplied.compensateCoordinate(secRowNumToUse, quadrant.dimentions.sectorRowCount);
                sector.hash = Mapplied.hasher.hash(quadrant.hash + ":" + sector.x + "," + sector.y);
                hashAnalysis = Mapplied.getHashAnalysis(sector.hash);
                sector.biomes = getChildBiomes({x:sector.x, y:sector.y, parent:quadrant, hashAnalysis:hashAnalysis});
                sectors[sector.x + "," + sector.y] = {x:sector.x, y: sector.y, hash:sector.hash, biomes:sector.biomes};
            }
       }
       
       
       for(secColNum = coordinates.x - 1; secColNum >= coordinates.x - xScope; secColNum--){
           var secColNumToUse = secColNum;
                
            if(secColNumToUse <= 0){
                secColNumToUse = secColNumToUse - 1;
            }
            
           sector.x = Mapplied.compensateCoordinate(secColNumToUse, quadrant.dimentions.sectorColumnCount);
            for(secRowNum = coordinates.y; secRowNum <= coordinates.y + yScope; secRowNum++){
                sector.y = Mapplied.compensateCoordinate(secRowNum, quadrant.dimentions.sectorRowCount);
                sector.hash = Mapplied.hasher.hash(quadrant.hash + ":" + sector.x + "," + sector.y);
                hashAnalysis = Mapplied.getHashAnalysis(sector.hash);
                sector.biomes = getChildBiomes({x:sector.x, y:sector.y, parent:quadrant, hashAnalysis:hashAnalysis});
                sectors[sector.x + "," + sector.y] = {x:sector.x, y: sector.y, hash:sector.hash, biomes:sector.biomes};
            }
            
            
            
            for(secRowNum = coordinates.y - 1; secRowNum >= coordinates.y - yScope; secRowNum--){
                
                secRowNumToUse = secRowNum;
                
                if(secRowNumToUse <= 0){
                    secRowNumToUse = secRowNumToUse - 1;
                }
                
                sector.y = Mapplied.compensateCoordinate(secRowNumToUse, quadrant.dimentions.sectorRowCount);
                sector.hash = Mapplied.hasher.hash(quadrant.hash + ":" + sector.x + "," + sector.y);
                hashAnalysis = Mapplied.getHashAnalysis(sector.hash);
                sector.biomes = getChildBiomes({x:sector.x, y:sector.y, parent:quadrant, hashAnalysis:hashAnalysis});
                sectors[sector.x + "," + sector.y] = {x:sector.x, y: sector.y, hash:sector.hash, biomes:sector.biomes};
            }
       }
    }else{
        
    }
   
   return sectors;
};

function getChildBiomes(request) {
    
    var x = request.x;
    var y = request.y;
    var parent = request.parent;
    var hashAnalysis = request.hashAnalysis;
    
    var biomes = {};
    biomes.populationDensity = 0;
    
    if(x == 1 && y == 1){
        biomes.populationDensity += parent.biomes.populationDensity;
        
        for(var i = 1; i < 5; i++){
            biomes["biome" + i] = {};
            biomes["biome" + i].code = parent.biomes["biome" + i].code;
            biomes["biome" + i].code = parent.biomes["biome" + i].code;
        }
    }
    else{
        var j = 1;
        
        for(var i = 1; i < 5; i++){
            
            var probabilityStat  = hashAnalysis.numbers[j].val * 10;
            j++;
            probabilityStat += hashAnalysis.numbers[j].val;
            j++;
            
                
            biomes["biome" + i] = {};
            
            if(probabilityStat < 50){
                biomes["biome" + i].code = parseInt(parent.biomes["biome" + 1].code);
            }
            else if(probabilityStat < 80){
                biomes["biome" + i].code = parseInt(parent.biomes["biome" + 2].code);
            }
            else if(probabilityStat < 95){
                biomes["biome" + i].code = parseInt(parent.biomes["biome" + 3].code);
            }
            else{
                biomes["biome" + i].code = parseInt(parent.biomes["biome" + 4].code);
            }
            
            biomes.populationDensity += parseInt(biomes["biome" + i].code);
        }
    }
    
    return biomes;
};

Mapplied.getBiomes = function (request) {
    var biomes = {};
    biomes.populationDensity = 0;
    
    var quadrant = request.quadrant;
    
    for(var i = 1; i < 5; i++){
        biomes["biome" + i] = {};
        biomes["biome" + i].code = parseInt(quadrant.hashAnalysis.numbers[i].val);
        biomes["biome" + i].depth = quadrant.hashAnalysis.numbers[i].depth;
        biomes.populationDensity += biomes["biome" + i].code;
    }
    
    return biomes;
};




Mapplied.getHashAnalysis =  function (hash) {
    var analysis = {};
    analysis.hash = hash;
    analysis.numberCount = 0;
    analysis.letterCount = 0;
    
    analysis.numbers = {};
    analysis.letters = {};
    
    for (var i = 0, len = hash.length; i < len; i++) {
      if(isNumeric(hash[i])){
          analysis.numberCount++;
          analysis.numbers[analysis.numberCount] = {val: parseInt(hash[i]), depth:i};
      }
      else{
          analysis.letterCount++;
          analysis.letters[analysis.letterCount] = {val: hash[i], depth:i};
      }
    }
    
    return analysis;
};





function isNumeric(str){
    return /^\d+$/.test(str);
}







Mapplied.init = function(hasher, guid) {
    Mapplied.hasher = hasher;
    Mapplied.guid = guid;
    Mapplied.universe.hash = hasher.hash(Mapplied.universe.name);
    Mapplied.universe.hashAnalysis = Mapplied.getHashAnalysis(Mapplied.universe.hash);
};




Mapplied.setHorizontalLinearMultiplier = function(horizontalLinearMultiplier) {
    if(horizontalLinearMultiplier !== undefined && horizontalLinearMultiplier !== null && horizontalLinearMultiplier > 0){
        Mapplied.horizontalLinearMultiplier = horizontalLinearMultiplier;
        return {success:true};
    }
    
    return {success:false};
};
Mapplied.setHorizontalSquaredMultiplier = function(horizontalSquaredMultiplier) {
    if(horizontalSquaredMultiplier !== undefined && horizontalSquaredMultiplier !== null && horizontalSquaredMultiplier > 0){
        Mapplied.horizontalSquaredMultiplier = horizontalSquaredMultiplier;
    }
};





try {
    exports.init = Mapplied.init;
    exports.getUniverse = Mapplied.getUniverse;
    exports.getQuadrant = Mapplied.getQuadrant;
    
    
    exports.setHorizontalLinearMultiplier = Mapplied.setHorizontalLinearMultiplier;
    exports.setHorizontalSquaredMultiplier = Mapplied.setHorizontalSquaredMultiplier;
}
catch(err) {
    console.log('Could ot load exports in the current context', err);
}
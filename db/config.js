//var detailsMode = false;
var logingMode = false;

// /**
//  * 
//  * @param mode This parameter is used to set the output format of the query result.
//  */
// function setDetailsMode(mode) {
//     if (typeof mode !== 'boolean') throw new Error('Invalid parameter type. Expected boolean.');
//     detailsMode = mode;
// }

/**
 * 
 * @param mode This parameter is used to set the loging mode of the query result.
 */
function setLogingMode(mode) {
    if (typeof mode !== 'boolean') throw new Error('Invalid parameter type. Expected boolean.');
    logingMode = mode;
}

/**
 * This function is used to get the current output format of the query result.
 */
module.exports = {
    get: {
        //detailsMode: () => detailsMode,
        logingMode: () => logingMode
    },
    set: {
        //detailsMode: setDetailsMode,
        logingMode: setLogingMode
    }
}
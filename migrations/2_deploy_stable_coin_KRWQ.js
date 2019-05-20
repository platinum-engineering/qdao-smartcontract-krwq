const KRWQToken = artifacts.require("./KRWQToken/KRWQToken.sol");

require('dotenv').config();
const delay = require('delay/index');

const paused = parseInt( process.env.DELAY_MS || "5" );

const firstAddress = process.env.ADDRESS_FIRST_OWNER;
const secondAddress =  process.env.ADDRESS_SECOND_OWNER;
const thirdAddress =  process.env.ADDRESS_THIRD_OWNER;
const fourthAddress =  process.env.ADDRESS_FOURTH_OWNER;
const fifthAddress =  process.env.ADDRESS_FIFTH_OWNER ;

const wait = async (param) => {console.log("Delay " + paused); await delay(paused); return param;};

module.exports = function(deployer) {
    deployer.then(async () => {
        await wait();

        await wait(await deployer.deploy(KRWQToken, firstAddress, secondAddress, thirdAddress, fourthAddress, fifthAddress));
    });
};

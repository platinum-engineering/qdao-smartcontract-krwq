// test/.KRWQToken_Test.js
const KRWQToken = artifacts.require("KRWQToken");

const ETHER = 10**18;
const TOKEN = 10**18;


contract("KRWQToken", accounts => {

     const [firstAccount,
            secondAccount,
            thirdaccount,
            fourthaccount,
            fifthaccount,
            firstOwner,
            secondOwner,
            thirdOwner,
            fourthOwner,
            fifthOwner] = accounts;

    let stablecoin;

    beforeEach(async () => {
        stablecoin = await KRWQToken.new(firstOwner, secondOwner, thirdOwner, fourthOwner, fifthOwner);
    });

    it("#1 should initialize correctly", async () => {

        assert.equal(await stablecoin.symbol.call(), "KRWQ_copy");
        assert.equal(await stablecoin.name.call(), "KRWQ_copy Stablecoin by Q DAO v1.0");

        let DEC = await stablecoin.decimals.call()
        console.log("      DECIMALS -  " + web3.toBigNumber(DEC).toString())
        let OWNER_LIMIT = await stablecoin.howManyOwnersDecide.call()
        console.log("      How Many Owners Decide - " + web3.toBigNumber(OWNER_LIMIT).toString())

        const newTokenBalance = web3.eth.getBalance(stablecoin.address);
        console.log("      Init balance - " + web3.toBigNumber(newTokenBalance).toString() )
    });


    it("#2 should transfer to Ownerships", async () => {
        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: firstOwner})

        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: fourthOwner})

        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
        try {
            await stablecoin.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: firstAccount})

        try {
            await stablecoin.transferOwnership(secondOwner, secondAccount, {from: secondOwner})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await stablecoin.transferOwnership(secondOwner, secondAccount, {from: thirdaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await stablecoin.transferOwnership(secondOwner, secondAccount, {from: fourthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await stablecoin.transferOwnership(secondOwner, secondAccount, {from: fifthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await stablecoin.transferOwnership(secondOwner, secondAccount, {from: secondAccount})
    });


    it("#3 should be created 1000 stableCoins", async () => {
        try {
            await stablecoin.mint(firstOwner, 1000*ETHER, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstOwner});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstAccount});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: thirdOwner});

        try {
            await stablecoin.mint(firstOwner, 1000*TOKEN, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: fourthOwner});

        await stablecoin.mint(firstOwner, 1000*TOKEN, {from: firstOwner});
        assert.equal(await stablecoin.totalSupply.call(), 1000*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(firstOwner), 1000*TOKEN);
    });


    it("#4 should be born 1000 stableCoins", async () => {

        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstOwner});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstAccount});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: thirdOwner});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: fourthOwner});

        await stablecoin.mint(secondAccount, 777*TOKEN, {from: firstOwner});
        assert.equal(await stablecoin.totalSupply.call(), 777*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(secondAccount), 777*TOKEN);

        try {
            await stablecoin.burnFrom(secondAccount, 778*TOKEN, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await stablecoin.burnFrom(secondAccount, 777*TOKEN, {from: firstOwner});

        assert.equal(await stablecoin.totalSupply.call(), 0);
        assert.equal(await stablecoin.balanceOf.call(secondAccount), 0);
    });


    it("#5 does not allow non-owners to call",  async () => {
        assert.equal(await stablecoin.totalSupply.call(), 0);

        try {
            await stablecoin.pause({from:secondAccount});
            await stablecoin.addAddressToGovernanceContract(thirdaccount, {from: thirdaccount});
            await stablecoin.removeAddressFromGovernanceContract(firstOwner, {from: fourthaccount});
            await stablecoin.transferOwnership(secondOwner, fifthaccount, {from: fifthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
    });

    it("#6 DAO should be blocked/unblocked account and blocked/unblocked tokens", async () => {

        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstOwner});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: firstAccount});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: thirdOwner});
        await stablecoin.addAddressToGovernanceContract(firstOwner, {from: fourthOwner});

        await stablecoin.mint(secondAccount, 666*TOKEN, {from: firstOwner});
        assert.equal(await stablecoin.totalSupply.call(), 666*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(secondAccount), 666*TOKEN);

        await stablecoin.transfer(thirdaccount, 333*TOKEN, {from: secondAccount});
        assert.equal(await stablecoin.balanceOf.call(secondAccount), 333*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(thirdaccount), 333*TOKEN);

        await stablecoin.addAddressToBlacklist(thirdaccount, {from: firstOwner});

        try {
            await stablecoin.transfer(fourthaccount, 222*TOKEN, {from: thirdaccount});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await stablecoin.removeAddressFromBlacklist(thirdaccount, {from: firstOwner});
        await stablecoin.transfer(fourthaccount, 222*TOKEN, {from: thirdaccount});
        assert.equal(await stablecoin.balanceOf.call(secondAccount), 333*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(thirdaccount), 111*TOKEN);
        assert.equal(await stablecoin.balanceOf.call(fourthaccount), 222*TOKEN);

        assert.equal(await stablecoin.totalSupply.call(), 666*TOKEN);
    });


    it("#7 fourth owner cannot change the voting parameters", async () => {

        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: firstOwner})
        assert.equal(await stablecoin.isOwner(secondOwner), true);
        assert.equal(await stablecoin.isOwner(secondAccount), false);

        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: fourthOwner})
        assert.equal(await stablecoin.isOwner(secondOwner), true);
        assert.equal(await stablecoin.isOwner(secondAccount), false);

        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
        assert.equal(await stablecoin.isOwner(secondOwner), true);
        assert.equal(await stablecoin.isOwner(secondAccount), false)

        assert.equal(await stablecoin.allOperationsCount(), 1);

        await stablecoin.transferOwnership(thirdaccount, firstOwner, {from: secondOwner})

        assert.equal(await stablecoin.allOperationsCount(), 2);
        assert.equal(await stablecoin.isOwner(secondOwner), true);
        assert.equal(await stablecoin.isOwner(secondAccount), false);

        assert.equal(await stablecoin.isOwner(thirdaccount), false);
        assert.equal(await stablecoin.isOwner(firstOwner), true);


        await stablecoin.transferOwnership(secondAccount, secondOwner, {from: secondOwner});

        assert.equal(await stablecoin.allOperationsCount(), 1);
        assert.equal(await stablecoin.isOwner(secondOwner), false);
        assert.equal(await stablecoin.isOwner(secondAccount), true);

        assert.equal(await stablecoin.isOwner(thirdaccount), false);
        assert.equal(await stablecoin.isOwner(firstOwner), true);

        try {
            await stablecoin.transferOwnership(secondOwner, secondAccount, {from: secondOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
    });
});
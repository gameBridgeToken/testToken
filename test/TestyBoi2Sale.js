
var TestyBoi2Sale = artifacts.require("./TestyBoi2Sale.sol");
var TestyBoi2 = artifacts.require("./TestyBoi2.sol")

contract('TestyBoi2Sale', function(accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var numberOfTokens;

    it('inits contract with correct values', function() {
        return TestyBoi2Sale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has addresss')
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract addresss')
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price, tokenPrice, 'token price is correct')
        })    
    });

    it('facilitates buying of tokens', function() {
        return TestyBoi2.deployed().then(function(instance){
            // first token Instance
            tokenInstance = instance;
            return TestyBoi2Sale.deployed();
        }).then(function(instance) {
            // then grab token SALE instance
            tokenSaleInstance = instance
            // give 75% tokens to sale contract
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) { 
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {   
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            // try to buy tokens different from ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "msg.value must equal tokens in wei");
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "cannont purchase more tokens then available");
        })
    });

    it('ends token sale', function() {
        return TestyBoi2.deployed().then(function(instance){
            // first token Instance
            tokenInstance = instance;
            return TestyBoi2Sale.deployed();
        }).then(function(instance) {
            // then grab token SALE instance
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "must be admin to end sale");
            return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin')
            // check the price is reset when destoryed
            balance = web3.eth.getBalance(tokenSaleInstance.address)
            return balance
        }).then(function(balance){
            assert.equal(balance, 0, )   
        })    
           
        
    });
});
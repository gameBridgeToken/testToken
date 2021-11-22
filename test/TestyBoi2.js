
var TestyBoi2 = artifacts.require("./TestyBoi2.sol")

contract('TestyBoi2', function(accounts) {
    
    it('sets total supply on deploy', function() {
        return TestyBoi2.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000')
        })
    })
})
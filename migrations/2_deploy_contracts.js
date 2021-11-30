const TestyBoi2 = artifacts.require("./TestyBoi2.sol");
const TestyBoi2Sale = artifacts.require("./TestyBoi2Sale.sol")

module.exports = function (deployer) {
  deployer.deploy(TestyBoi2, 1000000).then(function(){
    // token price is .001
    var tokenPrice = 1000000000000000;
    return deployer.deploy(TestyBoi2Sale, TestyBoi2.address, tokenPrice);
  });
  
};
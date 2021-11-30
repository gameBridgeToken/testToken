
App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function () {
        console.log("app initialized...")
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.provider.HttpProvider("http://localhost:7545");
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("TestyBoi2Sale.json", function (TestyBoi2Sale) {
            App.contracts.TestyBoi2Sale = TruffleContract(TestyBoi2Sale)
            App.contracts.TestyBoi2Sale.setProvider(App.web3Provider);
            App.contracts.TestyBoi2Sale.deployed().then(function (TestyBoi2Sale) {
                console.log("TestyBoi2 Sale Addy:", TestyBoi2Sale.address)
            })
        }).done(function () {
            $.getJSON("TestyBoi2.json", function (TestyBoi2) {
                App.contracts.TestyBoi2 = TruffleContract(TestyBoi2)
                App.contracts.TestyBoi2.setProvider(App.web3Provider);
                App.contracts.TestyBoi2.deployed().then(function (TestyBoi2) {
                    console.log("TestyBoi2 Addy:", TestyBoi2.address)
                })
                App.listenForEvents();
                return App.render();
            })

        })
    },

    listenForEvents: function () {
        App.contracts.TestyBoi2Sale.deployed().then(function (instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function (error, event) {
                console.log('event triggered', event);
                App.render();
            })
        })
    },

    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;

        const loader = $('#loader');
        const content = $('#content');

        loader.show();
        content.hide();

        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                console.log(account)
                App.account = account;
                $('#accountAddress').html("Your Account: " + account)
            }
        });

        App.contracts.TestyBoi2Sale.deployed().then(function (instance) {
            TestyBoi2SaleInstance = instance;

            return TestyBoi2SaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            // console.log(App.tokenPrice)
            App.tokenPrice = tokenPrice;
            // console.log(App.tokenPrice)
            $(".token-price").html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return TestyBoi2SaleInstance.tokensSold();
        }).then(function (tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            App.contracts.TestyBoi2.deployed().then(function (instance) {
                TestyBoi2Instance = instance;
                return TestyBoi2Instance.balanceOf(App.account);

            }).then(function (balance) {
                console.log("bal", balance)
                $('.testyBoi-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            })
        });

    },

    buyTokens: function () {
        $('#content').hide();
        $('#loader').show();

        let numberOfTokens = $('#numberOfTokens').val();
        App.contracts.TestyBoi2Sale.deployed().then(function (instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function (result) {
            console.log("tokens bought ....");
            $('form').trigger('reset');
            // wait for sell event
        })
    }

}

$(function () {
    $(window).load(function () {
        App.init();
    })
})